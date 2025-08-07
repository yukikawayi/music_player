<template>
  <div class="container">
    <div class="album">
      <img :src="`data:jpeg;base64,${album_info.cover}`" />
      <h2>{{ album_info.title }}</h2>
      <h4>{{ album_info.artist }}</h4>
      <table>
        <tr>
          <td>年份<br />{{ album_info.year }}</td>
          <td>碟数<br />{{ album_info.discs.length }}</td>
          <td>音轨<br />{{ album_info.tracks }}</td>
          <td>
            <button
              @click="
                () => {
                  choiseTracks = true;
                }
              "
            >
              批量
            </button>
          </td>
        </tr>
      </table>
    </div>
    <!--批量选择控制-->
    <span v-if="choiseTracks" @click="choiseAllTracksOrNot">○</span>
    <span v-if="choiseTracks">全选</span>
    <table>
      <tr class="bar" v-if="choiseTracks">
        <td
          @click="
            async () => {
              choiseSongsheet = true;
              await getAllSongsheets();
            }
          "
          style="width: 200px"
        >
          添加到
        </td>
        <td
          @click="
            () => {
              choiseTracks = false;
              choiseAll = false;
              initSongsChoisedState();
            }
          "
        >
          取消
        </td>
      </tr>
    </table>

    <!---->
    <div class="song" v-for="n in album_info.discs">
      <p>
        <strong>disc{{ n }}</strong>
      </p>
      <table>
        <template v-for="item in songs">
          <tr
            v-if="item.disc == n"
            @dblclick="dbclickToPlay(item, this.songs)"
            ref="tracks"
          >
            <!-- :class="isHighlight(item)" -->
            <td
              @click="choiseSingleOrCancel(item, songs)"
              style="width: 50px; height: 50px"
              v-if="choiseTracks"
              :class="changeClass(item)"
            >
              ○
            </td>
            <td style="width: 50px">{{ item.track }}</td>
            <td style="width: 300px">{{ item.title }}</td>
            <td style="width: 300px">{{ item.artist }}</td>
          </tr>
        </template>
      </table>
      <p></p>
    </div>
    <!--选择歌单部分-->
    <div class="choiseSongsheet" v-if="choiseSongsheet">
      <span @click="choiseAllSongsheetsOrNot">○</span>
      <span>全选</span>
      <div class="songsheet">
        <table>
          <tr v-for="item in songsheets">
            <td
              style="width: 50px; height: 50px"
              :class="songsheetItemClass(item)"
              @click="choiseSongsheetOrNot(item, songsheets)"
            >
              ○
            </td>
            <td style="width: 200px; height: 50px">{{ item.name }}</td>
          </tr>
        </table>
      </div>
      <span @click="addToChoisedSongsheets">添加</span>
      <span
        @click="
          () => {
            choiseSongsheet = false;
            choiseAllSongsheets = false;
          }
        "
        >取消</span
      >
    </div>
  </div>
  <!-- 选择歌单界面 -->
  <div class="choiseSongsheet" v-if="choiseSongsheet">
    <span @click="choiseAllSongsheetsOrNot">○</span>
    <span>全选</span>
    <div class="songsheet">
      <table>
        <tr v-for="item in songsheets">
          <td
            style="width: 50px; height: 50px"
            :class="songsheetItemClass(item)"
            @click="choiseSongsheetOrNot(item, songsheets)"
          >
            ○
          </td>
          <td style="width: 200px; height: 50px">{{ item.name }}</td>
        </tr>
      </table>
    </div>
    <span @click="addToChoisedSongsheets">添加</span>
    <span
      @click="
        () => {
          choiseSongsheet = false;
          choiseAllSongsheets = false;
        }
      "
      style="float: right"
      >取消</span
    >
  </div>
