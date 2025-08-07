<template>
  <div class="fixed">
    <div id="play-bar" ref="bar">
      <!-- <div id="blur"></div> -->
      <!-- <audio id="flacAudio" src=""></audio> -->
      <img
        id="preImg"
        :src="imgSrc"
        
        @click="openOrCloseDetail"
      />
      <div class="song-info">
        <p id="song-title">{{ currentSong ? currentSong.title : "" }}</p>
        <p id="song-artist">{{ currentSong ? currentSong.artist : "" }}</p>
      </div>
      <div id="progress-bar" ref="progressBar" class="progress"></div>
      <div
        @click="progressSkip($event)"
         @mousedown="startChangeProgressByMousedown()"
        id="progress-bg"
        ref="progressBg"
        class="progress"
      ></div>
      <div id="currentTime" class="time">{{ info.current_time }}</div>
      <div id="totalTime" class="time">
        {{ currentSong ? convertTime(currentSong.duration) : "" }}
      </div>
      <div class="control-btn">
        <button id="last" @click="playLast"><</button>
        <button id="play-or-pause" class="off" @click="playOrPause">
          {{ isPlaying ? "❚❚" : "▶" }}
        </button>
        <button id="next" @click="playNext">></button>
      </div>
      <button id="mode" class="m1" ref="mode" @click="changePlayMode"></button>
      <button
        id="volume"
        @click="
          () => {
            watchVolume = !watchVolume;
          }
        "
      ></button>
      <button id="playList" @click="watchPlayListOrNot"></button>
    </div>
    
  </div>
  <!--音量调节-->
    <div v-if="watchVolume">
      <div
        class="volume"
        ref="volumeBg"
        id="volume-bg"
        @mousedown="startChangeVolumeByMousedown()"
        @mousemove="changeVolumeByMousemove($event)"
        @mouseup="stopChangeVolumeByMouseup()"
      ></div>
      <div class="volume" ref="volumeBar" id="volume-bar" :style="volumeBarHeight"></div>
    </div>
  <!--歌词播放页面-->
  <div class="playingDetail" v-if="isOpenDetail">
    <div class="circle-rotate" ref="rotate">
      <img :src="imgSrc" style="width: 30vw; height: 30vw" />
    </div>
    <div
      id="quality"
      :class="quality"
      @click="
        () => {
          watchAllInfo = !watchAllInfo;
        }
      "
    >
      <strong>{{ quality }}</strong>
    </div>
    <div class="info">
      <h3 style="color: rgba(255, 255, 255, 0.9)">
        {{ currentSong ? currentSong.title : "未知标题" }}
      </h3>
      <h4 style="color: white">
        {{ currentSong ? currentSong.artist : "未知艺术家" }}
      </h4>
    </div>
    <div class="lyrics" ref="lrc">
      <div v-if="lyricResult.length == 0">暂无歌词</div>
      <template v-for="item in lyricResult">
        <div :class="'l' + item.lang" ref="lyrics">{{ item.text }}</div>
      </template>
    </div>
    <div class="All_Info" v-if="watchAllInfo">
      <p>专辑：{{ currentSong.album }}</p>
      <p>文件路径：{{ currentSong.filepath }}</p>
      <table>
        <tr>
          <td>年份：{{ currentSong.date }}</td>
          <td>时长：{{ convertTime(currentSong.duration) }}</td>
        </tr>
        <tr>
          <td>格式：{{ currentSong.format }}</td>
          <td>大小：{{ parseFloat(currentSong.size).toFixed(2) + "MB" }}</td>
        </tr>
        <tr>
          <td>位深：{{ currentSong.bitsdepth }}</td>
          <td>采样率：{{ currentSong.samplerate + "Hz" }}</td>
        </tr>
        <tr>
          <td>比特率：{{ currentSong.bitrate / 1000.0 + "kbps" }}</td>
          <td>声道：{{ currentSong.channels }}</td>
        </tr>
      </table>
    </div>
  </div>
  <!--播放列表框-->
  <div class="playListView" v-if="watchPlayList" ref="playlist" >
    <table>
      <tr ref="songs" class="songOfPlayList" v-for="item in playList" @dblclick="dbclickToPlay(item,playList)">
        <td>
          <strong>{{ item.title }}</strong
          >-{{ item.artist }}
        </td>
      </tr>
    </table>
    <!-- <div class="scrollToCurrentSong" @click="scrollToCurrentSongInPlaylistElement"></div> -->
  </div>
  <div
    class="backgroundBlur"
    v-if="isOpenDetail"
    ref="blur"
    :style="backgroundImage"
  ></div>
  <!-- <div class="block" v-if="isOpenDetail" :style="backgroundImage"></div> -->
