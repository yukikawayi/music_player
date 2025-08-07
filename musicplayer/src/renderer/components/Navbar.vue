<template>
  <div class="Nav">
    <ul>
      <li @click="selectItem(0);goToAllSongs()" :class="{'active':selectedIndex==0}">全部歌曲</li>
    <li @click="selectItem(1);goToAlbum()" :class="{'active':selectedIndex==1}">专辑</li>
    <li @click="selectItem(2);goToArtist()" :class="{'active':selectedIndex==2}">艺术家</li>
    <br /><br />
    <li @click="selectItem(3);goToSongsheet()" :class="{'active':selectedIndex==3}">歌单</li>
    <li @click="selectItem(4);goToConfig()" :class="{'active':selectedIndex==4}">设置</li>
    </ul>
    
  </div>
</template>
<script>
export default {
  data() {
    return {
      selectedIndex:null
    };
  },
  methods: {
    selectItem(i){
     this.selectedIndex=i;
    },
    goToAllSongs() {
      this.$router.push({
        name: "AllSongs",
      });
    },
    goToAlbum() {
      this.$router.push({
        name: "Album",
      });
    },
    goToArtist() {
      this.$router.push({
        name: "Artist",
      });
    },
    goToSongsheet() {
      this.$router.push({
        name: "Songsheet",
      });
    },
    goToConfig(){
      this.$router.push({
        name: "Config",
      });
    }
  },
};
</script>
<style scoped>
.Nav {
  position: fixed;
  left: 0vw;
  top:5vh;
  width: 5vw;
  height: 100vh;
}
li {
  width: 5vw;
  height: 40px;
  margin-bottom: 20px;
}
li:hover{
  background-color: rgb(157, 157, 157);
}
ul{
  list-style-type: none;
}
.active{
  background-color:rgb(0, 0, 0);
  color:rgb(255, 255, 255)
}
</style>