</template>
<script>
// import setting from'../config.json';
export default {
  inject: [
    "audioElement",
    "setSrc",
    "isPlaying",
    "playList",
    "index",
    "setPlayList",
    "setIndex",
    "invertPlayState",
    "makeisPlayingTrue",
    "folder",
    "dbclickToPlay",
  ],
  props: ["albumName"],
  data() {
    return {
      data: "",
      album_info: {
        cover: "",
        title: "",
        artist: "",
        discs: [],
        tracks: "",
        year: "",
      },
      //批量选择部分
      songs: [],
      choiseTracks: false,
      choiseAll: false,
      choiseSongsheet: false,
      songsheets: [],
      choiseAllSongsheets: false,
    };
  },
  watch: {
    index() {
      let index;
      this.songs.forEach((item) => {
        if (item.filepath == this.playList[this.index].filepath) {
          index = this.songs.indexOf(item);
        }
      });
      this.$refs.tracks[index].style.color = "red";
    },
  },
  methods: {
    async fetchData() {
      const response = await fetch(
        `http://localhost:3000/albums/${encodeURIComponent(this.albumName)}`
      );
      if (!response.ok) throw new Error("网络响应异常");
      const data = await response.json();

      return data;
    },

    async parse() {
      const { album = [], songs } = await this.fetchData();

      this.album_info.cover = album[0].cover;
      this.album_info.title = album[0].album;
      this.album_info.artist = album[0].album_artist;
      // this.album_info.discs = album[0].disc_count==0?1:album[0].disc_count;
      this.album_info.tracks = album[0].track_count;
      this.album_info.year = album[0].date;
      this.songs = songs;

      this.sort(this.songs);
      // let discNum=1;
      this.songs.forEach((item) => {
        // if(item.disc==0){
        //   item.disc=1;
        // }
        if (!this.album_info.discs.includes(item.disc)) {
          this.album_info.discs.push(item.disc);
        }
      });
      // console.log(this.songs);
      // console.log(this.album_info.discs);
    },
    sort(arr) {
      arr.sort((a, b) => {
        if (a.disc !== b.disc) return a.disc - b.disc;
        return a.track - b.track;
      });
    },
    
    //高亮当前歌曲
    HighlightCurrentSong() {
      let index;
      if (this.playList.length != 0) {
        this.songs.forEach((item) => {
          if (item.filepath == this.playList[this.index].filepath) {
            index = this.songs.indexOf(item);
          }
        });
        if (this.isPlaying) {
          this.$refs.tracks.forEach((item) => {
            item.style.color = "black";
          });
          this.$refs.tracks[index].style.color = "red";
        }
      }
    },
    initSongsChoisedState() {
      this.songs.forEach((item) => {
        item.choisedState = false;
      });
    },
    //选中或取消选中
    choiseSingleOrCancel(item, arr) {
      const index = arr.indexOf(item);
      this.songs[index].choisedState = !this.songs[index].choisedState;
    },
    changeClass(item) {
      //const index = this.songs.indexOf(item);
      return item.choisedState ? "choised" : "noChoised";
    },
    //选择或取消选择全部音轨
    choiseAllTracksOrNot() {
      if (this.choiseTracks) {
        this.choiseAll = !this.choiseAll;
        if (this.choiseAll) {
          this.songs.forEach((item) => {
            item.choisedState = true;
          });
        } else {
          this.initSongsChoisedState();
        }
      }
    },
    //初始化歌单的选中状态
    initSongsheetsState() {
      this.songsheets.forEach((item) => {
        item.choisedState = false;
      });
    },
    //获取所有歌单
    async getAllSongsheets() {
      const response = await fetch("http://localhost:3000/songsheets");
      if (!response.ok) throw new Error("网络响应异常");
      this.songsheets = await response.json();
      this.initSongsheetsState();
    },
    //选择或取消选择单个歌单
    choiseSongsheetOrNot(item, arr) {
      const index = arr.indexOf(item);
      this.songsheets[index].choisedState =
        !this.songsheets[index].choisedState;
    },
    choiseAllSongsheetsOrNot() {
      this.choiseAllSongsheets = !this.choiseAllSongsheets;
      if (this.choiseAllSongsheets) {
        this.songsheets.forEach((item) => {
          item.choisedState = true;
        });
      } else {
        this.initSongsheetsState();
      }
    },
    songsheetItemClass(item) {
      return item.choisedState ? "choised" : "noChoised";
    },
    //将选中的歌曲添加到选中的歌单中
    addToChoisedSongsheets() {
      //1.获取选中的歌曲
      //2.获取要添加的歌单
      //3.发起POST请求,后端使用双循环处理
      const songsFilePath = [];
      this.songs.forEach((item) => {
        if (item.choisedState) {
          songsFilePath.push(item.filepath);
        }
      });
      const choisedSongsheets = [];
      // console.log(this.songsheets);
      this.songsheets.forEach((item) => {
        if (item.choisedState) {
          choisedSongsheets.push(item.name);
        }
      });
      (async () => {
        const response = await fetch("http://localhost:3000/addToSongsheet", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ songsFilePath, choisedSongsheets }),
        });
        console.log("已发送...");
        if (response.ok) {
          alert("添加成功");
          this.choiseTracks = false;
          this.choiseAll = false;
          this.choiseSongsheet = false;
          this.choiseAllSongsheets = false;
          this.initSongsChoisedState();
          this.initSongsheetsState();
        }
      })();
    },
  },
  async created() {
    //模版创建时自动调用函数
    await this.parse();
    // this.sort(this.songs);
  },
  mounted() {
    this.audioElement.addEventListener("timeupdate", this.HighlightCurrentSong);
  },
  unmounted(){
    this.audioElement.removeEventListener("timeupdate", this.HighlightCurrentSong);
  }
};
</script>
<style scoped>
.container {
  position: fixed;
  left: 10vw;
  top: 0px;
  height: 80vh;
  width: 90vw;
  overflow-y: scroll;
}
.album {
  position: relative;
  height: 200px;
}
img {
  width: 200px;
  height: 200px;
  float: left;
  margin-right: 100px;
}
.album table {
  position: relative;
  top: 50px;
}
.album td {
  width: 200px;
}
.song {
  clear: both;
}
.song tr {
  height: 50px;
}
.song tr:hover {
  background-color: aqua;
}
.on {
  color: red;
}
.choised {
  background-color: rgb(0, 254, 85);
}
/*歌单选择框样式*/
.choiseSongsheet {
  position: fixed;
  width: 500px;
  height: 400px;
  left: 500px;
  top: 100px;
  background-color: rgb(255, 255, 255);
  border: 2px, solid black;
  border-radius: 20px;
}
.songsheet {
  height: 300px;
  overflow-y: scroll;
  border-bottom: 2px solid black;
}
</style>