</template>

<script>
// import setting from "../config.json";
import defaultCover from "../assets/空白专辑封面.jpg";
export default {
  //设计一个最小播放器，实现播放、展示封面功能
  inject: [
    "audioElement",
    "setSrc",
    "isPlaying",
    "playList",
    "index",
    "setPlayList",
    "setIndex",
    "indexAdd",
    "indexSub",
    "invertPlayState",
    "makeisPlayingTrue",
    "albums",
    "folder",
    "dbclickToPlay"
  ],
  data() {
    return {
      info: {
        img_src: "",
        title: "",
        artist: "",
        current_time: "",
        total_time: "",
      },
      progress_length: "",
      isOpenDetail: false, //标记是否打开播放页详情
      lyricResult: [],
      watchPlayList: false,
      watchAllInfo: false,
      watchVolume: false,
      isDraggingProgress:false,
      isDraggingVolume: false,
      volume:1
    };
  },
  watch: {
    currentSong() {
      this.lyricResult = [];
      this.parseLRC(this.currentSong.lyrics);
    },
    isOpenDetail() {
      if (this.isOpenDetail) {
        this.$refs.bar.style.color = "white";
      } else {
        this.$refs.bar.style.color = "black";
      }
    },
    watchPlayList(newVal){
      if(newVal){
        this.$nextTick(()=>{
          this.scrollToCurrentSongInPlaylistElement();
        })
      }
    }
  },
  computed: {
    currentSong() {
      if (this.playList) {
        return this.playList[this.index];
      } else {
        return null;
      }
    },
    imgSrc() {
      let img;
      if (this.currentSong) {
        this.albums.forEach((item) => {
          if (item.album == this.currentSong.album) {
            img = item.cover;
          }
        });
      }

      if (img != null) {
        return `data:jpeg;base64,${img}`;
      } else {
        return defaultCover;
      }
    },
    backgroundImage() {
      return {
        "background-image": `url(${this.imgSrc})`,
      };
    },
    volumeBarHeight(){
       const height=this.volume*150;
       return{
        'height':height+'px'
       }
    },
    //歌曲品质
    quality() {
      if (this.currentSong) {
        switch (
          this.currentSong.bitsdepth > 16 &&
          this.currentSong.samplerate > 44100
        ) {
          case true:
            return "Hi-Res";
          case false:
            return "SQ";
        }
      } else {
        return null;
      }
    },
  },
  methods: {
    playOrPause() {
      this.invertPlayState();
      if (this.isPlaying == true) {
        this.audioElement.play();
      } else {
        this.audioElement.pause();
      }
    },
    playLast() {
      if (this.index != 0) {
        this.indexSub();
        this.dbclickToPlay();
        //this.parse();
      } else {
        alert("已经是第一首！");
      }
    },
    playNext() {
      if (this.index < this.playList.length - 1) {
        this.indexAdd();
        this.dbclickToPlay();
        // console.log(this.index);
        // let url;
        // this.folder.forEach((path) => {
        //   if (this.playList[this.index].filepath.includes(path.path)) {
        //     url = this.playList[this.index].filepath
        //       .replace(path.path, "http://localhost:3000/audios")
        //       .replace(/\\/g, "/");
        //   }
        // });
        // this.setSrc(url);
        // this.audioElement.play();
        // this.makeisPlayingTrue();
      } else {
        alert("已经是最后一首！");
      }
    },
    progressSkip(e) {
      const totalWidth = this.$refs.progressBg.offsetWidth;
      const rect = this.$refs.progressBg.getBoundingClientRect();
      const pos = e.clientX - rect.left;
      if (this.audioElement.duration) {
        this.audioElement.currentTime =
          (pos / totalWidth) * this.audioElement.duration;
      }
    },

    updateViewWithTime() {
      //更新当前时间
      this.info.current_time = this.convertTime(this.audioElement.currentTime);
      //更新进度条长度
      let totalWidth = this.$refs.progressBg.offsetWidth;
      if (this.audioElement.duration) {
        const progress =
          this.audioElement.currentTime / this.audioElement.duration;
        this.$refs.progressBar.style.width = progress * totalWidth + "px";
      }
      if (this.audioElement.currentTime == this.audioElement.duration) {
        this.invertPlayState();
      }
    },
    //格式化时间显示
    convertTime(floattime) {
      const Minume = parseInt(floattime / 60);
      let Second = parseInt(floattime) % 60;
      Second = String(Second).padStart(2, "0");
      return `${Minume}:${Second}`;
    },
    //改变播放模式
    changePlayMode() {
      if (this.$refs.mode.className == "m4") {
        this.$refs.mode.className = "m1";
      } else {
        let i = parseInt(this.$refs.mode.className.match(/\d+/g)[0]) + 1;
        this.$refs.mode.className = "m" + i;
      }
      // this.$refs.mode.innerText = this.$refs.mode.className;
    },
    //根据当前模式决定行为
    playByMode() {
      if (this.audioElement.currentTime == this.audioElement.duration) {
        switch (this.$refs.mode.className) {
          case "m1": //顺序列表播放
            {
              if (this.index < this.playList.length - 1) {
                this.playNext();
              } else {
                this.audioElement.pause();
                //this.invertPlayState();
              }
            }

            break;
          case "m2": //循环列表播放
            {
              if (this.index < this.playList.length - 1) {
                this.playNext();
              } else {
                this.setIndex(-1);
                this.playNext();
              }
            }
            break;
          case "m3": //单曲循环模式
            {
              this.audioElement.play();
              this.makeisPlayingTrue();
            }
            break;
          case "m4": //随机播放模式
            //待定
            break;
          default:
            break;
        }
      }
    },
    openOrCloseDetail() {
      this.isOpenDetail = !this.isOpenDetail;
    },
    //音量控制
    startChangeVolumeByMousedown() {
      this.isDraggingVolume=true;
    },
    changeVolumeByMousemove(e) {
      if (!this.isDraggingVolume) return;
      let offsetY =
        e.clientY - this.$refs.volumeBg.getBoundingClientRect().top;
      const totalHeight = this.$refs.volumeBg.offsetHeight;
      this.volume=1 - offsetY / totalHeight;
      this.audioElement.volume =this.volume ;
      this.$refs.volumeBar.style.height =this.audioElement.volume* totalHeight  + "px";
      
      // this.volumeBarHeight=this.audioElement.volume* totalHeight;
    },
    stopChangeVolumeByMouseup() {
      if (this.isDraggingVolume) {
        this.isDraggingVolume = false;
      }
    },
    startChangeProgressByMousedown() {
      this.isDraggingProgress=true;
    },
    changeProgressByMousemove(e){
      if (!this.isDraggingProgress) return;
      document.addEventListener('copy',(e)=>{
        e.preventDefault();//阻止复制事件
      })
      this.audioElement.removeEventListener("timeupdate", this.updateViewWithTime);
        
        const bgTotalWidth = this.$refs.progressBg.offsetWidth;
      let offsetX =
        e.clientX - this.$refs.progressBg.getBoundingClientRect().left;
      //   if (this.audioElement.duration) {
      //   this.audioElement.currentTime =
      //     (offsetX / bgTotalWidth) * this.audioElement.duration;
      // }
      const time=(offsetX / bgTotalWidth) * this.audioElement.duration;
      this.$refs.progressBar.style.width=offsetX+'px';
      this.info.current_time = this.convertTime(time);

    },
    stopChangeProgressByMouseup(e) {
      if (this.isDraggingProgress) {
        this.isDraggingProgress = false;
        const bgTotalWidth = this.$refs.progressBg.offsetWidth;
      let offsetX =
        e.clientX - this.$refs.progressBg.getBoundingClientRect().left;
      const time=(offsetX / bgTotalWidth) * this.audioElement.duration;
      this.audioElement.currentTime=time;
        this.audioElement.addEventListener("timeupdate", this.updateViewWithTime);
        document.removeEventListener('copy');
      }
    },
    //封面图片的旋转控制
    controlRotate() {
      if (this.isOpenDetail) {
        if (this.isPlaying) {
          this.$refs.rotate.style.animationPlayState = "running";
        } else {
          this.$refs.rotate.style.animationPlayState = "paused";
        }
      } else {
        this.$refs.rotate.style.animationPlayState = "paused";
      }
    },
    //解析歌词
    parseLRC(jsonString) {
      const lrcArray = JSON.parse(jsonString);
      this.lyricResult = [];

      const timeExist = [];
      lrcArray.forEach((item) => {
        const time = item.timestamp / 1000;
        let lang = timeExist.includes(time) ? 1 : 0;
        if (!timeExist.includes(time)) {
          timeExist.push(time);
        }
        const text = item.text;
        this.lyricResult.push({ time, text, lang });
      });
    },
    //定位当前歌词
    findCurrentLRC() {
      let activeIndex = 0;
      //找到歌词位置
      for (let i = 0; i < this.lyricResult.length; i++) {
        if (this.lyricResult[i].time <= this.audioElement.currentTime) {
          if (this.lyricResult[i].lang == 0 && this.lyricResult[i].text != "")
            activeIndex = i;
        } else {
          break;
        }
      }
      return activeIndex;
    },
    //高亮当前歌词
    HighlightCurrentLRC() {
      let activeIndex = this.findCurrentLRC();
      this.$refs.lyrics.forEach((item) => {
        item.style.color = "white";
      });
      this.$refs.lyrics[activeIndex].style.color = "aquamarine";
    },
    scrollLRC() {
      let activeIndex = this.findCurrentLRC();
      const LRCContainer = this.$refs.lrc;
      const activeElement = this.$refs.lyrics[activeIndex];
      const containerHeight = LRCContainer.clientHeight;
      const elementTop = activeElement.offsetTop;
      const elementHeight = activeElement.clientHeight;
      const targetScrollTo =
        elementTop - containerHeight / 3 + elementHeight / 2;
      LRCContainer.scrollTo({
        top: targetScrollTo,
        behavior: "smooth",
      });
    },
    //查看播放列表/取消
    watchPlayListOrNot() {
      this.watchPlayList = !this.watchPlayList;
      // if(this.watchPlayList){
      //   this.scrollToCurrentSongInPlaylistElement();
      // }
    },
    HighlightCurrentSong() {
      //let index;
      if (this.playList.length != 0) {
        // this.songs.forEach((item) => {
        //   if (item.filepath == this.playList[this.index].filepath) {
        //     index = this.songs.indexOf(item);
        //   }
        // });
        if (this.isPlaying) {
          this.$refs.songs.forEach((item) => {
            item.style.color = "black";
          });
          this.$refs.songs[this.index].style.color = "#F545A0";
        }
        // return item.filepath == this.playList[this.index].filepath
        //   ? "on"
        //   : "off";
      }
      // else {
      //   return "off";
      // }
    },
    scrollToCurrentSongInPlaylistElement(){
      try {
        const playListContainer=this.$refs.playlist;
        const currentSongElement=this.$refs.songs[this.index];
        const currentSongTop=currentSongElement.offsetTop;
        playListContainer.scrollTo({
           top: currentSongTop,
           behavior: "instant"
        })
      } catch (error) {
        console.log(error);
      }
    }
  },

  mounted() {
    this.audioElement.addEventListener("timeupdate", this.updateViewWithTime);
    this.audioElement.addEventListener("timeupdate", this.playByMode);
    this.audioElement.addEventListener("timeupdate", this.controlRotate);
    this.audioElement.addEventListener("timeupdate", this.HighlightCurrentLRC);
    this.audioElement.addEventListener("timeupdate", this.scrollLRC);
    this.audioElement.addEventListener("timeupdate", this.HighlightCurrentSong);
    document.addEventListener('mousemove',(e)=>{
      this.changeProgressByMousemove(e)});
    document.addEventListener('mouseup',(e)=>{this.stopChangeProgressByMouseup(e)});
    // this.$nextTick(()=>{
    //   if(this.watchPlayList){
    //     this.scrollToCurrentSongInPlaylistElement();
    //   }
    // });
  },
};
// function convertTime(floattime){
//    const Minume = parseInt(floattime / 60);
//   let Second = parseInt(floattime) % 60;
//   Second = String(Second).padStart(2, "0");
//   return `${Minume}:${Second}`;
// }
</script>

