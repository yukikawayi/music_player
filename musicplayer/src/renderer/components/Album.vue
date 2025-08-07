<template>
  <div class="container">
    <div v-for="item in this.albums" class="album" @click="goToAlbumDetail(item.album)">
      <img :src="`data:jpeg;base64,${item.cover}`" />
      <p>{{ item.album }}</p>
      <p>{{ item.album_artist }}</p>
    </div>
  </div>
</template>
<script>
export default {
  inject: [
    "albums",
    "getAlbums"
  ],
  methods: {
    // async fetchData() {
    //   const response = await fetch("http://localhost:3000/albums");
    //   if (!response.ok) throw new Error("网络响应异常");
    //   this.data = await response.json();
    //   console.log(this.data);
    // },
    goToAlbumDetail(albumName){
      this.$router.push({
        name:"AlbumDetails",
        params:{albumName:albumName}
      });
     
    },
  },
 async created() {
    //模版创建时自动调用函数
    // console.log(this.albums);
    await this.getAlbums();
  },
}

</script>
<style scoped>
.container {
  position: fixed;
  left:10vw;/*150px*/ 
  height: 80vh;
  width: 90vw;
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: flex-start;
  overflow-y: scroll;
}
.album {
  width: calc(12.5% - 15px); /* 每行8个，每个占12.5%宽度减去间隙 */
  height: 200px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}
.album:hover {
  transform: translateY(-5px);
}
img {
  width: 100px;
  height: 100px;
  border-radius: 5px;
}
p {
  white-space: nowrap;
  overflow: hidden;
  height: 20px;
  text-overflow: ellipsis;
}
</style>
