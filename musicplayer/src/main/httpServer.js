const sqlite3 = require("sqlite3").verbose();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const server = express();
server.use(express.json());
const { musicDB,db } = require("./database");
let AUDIO_DIRS =[];

// const configFilePath =
//   "E:/VSCode_Program/electron_vue/src/renderer/vue-project/src/config.json";
function startHttpServer() {
  server.use(cors());
  // 将物理路径映射为URL路径
  // 你的本地音乐目录
  
  updateAudioDirs();
  // const data = fs.readFileSync(configFilePath, "utf8");
  // const setting = JSON.parse(data);
  // for (const path of setting.mediaPosition) {
  //   AUDIO_DIRS.push(path);
  // }
  server.use("/audios", (req, res, next) => {
    const decodedPath = decodeURIComponent(req.path); // 解码 %XX 字符
    // const decodedPath = req.path;
    const filePath = decodedPath.replace(/\//g, path.sep); // 转成系统路径格式

    // 遍历所有目录，查找文件
    for (const dir of AUDIO_DIRS) {
      const fullPath = path.join(dir.path, filePath);
      if (fs.existsSync(fullPath)) {
        return res.sendFile(fullPath); // 找到文件，直接返回
      }
    }

    // 没找到，返回 404
    res.status(404).send("Audio file not found");
  });
  //server.use("/audios", express.static(AUDIO_DIR));
  server.get("/", (req, res) => {
    res.send("hello world");
  });

  server.get("/albums", (req, res) => {
    db.all("SELECT * FROM album", (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      //以JSON格式发送
      res.json(rows);
    });
  });
  server.get(`/albums/:album`, (req, res) => {
    const album = decodeURIComponent(req.params.album);
    db.all(`SELECT * FROM album WHERE album=?`, [album], (err, albumRows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      db.all(`SELECT * FROM song WHERE album=?`, [album], (err, songRows) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({
          album: albumRows,
          songs: songRows,
        });
      });
    });
  });
  server.get("/artists", (req, res) => {
    db.all(
      `SELECT 
    artist,
    COUNT(DISTINCT album) AS album_count,
    COUNT(*) AS track_count
    FROM song
    GROUP BY artist`,
      (err, rows) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        //以JSON格式发送
        res.json(rows);
      }
    );
  });
  //获取单个艺术家的基本信息、参与专辑和歌曲
  server.get(`/artists/:artist`, (req, res) => {
    const artist = req.params.artist;
    db.all(
      `SELECT 
    artist,
    COUNT(DISTINCT album) AS album_count,
    COUNT(*) AS track_count
    FROM song
     WHERE artist=?
    GROUP BY artist`,
      [artist],
      (err, artist_total_Rows) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        db.all(
          `SELECT DISTINCT 
        album 
        FROM song 
        WHERE artist=?
        GROUP BY album`,
          [artist],
          (err, artist_album_Rows) => {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }
            db.all(
              `SELECT  
        *
        FROM song 
        WHERE artist=?`,
              [artist],
              (err, artist_track_Rows) => {
                if (err) {
                  res.status(500).json({ error: err.message });
                  return;
                }

                res.json({
                  total: artist_total_Rows, //总览信息
                  album: artist_album_Rows,
                  songs: artist_track_Rows,
                });
              }
            );
          }
        );
      }
    );
  });
  //获取所有歌曲
  server.get("/allsongs", (req, res) => {
    db.all(
      `SELECT title,
        artist,
        album ,
        album_artist ,
        format ,
        disc,
        track,
        lyrics,
        date,
        duration,
        size,
        bitsdepth,
        samplerate,
        bitrate ,
        channels,
        filename,
        filepath FROM song`,
      (err, rows) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json(rows);
      }
    );
  });
  //获取所有歌单
  server.get("/songsheets", (req, res) => {
    db.all(`SELECT * FROM songsheet`, (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    });
  });
  //创建歌单
  server.post("/songsheets", (req, res) => {
    try {
      const { name } = req.body;
      db.all(`INSERT OR IGNORE INTO songsheet (name) VALUES (?)`, [name]);
      res.send("创建成功！");
    } catch (error) {
      console.log(error.message);
    }
  });
  //添加歌曲与歌单的关联记录
  server.post("/addToSongsheet", (req, res) => {
    const { songsFilePath, choisedSongsheets } = req.body;
    console.log(songsFilePath);
    console.log(choisedSongsheets);
    //将歌曲添加到不同的歌单中
    choisedSongsheets.forEach((songsheetItem) => {
      let j = 0;
      songsFilePath.forEach((songItem) => {
        db.all(
          `INSERT OR IGNORE INTO songsheet_song (
       songsheet_name,
    song_filepath,
    position
     ) VALUES (?,?,?)`,
          [songsheetItem, songItem, j]
        );
        j++;
      });
      res.send("成功添加到歌单！");
    });
  });
  //删除一个歌单中的若干记录
  server.delete("/:songsheet/deleteSongs", (req, res) => {
    console.log("开始执行...");
    const songsheet = decodeURIComponent(req.params.songsheet);
    const songs = req.body;
    console.log(songs);
    console.log(songsheet);
    songs.forEach((item) => {
      db.all(
        `DELETE FROM songsheet_song 
      WHERE songsheet_name=? AND song_filepath=?`,
        [songsheet, item]
      );
    });
    res.send("删除成功！");
  });
  //获取一个歌单的内容
  server.get("/songsheets/:songsheet", (req, res) => {
    const songsheet = decodeURIComponent(req.params.songsheet);
    db.all(
      `SELECT * 
    FROM song,songsheet_song
    WHERE songsheet_name=? AND filepath=song_filepath
     `,
      [songsheet],
      (err, rows) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json(rows);
      }
    );
  });
  //删除多个歌单
  server.delete("/deleteSongsheets", (req, res) => {
    const songsheets = req.body;
    songsheets.forEach((item) => {
      db.all(
        `DELETE FROM songsheet_song 
      WHERE songsheet_name=? `,
        [item],
        (err) => {
          if (!err) {
            db.all(
              `DELETE FROM songsheet 
      WHERE name=? `,
              [item]
            );
          }
        }
      );
    });
    res.send("删除成功！");
  });
  server.get("/getFolderpath",(req,res)=>{
    db.all(`SELECT * FROM folderpath`,(err,rows)=>{
      res.json(rows);
    })
  });
  server.delete("/deleteFolderpath",(req,res)=>{
    const path=req.body;
    db.all(`DELETE FROM folderpath WHERE path=?`,[path.path]);
    res.send("删除成功");
  })
  server.get("/:song", (req, res) => {
    const song = req.params.song;
    db.all(`SELECT * FROM song WHERE title=?`, [song], (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      //以JSON格式发送
      res.json(rows);
    });
  });
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

function updateAudioDirs(){
  (async ()=>{
    AUDIO_DIRS =await musicDB.getFolderpath();
    console.log(AUDIO_DIRS)
  })();
}
module.exports = {startHttpServer,updateAudioDirs}