<style scoped>
/* button {
  font-weight: bold;
} */
.fixed {
  position: fixed;
  bottom: 0;
  z-index: 999;
  /**阻止复制事件 */
  -webkit-user-select: none; /* Chrome/Safari */
  -moz-user-select: none;    /* Firefox */
  -ms-user-select: none;     /* IE10+ */
  user-select: none;
}
#play-bar {
  position: relative;
  width: 100vw;
  height: 15vh;
  /* height: 100px; */
  /* background-color: #f1f1f1; */
  /* color:rgb(126, 184, 235); */
  bottom: 0;
  overflow: hidden;
  /* z-index: 999; */
}
/* 模糊背景层 */
#blur {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: 50% 75%;
  filter: blur(30px);
  z-index: 998;
  /* opacity: 0.8; */
}
.progress,
#play-bar button,
.song-info,
#next,
#preImg,
.time {
  position: relative;
  z-index: 500;
}
#preImg {
  width: 13vh;
  height: 13vh;
  float: left;
}
.song-info {
  position: absolute;
  display: flex;
  flex-direction: column;
  /* border: 2px solid red; */
  width: 10vw;
  height: 14vh;
  left: 15vh;
  top: 10px;
}
#song-title {
  flex: 2;
  margin: 0;
}
#song-artist {
  font-size: small;
  margin: 0;
  flex: 1;
}
.progress {
  position: absolute;
  left: 30%;
  top: 20px;
  height: 10px;
  border: 1px solid blue;
}
#progress-bg {
  width: 40vw;/*500px */
  background: rgba(255, 255, 255, 0.3);
  z-index: 2;
}
#progress-bar {
  max-width: 40vw;
  background: aquamarine;
  z-index: 1;
}
.time {
  position: absolute;
  width: 50px;
  height: 20px;
  top: 50px;
  /* border: 1px solid red; */
}
#currentTime {
  left: 30vw;
}
#totalTime {
  text-align: right;
  right: 30vw;
}
button {
  /* width: 40px;
  height: 40px; */
  color: aquamarine;
}
.control-btn {
  position: absolute;
  left: 30vw;
  top: 50%;
  width: 40vw;
  height: 6vh;
  display: flex;
  justify-content: center;
}
@font-face {
  font-family: "icon-font";
  src: url("font/flat-ui-icons-regular.ttf");
}

