<template>
    <slot></slot>
</template>
<script>
import Album from './Album.vue';
import Bar from './Bar.vue';
import Artist from './Artist.vue';
import AlbumDetails from './AlbumDetails.vue';
import ArtistDetails from './ArtistDetails.vue';
import SongsheetDetail from './SongsheetDetail.vue';
import Config from './Config.vue';
import { computed } from 'vue';
export default{
    components:{Album,Bar,Artist,AlbumDetails,ArtistDetails,SongsheetDetail,Config},
    data(){
       return{
         audioElement:new Audio(),
         isPlaying:false ,
         playList:[],
         index:0,
         albums:[],
         folder:[]
       }
    },
    methods:{
     async getAlbums(){
          const response = await fetch("http://localhost:3000/albums");
      if (!response.ok) throw new Error("网络响应异常");
      this.albums = await response.json();
      },
      async getFolders(){
         const response=await fetch("http://localhost:3000/getFolderpath");
         this.folder=await response.json();
      },
      setAudioSrc(url){
        this.audioElement.src=url;
      },
      setPlayList(arr){
        let newArr=[];
        if(Array.isArray(arr)){
          arr.forEach(element => {
             newArr.push(element);
          });
        }
        this.playList=newArr;
       },
      setIndex(num){
        this.index=num;
      },
      indexAdd(){
        this.index++;
      },
      indexSub(){
        this.index--;
      },
      invertPlayState(){
        this.isPlaying=!this.isPlaying;
      },
      makeisPlayingTrue(){
        this.isPlaying=true;
      },
      getPlayList() {
        return this.playList;
      },
      getIndex(){
        return this.index;
      },
      setFolder(arr){
        this.folder=[];
        arr.forEach(item=>{
          this.folder.push(item);
        })
      },
      getFolder(){
        return this.folder;
      },
      dbclickToPlay(item=this.playList[this.index],arr=this.playList) {
      let url;
      this.folder.forEach(path => {
        if(item.filepath.includes(path.path)){
          url = item.filepath.replace(
        path.path,
        "http://localhost:3000/audios"
      ).replace(/\\/g,'/');
        }
      });
      // console.log(this.folder);
      //  console.log(url);
      this.setAudioSrc(url);
      // this.audioElement.src = url;
      this.audioElement.play();
      this.makeisPlayingTrue();
      
        this.setPlayList(arr);
      this.setIndex(arr.indexOf(item));
      
      
    },
    },
    provide(){
        return{
          audioElement:this.audioElement,
          isPlaying:computed(()=>this.isPlaying) ,
          playList:computed(()=>this.playList),
          index:computed(()=>this.index),
          albums:computed(()=>this.albums),
          folder:computed(()=>this.folder),
          setSrc:this.setAudioSrc,
          setPlayList:this.setPlayList,
          setIndex:this.setIndex,
          indexAdd:this.indexAdd,
          indexSub:this.indexSub,
          invertPlayState:this.invertPlayState,
          makeisPlayingTrue:this.makeisPlayingTrue,
          getPlayList:this.getPlayList,
          getIndex:this.getIndex,
          setFolder:this.setFolder,
          getFolder:this.getFolder,
          dbclickToPlay:this.dbclickToPlay,
          getAlbums:this.getAlbums
        };
    },
   async created(){
      await this.getAlbums();
      await this.getFolders();
      // console.log(this.albums);
    }
}
</script>