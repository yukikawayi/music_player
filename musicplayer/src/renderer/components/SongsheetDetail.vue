<template>
  <div class="container" ref="container">
    <div class="info">
      <img src="..\\assets\\空白专辑封面.jpg" />
      <p>{{ songsheetName }}</p>
      <button>编辑歌单</button>
      <table>
        <tbody>
          <tr>
            <td>歌曲数：{{ songs.length }}</td>
            <td>
              <button
                @click="
                  () => {
                    choiseMultiple = true;
                  }
                "
              >
                批量
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!--批量选择控制-->
    <div class="choiseMultipleBar">
      <span v-if="choiseMultiple" @click="choiseAllSongsOrCancel">○</span>
      <span v-if="choiseMultiple">全选</span>
      <table>
        <tr class="bar" v-if="choiseMultiple">
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
              async () => {
                await deleteChoisedSongs();
              }
            "
          >
            移除
          </td>
          <td
            @click="
              () => {
                choiseMultiple = false;
                choiseAll = false;
                initSongsChoisedState();
              }
            "
          >
            取消
          </td>
        </tr>
      </table>
    </div>

    <!---->
    <div class="songs">
      <table>
        <tr
          v-for="item in songs"
          @dblclick="dbclickToPlay(item, songs)"
          ref="songs"
        >
          <td
            v-if="choiseMultiple"
            @click="choiseSingleOrCancel(item, songs)"
            :class="changeClass(item, songs)"
            style="width: 50px"
          >
            ○
          </td>
          <td>
            <img
              :src="imgSrc(item)"
              style="width: 50px; height: 50px"
              loading="lazy"
            />
          </td>
          <td style="width: 300px">{{ item.title }}</td>
          <td style="width: 300px">{{ item.artist }}</td>
        </tr>
      </table>
    </div>
    <!-- 选择歌单界面 -->
    <div class="choiseSongsheet" v-if="choiseSongsheet">
      <span @click="choiseAllSongsheetsOrNot">○</span>
      <span>全选</span>
      <div class="songsheet">
        <table>
          <template v-for="item in songsheets">
            <tr v-if="item.name != songsheetName">
              <td
                style="width: 50px; height: 50px"
                :class="songsheetItemClass(item)"
                @click="choiseSongsheetOrNot(item, songsheets)"
              >
                ○
              </td>
              <td style="width: 200px; height: 50px">{{ item.name }}</td>
            </tr>
          </template>
        </table>
      </div>
      <span @click="addChoisedSongsToOntherSongsheets">添加</span>
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
    <div
      class="scrollToCurrentSong"
      @click="scrollToCurrentSongInPlaylistElement"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 256 256"
      >
        <path
          fill="#000000"
          d="M240 116h-20.78A92.21 92.21 0 0 0 140 36.78V16a12 12 0 0 0-24 0v20.78A92.21 92.21 0 0 0 36.78 116H16a12 12 0 0 0 0 24h20.78A92.21 92.21 0 0 0 116 219.22V240a12 12 0 0 0 24 0v-20.78A92.21 92.21 0 0 0 219.22 140H240a12 12 0 0 0 0-24m-112 80a68 68 0 1 1 68-68a68.07 68.07 0 0 1-68 68m0-112a44 44 0 1 0 44 44a44.05 44.05 0 0 0-44-44m0 64a20 20 0 1 1 20-20a20 20 0 0 1-20 20"
        ></path>
      </svg>
    </div>
  </div>
