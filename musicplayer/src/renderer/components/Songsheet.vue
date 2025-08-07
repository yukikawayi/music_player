<template>
  <div class="container">
    <div class="bar">
      <button @click="openAdd">添加</button>
      <button @click="openAdd">查找</button>
      <button
        @click="
          () => {
            isDelete = true;
          }
        "
      >
        删除
      </button>
    </div>

    <div v-if="isAdd">
      <input type="text" ref="inputA" /><br />
      <tr>
        <button @click="createSongsheet">确定</button>
        <button @click="closeAdd">取消</button>
      </tr>
    </div>
    <!--删除操作栏-->
    <div v-if="isDelete" class="deleteBar">
      <button style="float: left" @click="deleteSongsheets">删除</button>
      <button
        @click="
          () => {
            isDelete = false;
            initSongsheetsChoisedState();
          }
        "
        style="float: right"
      >
        取消
      </button>
    </div>
    <div class="flex">
      <div class="songsheet-container" v-for="item in songsheets">
        <div class="songsheet" @click="goToSongsheetDetail(item.name)">
          <p>{{ songsheets.length != 0 ? item.name : "什么都没有哦" }}</p>
        </div>
        <div
          class="circleForDelete"
          :class="switchClass(item)"
          v-if="isDelete"
          @click="choiseOrNotChoiseOneSongsheet(item)"
        >
          {{ item.choised_state ? "✔" : "" }}
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      songsheets: [],
      isAdd: false,
      isFind: false,
      isDelete: false,
    };
  },
  methods: {
    async getAllSongsheets() {
      const response = await fetch("http://localhost:3000/songsheets");
      if (!response.ok) throw new Error("网络响应异常");
      this.songsheets = await response.json();
      // console.log(this.songsheets);
    },
    goToSongsheetDetail(songsheetName) {
      this.$router.push({
        name: "SongsheetDetail",
        params: { songsheetName: songsheetName },
      });
    },
    openAdd() {
      this.isAdd = true;
    },
    closeAdd() {
      this.isAdd = false;
    },
    async createSongsheet() {
      //1.读取文本框中的值
      //2.发起POST请求
      //3.重新拉取数据
      const name = this.$refs.inputA.value;
      if (name != "") {
        const response = await fetch("http://localhost:3000/songsheets", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name }),
        });
        //console.log("res="`${await response.json()}`);
        await this.getAllSongsheets();
      } else {
        alert("歌单名不能为空！");
      }
    },
    //初始化歌单选择状态
    initSongsheetsChoisedState() {
      this.songsheets.forEach((item) => {
        item.choised_state = false;
      });
    },
    choiseOrNotChoiseOneSongsheet(item) {
      item.choised_state = !item.choised_state;
    },
    switchClass(item) {
      return item.choised_state ? "choised" : "noChoised";
    },
    //删除歌单
   async deleteSongsheets() {
       const songsheets=[];
       this.songsheets.forEach(item=>{
        if(item.choised_state){
          songsheets.push(item.name);
        }
       });
       if(songsheets.length!=0){
        const response=await fetch(`http://localhost:3000/deleteSongsheets`,{
          method:"DELETE",
          headers:{"Content-Type": "application/json"},
          body:JSON.stringify(songsheets)
        });
        if(response.ok){
          alert("删除成功");
          this.isDelete=false;
        }
       }
       await this.getAllSongsheets();
    },
  },
  created() {
    this.getAllSongsheets();
  },
};
</script>
<style scoped>
.container {
  position: absolute;
  left: 100px;
  top: 0px;
  height: 80vh;
  width: 1200px;
  /* display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: flex-start;
  overflow-y: scroll; */
}
.bar {
  position: fixed;
  top: 0;
  left: 40%;
  width: 200px;
  height: 50px;
  display: flex;
  justify-content: center;
}
.deleteBar {
  position: fixed;
  width: 200px;
  height: 80px;
  left: 400px;
  top: 0;
}
.flex{
  position: relative;
  top:100px;
  left:50px;
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: flex-start;
  overflow-y: scroll;
  /*border: 2px solid black;*/
  box-shadow: 0 2px 8px rgba(68, 229, 216, 0.845);
}
.songsheet-container {
  position: relative;
  width: calc(12.5% - 15px); /* 每行8个，每个占12.5%宽度减去间隙 */
  height: 200px;
  margin-bottom: 20px;
}
.songsheet {
  /* width: calc(12.5% - 15px); 每行8个，每个占12.5%宽度减去间隙 */
  height: 200px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.choised {
  background-color: aquamarine;
  /* color: black; */
}
.circleForDelete {
  position: absolute;
  width: 100%;
  height: 30%;
  bottom: 0px;
  left: 0;
  /* clip-path: circle(50% at 50% 50%); */
  border: 1px solid black;
}
</style>
