<template>
  <div class="container">
    <div v-for="item in data" class="artist" @click="goToArtistDetail(item.artist)">
      <p>{{ item.artist }}</p>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      data: "",
    };
  },
  methods: {
    async fetchData() {
      const response = await fetch("http://localhost:3000/artists");
      if (!response.ok) throw new Error("网络响应异常");
      this.data = await response.json();
      // console.log(this.data);
    },
    goToArtistDetail(artistName){
      this.$router.push({
        name:"ArtistDetails",
        params:{artistName:artistName}
      });
    }
  },
  created() {
    //模版创建时自动调用函数
    // console.log(this.$router);
    this.fetchData();
  },
};
</script>
<style scoped>
.container {
  position: fixed;
  left:10vw;
  height: 80vh;
  width: 90vw;
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: flex-start;
  overflow-y: scroll;
}
.artist {
  width: calc(12.5% - 15px); /* 每行8个，每个占12.5%宽度减去间隙 */
  height: 200px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}
.artist:hover {
  transform: translateY(-5px);
}

p {
  overflow: hidden;
  height: 20px;
  text-overflow: ellipsis;
}
</style>
