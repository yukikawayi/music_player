const { app, BrowserWindow ,ipcMain,dialog} = require('electron')
const path=require('path')
const fs = require('fs').promises;
const {musicDB}=require('./database')
const { exec } = require("child_process");
const {startHttpServer,updateAudioDirs}=require('./httpServer')
const files = require("./files.js");
// const configFilePath="E:/VSCode_Program/electron_vue/src/renderer/vue-project/src/config.json"

const createWindow = () => {
  const win = new BrowserWindow({
    //窗口配置
    width: 800,
    height: 600,
    title:"音乐播放器0.0.1",
    icon:path.join(__dirname,'../../build/icon.png'),
    webPreferences:{
        contextIsolation:true,
        nodeIntegration:false,
        preload:path.join(__dirname,"../preload.js")
    }
  })
  // win.loadURL('http://localhost:5173/');
  win.loadURL(`file://${path.join(__dirname,"../../dist/index.html")}`)
  
  startHttpServer();
}
// 处理选择文件夹的 IPC 通信
ipcMain.handle('select-folder', async () => {
  musicDB.initializeDB();
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    musicDB.writeFolderpathTable(result.filePaths);
    updateAudioDirs();
  }
});

ipcMain.handle("scan-folder",async(event)=>{
  try {
    //删除旧表
    musicDB.deleteSongAndAlbumTable();
    musicDB.initializeDB();
    //获取要扫描的文件夹
    const pathArr=await musicDB.getFolderpath();
    console.log(pathArr);
    //获取要扫描的文件总数
    const allfiles=[];
    for(const item of pathArr){
      files.setPathList(item.path);
      //获取一个目录下的所有文件路径
      const filesList = files.getPathList();
      for(const path of filesList){
        if(!allfiles.includes(path)){
          allfiles.push(path);
        }
      }
    }
    const tatalFilesCounts=allfiles.length;
    let processedFilesCounts=0;
    for(const path of allfiles){
      //读取每个文件的元数据并写入数据库
      await musicDB.writeSongTable(path);
      processedFilesCounts++;
      //计算进度
      const progress=Math.floor((processedFilesCounts/tatalFilesCounts)*100);
      event.sender.send('scan-progress',{
        progress:progress,
        total:tatalFilesCounts,
        processed:processedFilesCounts,
        currentFile:path
      });
    }
      musicDB.writeAlbumTable();
      event.sender.send('scan-progress',{
        progress:100,
        total:tatalFilesCounts,
        processed:tatalFilesCounts,
        currentFile:'扫描完成',
        completed:true
      });
      return{success:true};
  } catch (error) {
    event.sender.send('scan-error',error.message);
    return{success:false};
  }
 //deleteSongCoverColumn();
});
// ipcMain.handle("remove-folder",async(e,arr)=>{
//   console.log(arr[0]);
//   const data = await fs.readFile(configFilePath, 'utf8');
//   const setting = JSON.parse(data);
//   setting.mediaPosition.splice(arr[0],1);
//   const updatedData = JSON.stringify(setting, null, 2);
//   await fs.writeFile(configFilePath, updatedData, 'utf8');

// });

app.whenReady().then(async() => {
  //exec(`node httpServer.js`);
  createWindow()
})