#play-or-pause {
  bottom: 2vh;
  font-size: 6vh;
  background: none;
  border: 0;
}

/* #play-or-pause.on::after {
  content: "\e615"; 
  font-size: 36px;
  font-family: "icon-font";
  color: #5993df;
}
#play-or-pause.off::after {
  content: "\e616"; 
  font-size: 36px;
  font-family: "icon-font";
  color: #5993df;
} */
#last {
  bottom: 1vh;
  font-size: 6vh;
  background: none;
  border: 0;
  margin-right: 10vh;
}
/* #last::after {
  content: "\e604"; 
  font-size: 36px;
  font-family: "icon-font";
  color: var(-most-color, #5993df);
} */
#next {
  bottom: 1vh;
  font-size: 6vh;
  background: none;
  border: 0;
  margin-left: 10vh;
}
/* #next::after {
  content: "\e605"; 
  font-size: 36px;
  font-family: "icon-font";
  color: var(-most-color, #5993df);
} */
#mode {
  position: absolute;
  left: 70vw;
  top: 7vh;
  /* font-size: 36px; */
  background: none;
  border: 0;
  width: 5vh;
  height: 5vh;
  /* z-index: 999; */
}
#mode.m1::after {
  content: url("../assets/右向双箭头.png");
  font-size: 6vh;
  /* z-index: 999; */
}
#mode.m2::after {
  content: url("../assets/播放列表循环.png");
  font-size: 6vh;
  /* z-index: 999; */
}
#mode.m3::after {
  content: url("../assets/单次重复.png");
  font-size: 6vh;
  /* z-index: 999; */
}
#mode.m4::after {
  content: url("../assets/随机排序.png");
  font-size: 6vh;
  /* z-index: 999; */
}
#volume {
  position: absolute;
  left: 75vw;
  top: 50px;
  font-size: 0;
  background: none;
  border: 0;
  z-index: 999;
}
#volume::after {
  content: url("../assets/低音量图标.png");
  font-size: 6vh;
}
.volume {
  position: fixed;
  left: 85vw;
  bottom: 15vh;
  width: 50px;
}
#volume-bg {
  z-index: 1002;
  height: 150px;
  background: rgba(8, 235, 216, 0.804);
  border-radius: 10px;
  opacity: 0.3;
  border: 1px solid black;
}
#volume-bar {
  z-index: 1001;
  background:rgb(255, 255, 255);
  opacity: 2;
  border: 1px solid black;
  border-radius: 10px;
}
#playList {
  /* content: url('../assets/音乐列表.png'); */
  position: absolute;
  left: 80vw;
  top: 50px;
  font-size: 36px;
  background: none;
  border: 0;
}
#playList::after {
  content: url("../assets/音乐列表.png");
  font-size: 6vh;
}

