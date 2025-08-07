
const fs = require("fs");
const path = require("path");
// 常见音频文件扩展名
const AUDIO_EXTENSIONS = [
  ".mp3",
  ".wav",
  ".aac",
  ".ogg",
  ".flac",
  ".m4a",
  ".wma",
];
const files = (function() {
  var pathList=[];
  return {
    getPathList: function () {
      return pathList;
    },
    setPathList: function (dir) {
      pathList = getAudioFilesSync(dir);
    },
  };
})();
module.exports=files;
function getAudioFilesSync(dir, filesList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getAudioFilesSync(filePath, filesList);
    } else {
      const ext = path.extname(filePath).toLowerCase();
      if (AUDIO_EXTENSIONS.includes(ext)) {
        filesList.push(filePath);
      }
    }
  });

  return filesList;
}

// 使用示例
// files.setPathList(
//   "D:/本地音乐/CD音乐/EGOIST - Extra terrestrial Biological Entities {BRMM-10727} [CD-FLAC]"
// );
// console.log(files.getPathList());
