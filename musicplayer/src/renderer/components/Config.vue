<template>
  <div class="container">
    <div class="file">
      <h3>媒体库</h3>
      <button @click="selectFolder">添加文件夹</button>
      <table>
        <tr v-for="(item, i) in path">
          <td>{{ item.path }}</td>
          <td><button @click="removeFolder(i)">移除</button></td>
        </tr>
      </table>
      <button @click="scanFolder">开始扫描</button>
    </div>
    <div class="progress-window" v-if="isStartScan">
      <p>{{ progress }}%</p>
      <p>{{ currentScanningFile }}</p>
      <div class="progress-container">
        <div class="progress" ref="progressBar" id="progress-bar" :style="{width:progress+'%'}"></div>
      <div class="progress" ref="progressBg" id="progress-bg"></div>
      </div>
      
    </div>
  </div>
</template>
<script>
export default {
  inject: ["folder", "setFolder", "getFolder"],
  data() {
    return {
      path: [],
      progress: 0,
      isStartScan: false,
      currentScanningFile: "",
    };
  },
  methods: {
    async fetchFolder() {
      const response = await fetch("http://localhost:3000/getFolderpath");
      this.path = await response.json();
      //  const folder=await response.json();
      //  console.log(folder);
      this.setFolder(this.path);
      //  this.path=folder;
    },
    async selectFolder() {
      await window.electronAPI.selectFolder();
      await this.fetchFolder();
    },
    async scanFolder() {
      this.isStartScan = true;
      console.log(window.electronAPI);
      await window.electronAPI.scanFolder();
    },
    async removeFolder(i) {
      console.log(this.path[i]);
      const response = await fetch("http://localhost:3000/deleteFolderpath", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(this.path[i]),
      });

      await this.fetchFolder();
    },
  },
  async created() {
    await this.fetchFolder();
  },
  mounted() {
    window.electronAPI.onScanProgress((data) => {
      if (data.completed) {
        this.progress = 100;
        this.currentScanningFile = "扫描完成";
        this.isStartScan = false;
        return;
      }
      this.progress = data.progress;
      this.currentScanningFile = data.currentFile;
      //this.isStartScan=false;
    });
    window.electronAPI.onScanError((error) => {
      alert(error);
      this.isStartScan = false;
    });
  },
  unmounted() {
    window.electronAPI.removeListeners();
  },
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
.progress-window {
  position: fixed;
  left: 40vw;
  top: 30vh;
  width: 20vw;
  height: 30vh;
  border: 2px solid black;
  background-color: rgb(255, 255, 255);
}
.progress-container{
  position: absolute;
  left: 10%;
  bottom: 10%;
  width: 80%;
  height: 10px;
}
.progress {
  position: absolute;
  height: 100%;
}
#progress-bar {
  z-index: 2;
  background-color: aquamarine;
}
#progress-bg {
  z-index: 1;
  width: 100%;
  background: rgba(95, 158, 160, 0.3);
}
</style>