.playingDetail {
  position: fixed;
  width: 100vw;
  height: 85vh;
  top: 0;
  border: 0;
  /* background-color: rgb(92, 236, 190); */
  z-index: 999;
}
.circle-rotate {
  position: absolute;
  left: 10vw;
  top: 10vh;
  width: 30vw;
  height:30vw;
  clip-path: circle(50% at 50% 50%); /* 使用clip-path创建圆形 */
  animation: rotate 10s linear infinite;
}
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
#quality {
  position: absolute;
  display: flex;
  left: 22.5vw;
  /* margin-top: 20px; */
  top: 75vh;
  width: 5vw;
  height: auto;
  border: 1px solid white;
  border-radius: 5px;
  font-size: 1vw;
  justify-content: center;
}
#quality.SQ {
  color: cornflowerblue;
}
#quality.Hi-Res {
  color: gold;
}
.All_Info {
  position: absolute;
  left: 150px;
  top: 100px;
  width: 400px;
  height: 300px;
  z-index: 999;
  background-color: white;
}
.All_Info td {
  width: 150px;
}
.info {
  position: absolute;
  left: 50vw;
  top: 5vh;
  width: 50vw;
  height: 15vh;
}
.lyrics {
  position: relative;
  left: 50vw;
  top: 25vh;
  width: 30vw;
  height: 50vh;
  overflow-y: scroll;
}
.lyrics::-webkit-scrollbar {
  display: none;
}
.l0 {
  margin-top: 15px;
  font-size: 25px;
}
.l1{
  font-size: 25px;
}
.playListView {
  position: fixed;
  left: 69vw;
  bottom: 20vh;
  width: 30vw;
  height: 70vh;
  overflow-y: scroll;
  /* border-radius: 20px; */
  z-index: 999;
  background-color: rgb(255, 255, 255);
  border: solid 2px black;
}
.playListView table {
  margin-left: 20px;
}
.playListView td {
  width: auto;
  height: 50px;
  border-bottom: 1px solid black;
}
.playListView tr:hover {
  background-color: aquamarine;
}
/* .scrollToCurrentSong{
  position: fixed;
  right:1vw;
  bottom: 25vh;
  width: 2vw;
  height: 2vw;
  background:rgb(239, 46, 113);
  border: 3px solid rgb(0, 0, 0);
  border-radius: 50%;
  z-index: 999;
} */
.backgroundBlur {
  position: fixed;
  padding: 100px;
  margin: -100px;
  left: 0;
  top: 0;
  /* right: -50px;
  bottom: -50px; */
  width: 100vw;
  height: 100vh;
  z-index: 100;
  filter: blur(30px) brightness(50%);
  background-size: cover;
  background-position: center;
  overflow: hidden;
}
.block {
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  z-index: 50;
  background-size: cover;
  background-position: center;
  background-color: rgb(0, 0, 0);
}
</style>
