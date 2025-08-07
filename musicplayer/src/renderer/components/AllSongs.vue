<template>
  <div class="container" ref="container">
    <div>
      <span>{{ allsongs.length }}</span>
      <span style="width: 200px"></span>
      <button
        @click="
          () => {
            checkSome = true;
          }
        "
      >
        批量
      </button>
    </div>
    <span v-if="checkSome" @click="chectAllOrNot">○</span>
    <span v-if="checkSome">全选</span>
    <div class="bar" v-if="checkSome">
      <tr>
        <td @click="async()=>{choiseSongsheet=true;await getAllSongsheets()}" style="width: 200px">添加到</td>
        <td
          @click="
            () => {
              checkSome = false;
              chectAll=false;
              initIsChected();
            }
          "
        >
          取消
        </td>
      </tr>
    </div>
    <table>
      <tr v-for="item in allsongs" ref="songs" @dblclick="dbclickToPlay(item,allsongs)">
        <td
          @click="checkOrCancel(item, allsongs)"
          style="width: 50px; height: 50px"
          v-if="checkSome"
          :class="changeClass(item)"
        >
          ○
        </td>
        <td>
          <img
            style="width: 50px; height: 50px"
            :src="imgSrc(item)"
            loading="lazy"
          />
        </td>
        <td style="width: 300px; height: 50px">{{ item.title }}</td>
        <td style="width: 300px; height: 50px">{{ item.artist }}</td>
      </tr>
    </table>
  </div>
  <div class="choiseSongsheet" v-if="choiseSongsheet">
    <span @click="choiseAllSongsheetsOrNot">○</span>
    <span>全选</span>
    <div class="songsheet">
      <table>
      <tr v-for="item in songsheets">
        <td style="width: 50px; height: 50px" :class="songsheetItemClass(item)" @click="choiseSongsheetOrNot(item,songsheets)">○</td>
        <td style="width: 200px; height: 50px">{{ item.name }}</td>
      </tr>
    </table>
    </div>
    <span @click="addToChoisedSongsheets">添加</span>
    <span @click="()=>{choiseSongsheet=false;choiseAllSongsheets=false;songsheets=[],songsheetsState=[]}" style="float: right;">取消</span>
    
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
</template>
<script>
// import setting from'../config.json';
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
    "index"
  ],
  data() {
    return {
      allsongs: [],
      checkSome: false,
      chectAll: false,
      songsState: [],
      choiseSongsheet:false,
      choiseAllSongsheets:false,
      songsheets:[],
      songsheetsState:[]
    };
  },
  computed:{
     albumCoverMap(){
      const map={};
      for(const album of this.albums){
        map[album.album]=album.cover;
      }
      return map;
     }
  },
  methods: {
    //获取所有歌曲
    async getAllSongs() {
      const response = await fetch("http://localhost:3000/allsongs");
      if (!response.ok) throw new Error("网络响应异常");
      this.allsongs = await response.json();
      // console.log(this.allsongs);
    },
    //获得每首歌对应的专辑图片
    imgSrc(item) {
       const img=this.albumCoverMap[item.album];
        if(img){
          return `data:jpeg;base64,${img}`;
        }
        
          return "..\\assets\\空白专辑封面.jpg";
        
      
    },
    
    //初始化是否选中歌曲，默认为false
    initIsChected() {
      this.songsState = [];
      for (let i = 0; i <= this.allsongs.length - 1; i++) {
        this.songsState.push(false);
      }
    },
    initSongsheetsState(){
     this.songsheetsState = [];
      for (let i = 0; i <= this.songsheets.length - 1; i++) {
        this.songsheetsState.push(false);
      }
    },
    //选中或取消选中
    checkOrCancel(item, arr) {
      const index = arr.indexOf(item);
      this.songsState[index] = !this.songsState[index];
    },
    changeClass(item) {
      const index = this.allsongs.indexOf(item);
      return this.songsState[index] ? "on" : "off";
    },
    //全选或取消全选
    chectAllOrNot() {
      if (this.checkSome) {
        this.chectAll = !this.chectAll;
        if (this.chectAll) {
          this.songsState = [];
          for (let i = 0; i <= this.allsongs.length - 1; i++) {
            this.songsState.push(true);
          }
        } else {
          this.initIsChected();
        }
      }
    },
    //获取所有歌单
    async getAllSongsheets(){
      const response = await fetch("http://localhost:3000/songsheets");
      if (!response.ok) throw new Error("网络响应异常");
      this.songsheets = await response.json();
      this.initSongsheetsState();
    },
    //选择或取消选择单个歌单
    choiseSongsheetOrNot(item,arr){
        const index = arr.indexOf(item);
      this.songsheetsState[index] = !this.songsheetsState[index];
    },
    choiseAllSongsheetsOrNot(){
      this.choiseAllSongsheets= !this.choiseAllSongsheets;
        if (this.choiseAllSongsheets) {
          this.songsheetsState = [];
          for (let i = 0; i <= this.songsheets.length - 1; i++) {
            this.songsheetsState.push(true);
          }
        } else {
          this.initSongsheetsState();
        }
    },
    songsheetItemClass(item){
      const index = this.songsheets.indexOf(item);
      return this.songsheetsState[index] ? "on" : "off";
    },
    //将选中的歌曲添加到选中的歌单中
    addToChoisedSongsheets(){
      //1.获取选中的歌曲
      //2.获取要添加的歌单
      //3.发起POST请求,后端使用双循环处理
      const songsFilePath=[];
      for(let i=0;i<=this.allsongs.length-1;i++){
        if(this.songsState[i]){
          songsFilePath.push(this.allsongs[i].filepath);
        }
      } 
      const choisedSongsheets=[];
      for(let i=0;i<=this.songsheets.length-1;i++){
        if(this.songsheetsState[i]){
          choisedSongsheets.push(this.songsheets[i].name);
        }
      }
      (async ()=>{
          const response = await fetch("http://localhost:3000/addToSongsheet", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ songsFilePath,choisedSongsheets }),
        });
        console.log("已发送...");
        if(response.ok){
          alert('添加成功');
          this.checkSome= false;
          this.chectAll=false;
          this.choiseSongsheet=false;
          this.choiseAllSongsheets=false;
          this.initIsChected();
          this.initSongsheetsState();
        }
      })();
      
    },
    //获取当前歌曲的索引
    getCurrentSongIndex() {
      let index = 0;
      if (this.playList.length != 0) {
        this.allsongs.forEach((item) => {
          if (item.filepath == this.playList[this.index].filepath) {
            index = this.allsongs.indexOf(item);
          }
        });
      }
      return index;
    },
    scrollToCurrentSongInPlaylistElement() {
      try {
        const Container = this.$refs.container;
        const index = this.getCurrentSongIndex();
        const currentSongElement = this.$refs.songs[index];
        const currentSongTop = currentSongElement.offsetTop;
        const containerHeight=Container.clientHeight;
        const Y=currentSongTop-containerHeight/3
        Container.scrollTo({
          top: Y,
          behavior: "instant",
        });
      } catch (error) {
        console.log(error);
      }
    },
    //高亮当前歌曲
    HighlightCurrentSong() {
      if (this.playList.length != 0) {
        const index = this.getCurrentSongIndex();
        this.$refs.songs.forEach((item) => {
          item.className = "noActive";
        });
        let isContain = false;
        for (const item of this.allsongs) {
          if (item.filepath == this.playList[this.index].filepath) {
            isContain = true;
          }
        }
        if (isContain) {
          this.$refs.songs[index].className = "active";
        }
      }
    },
  },
  async created() {
    await this.getAllSongs();
    this.initIsChected();
  },
  mounted(){
    this.audioElement.addEventListener('timeupdate',this.HighlightCurrentSong);
  },
  unmounted(){
    this.audioElement.removeEventListener('timeupdate',this.HighlightCurrentSong);
  }
};
</script>
<style scoped>
/* .container {
  position: absolute;
  left: 150px;
} */
 .container {
  position: fixed;
  left: 10vw;
  top:0px;
  height:80vh;
  width: 90vw;
  overflow-y: scroll;
}
tr:hover {
  background-color: rgb(140, 188, 220);
}
.on {
  background-color: rgb(0, 254, 85);
}
.choiseSongsheet{
  position:fixed;
  width:500px;
  height: 400px;
  left:500px;
  top:100px;
  background-color: rgb(255, 255, 255);
  border: 2px,solid black;
  border-radius: 20px;
}
.songsheet{
  height:300px;
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
.active{
  color:red
}
</style>
