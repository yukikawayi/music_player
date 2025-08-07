<template>
  <div class="container">
    <div class="baseInfo">
      <h1>{{ baseInfo.artist }}</h1>
      <p>参与专辑数:{{ baseInfo.albumNum }}</p>
      <p>歌曲数:{{ baseInfo.tracks }}</p>
    </div>
    <div class="album">
      <div v-for="item in artist_albums" class="oneAlbum">
         <img style="width: 100px;height: 100px;" :src="imgSrc(item)" >
         <p>{{ item.album }} </p>
      </div>
    </div>
    <div class="song">
      <table>
        <tr v-for="item in songs" @dblclick="dbclickToPlay(item,songs)">
            <td><img style="width: 50px;height: 50px;" :src="imgSrc(item)"></td>
            <td>{{ item.title }}</td>
        </tr>
      </table>
    </div>
  </div>
</template>
<script>
export default {
  inject: [
    "audioElement",
    "makeisPlayingTrue",
    "setPlayList",
    "setIndex",
    "albums",
    "folder",
    "dbclickToPlay"
  ],
  props:["artistName"],
  data() {
    return {
      baseInfo:{
        artist:"",
        albumNum:"",
        tracks:""
      },
      artist_albums:[],
      songs:[]
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
    async fetchData() {
      const response = await fetch(
        `http://localhost:3000/artists/${encodeURIComponent(this.artistName)}`
      );
      if (!response.ok) throw new Error("网络响应异常");
      const data = await response.json();

      return data;
    },

    async parse() {
      const {total=[], album , songs } = await this.fetchData();
      this.baseInfo.artist=total[0].artist;
      this.baseInfo.albumNum=total[0].album_count;
      this.baseInfo.tracks=total[0].track_count;
      this.artist_albums=album;
      this.songs = songs;
    },
    //获得每首歌对应的专辑图片
    imgSrc(item) {
       const img=this.albumCoverMap[item.album];
        
        return `data:jpeg;base64,${img}`;
      //return "../img/空白专辑封面.jpg";
    },
    sort(arr) {
      arr.sort((a, b) => {
        if (a.disc !== b.disc) return a.disc - b.disc;
        return a.track - b.track;
      });
    },
    // dbclickToPlay(item) {
    //   let url;
    //   this.folder.forEach(path => {
    //     if(item.filepath.includes(path)){
    //       url = item.filepath.replace(
    //     path,
    //     "http://localhost:3000/audios"
    //   ).replace(/\\/g,'/');
    //     }
    //   });
    //    console.log(url);
    //   //this.setSrc(url);
    //   this.audioElement.src = url;
    //   this.audioElement.play();
    //   this.makeisPlayingTrue();
    //   this.setPlayList(this.songs);
    //   this.setIndex(this.songs.indexOf(item));
    // },
  },
  async created() {
    //模版创建时自动调用函数
    await this.parse();
    
  },
};
</script>
<style scoped>
.container{
  position: fixed;
  left: 10vw;
  bottom: 15vh;
  width: 90vw;
  height: 80vh;
  overflow-y: scroll;
}
.baseInfo{
  position: relative;
  width: 300px;
  height: 150px;
}
.album{
  position: absolute;
  left: 40vw;
  top:0;
  width: 40vw;
  /* height: 300px; */
  overflow-x: scroll;
  display: grid;
  grid-auto-flow: column;
}
.oneAlbum{
    width: 150px; /* 每行8个，每个占12.5%宽度减去间隙 */
  height: 150px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  float: left;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.song{
  position: relative;
  /* top:200px; */
 clear: both;
}
.song tr{
  height: 60px;
}
.song tr:hover{
  background-color: aqua;
}

</style>
