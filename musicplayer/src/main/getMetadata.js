const { exec } = require("child_process");
const util = require("util");
// const execPromise = util.promisify(exec);
const path = require("path");
const {Base64}= require("js-base64");
const {parseFile}=require('music-metadata');
const fs=require('fs').promises
const Meta = (function () {
  var metadata;
  return {
    getMetadata: function () {
      return metadata;
    },
    setMetadata: async function (filePath) {
      metadata = await readTrackMetadata(filePath);
    },
  };
})();

async function readTrackMetadata(filePath) {
  try {
    
    const metadata = await parseFile(filePath);
    
    //console.log(metadata);
    
    // 提取常用信息
    const stats=await fs.stat(filePath);
    return {
      title: metadata.common?.title|| path.basename(filePath),  
      artist: metadata.common?.artist || "未知艺术家",
      album:metadata.common?.album||"未知专辑",
      album_artist:metadata.common?.albumartist||"未知专辑艺术家",
      format: metadata.format.container,
      disc:metadata.common?.disk.no||'1',
      track:metadata.common?.track.no,//待定
      cover:metadata.common.picture?Uint8ArrayBufferToBase64(metadata.common?.picture[0].data):null,//待定
      lyrics:metadata.common.lyrics?JSON.stringify(metadata.common.lyrics[0].syncText):null,
      date:metadata.common?.date||"未知年份",
      duration: metadata.format.duration,//单位：s
      size:stats.size/(1024*1024),//+"MB",
      // 音频流信息
      
      bitsdepth:metadata.format.bitsPerSample||16,//位深
      samplerate:metadata.format.sampleRate,//+"Hz",//采样率
      bitrate: parseInt(metadata.format.bitrate),//比特率
      channels:metadata.format.numberOfChannels,//声道数
      //文件信息
      filename: path.basename(filePath),
      filepath:path.resolve(filePath),
    };
  } catch (error) {
    console.error("元数据读取失败:", error);
    return null;
  }
}


// (async()=>{
//     await Meta.setMetadata('D:\\本地音乐\\星空列车与白的旅行\\02 星空鉄道ミルキィウェイ.wav');
//     console.log(Meta.getMetadata());
// })();

module.exports=Meta;

// function arrayBufferToBase64(buffer) {
//   let binary = "";
//   const bytes = new Uint8Array(buffer);
//   for (let i = 0; i < bytes.byteLength; i++) {
//     binary += String.fromCharCode(bytes[i]);
//   }
//   return Base64.btoa(binary);
// }
function Uint8ArrayBufferToBase64(Uint8Array) {
  let binary = "";
  ;
  for (let i = 0; i <Uint8Array.byteLength; i++) {
    binary += String.fromCharCode(Uint8Array[i]);
  }
  return Base64.btoa(binary);
}
//大写属性名变为小写
function convertKeysToLowerCaseDeep(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(convertKeysToLowerCaseDeep);
  }
  
  return Object.keys(obj).reduce((newObj, key) => {
    const value = obj[key];
    newObj[key.toLowerCase()] = convertKeysToLowerCaseDeep(value);
    return newObj;
  }, {});
}