</template>
<script>
// import setting from "../config.json";
import defaultCover from "../assets/空白专辑封面.jpg";
export default {
  inject: [
    "audioElement",
    "makeisPlayingTrue",
    "setPlayList",
    "setIndex",
    "albums",
    "folder",
    "dbclickToPlay",
    "playList",
    "index",
    "isPlaying",
  ],
  props: ["songsheetName"],
  data() {
    return {
      songs: [],
      choiseMultiple: false, //开启批量选择的标志
      choiseAll: false, //全选的标志
      choiseSongsheet: false,
      choiseAllSongsheets: false,
      songsheets: [],
    };
  },
  computed: {
    albumCoverMap() {
      const map = {};
      for (const album of this.albums) {
        map[album.album] = album.cover;
      }
      return map;
    },
    // currentSong() {
    //   try {
    //     if (this.index<this.playList.length&&this.index>=0) {
    //       return this.playList[this.index];
    //     } else {
    //       return null;
    //     }
    //   } catch (error) {
    //     console.log(error);
    //   }
    // },
  },
  // watch:{
  //   currentSong:{
  //     handler(newVal){
  //       this.HighlightCurrentSong();
  //     }
  //   },
  //   isPlaying(newVal){
  //      if(newVal==false){
  //       this.$refs.songs.forEach((item) => {
  //         item.className = "noActive";
  //       });
  //      }else{
  //       this.HighlightCurrentSong();
  //      }
  //   }
  // },
  methods: {
    async fetchData() {
      const response = await fetch(
        `http://localhost:3000/songsheets/${encodeURIComponent(
          this.songsheetName
        )}`
      );
      if (!response.ok) throw new Error("网络响应异常");
      this.songs = await response.json();
    },
    //初始化歌曲选择状态
    initSongsChoisedState() {
      this.songs.forEach((item) => {
        item.choisedState = false;
      });
    },
    //初始化歌单的选中状态
    initSongsheetsState() {
      this.songsheets.forEach((item) => {
        item.choisedState = false;
      });
    },
    //获得每首歌对应的专辑图片
    imgSrc(item) {
      const img = this.albumCoverMap[item.album];
      if (img) {
        return `data:jpeg;base64,${img}`;
      }
      return defaultCover;
    },
    //获取当前歌曲的索引
    getCurrentSongIndex() {
      let index = 0;
      if (this.playList.length != 0) {
        this.songs.forEach((item) => {
          if (item.filepath == this.playList[this.index].filepath) {
            index = this.songs.indexOf(item);
          }
        });
      }
      return index;
    },
    //高亮当前歌曲
    HighlightCurrentSong() {
      if (this.playList.length != 0) {
        const index = this.getCurrentSongIndex();
        this.$refs.songs.forEach((item) => {
          item.className = "noActive";
        });
        let isContain = false;
        for (const item of this.songs) {
          if (item.filepath == this.playList[this.index].filepath) {
            isContain = true;
          }
        }
        if (isContain) {
          this.$refs.songs[index].className = "active";
        }
      }
    },
    //选择或取消选择单个歌曲
    choiseSingleOrCancel(item, arr) {
      const index = arr.indexOf(item);
      arr[index].choisedState = !arr[index].choisedState;
    },
    //全选或取消全选歌曲
    choiseAllSongsOrCancel() {
      if (this.choiseMultiple) {
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
    changeClass(item, arr) {
      const index = arr.indexOf(item);
      return arr[index].choisedState ? "choised" : "noChoised";
    },
    //从歌单中移除选中的歌曲
    async deleteChoisedSongs() {
      const choisedSongsFilepath = [];
      this.songs.forEach((item) => {
        if (item.choisedState == true) {
          choisedSongsFilepath.push(item.filepath);
        }
      });
      if (choisedSongsFilepath.length != 0) {
        const response = await fetch(
          `http://localhost:3000/${encodeURIComponent(
            this.songsheetName
          )}/deleteSongs`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(choisedSongsFilepath),
          }
        );
        if (response.ok) {
          alert("删除成功");
        }
      }
      await this.fetchData();
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
    //将选中的歌曲添加到其他歌单
    addChoisedSongsToOntherSongsheets() {
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
          this.choiseMultiple = false;
          this.choiseAll = false;
          this.choiseSongsheet = false;
          this.choiseAllSongsheets = false;
          this.initSongsChoisedState();
          this.initSongsheetsState();
        }
      })();
    },
    //获取所有歌单
    async getAllSongsheets() {
      const response = await fetch("http://localhost:3000/songsheets");
      if (!response.ok) throw new Error("网络响应异常");
      this.songsheets = await response.json();
      this.initSongsheetsState();
    },
    scrollToCurrentSongInPlaylistElement() {
      try {
        const Container = this.$refs.container;
        const index = this.getCurrentSongIndex();
        const currentSongElement = this.$refs.songs[index];
        const currentSongTop = currentSongElement.offsetTop;
        Container.scrollTo({
          top: currentSongTop,
          behavior: "instant",
        });
      } catch (error) {
        console.log(error);
      }
    },
  },
  async created() {
    await this.fetchData();
    this.initSongsChoisedState();
    this.HighlightCurrentSong();
  },
  mounted() {
    this.audioElement.addEventListener("timeupdate", this.HighlightCurrentSong);
  },
  unmounted(){
    this.audioElement.removeEventListener('timeupdate',this.HighlightCurrentSong);
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
.info img {
  width: 200px;
  height: 200px;
  float: left;
}
.choiseMultipleBar {
  clear: both;
}
.songs {
  clear: both;
}
.active{
  color:red
}
.choised {
  background-color: aquamarine;
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
.scrollToCurrentSong {
  position: fixed;
  right: 1vw;
  bottom: 25vh;
  width: auto;
  height: auto;
  z-index: 999;
}
</style>
