const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  onScanProgress:(callback)=>{
    ipcRenderer.on('scan-progress',(event,data)=>callback(data));
  },
  onScanError:(callback)=>{
    ipcRenderer.on('scan-error',(event,error)=>callback(error));
  },
  removeListeners: () => {
    ipcRenderer.removeAllListeners('scan-progress');
    ipcRenderer.removeAllListeners('scan-error');
  },
  scanFolder:()=>ipcRenderer.invoke('scan-folder'),
  // removeFolder:(i)=>ipcRenderer.invoke('remove-folder',[i]),
  printLog:()=>ipcRenderer.invoke('print-log')
});