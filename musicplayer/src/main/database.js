const sqlite3 = require("sqlite3").verbose();
// const Meta = require("./getMetaByFFmpeg.js");
const Meta = require("./getMetadata.js");
const files = require("./files.js");

const db = new sqlite3.Database("musicLibrary.db");
const musicDB = (() => {
  return {
    initializeDB: initializeDatabase,
    writeSongTable: writeDataTo_SongTable,
    writeAlbumTable: writeDataTo_AlbumTable_By_SongTable,
    writeFolderpathTable: writeToFolderpathTable,
    getFolderpath: getFolderpath,
    closeDB: closeDatabase,
    deleteSongAndAlbumTable:deleteSongTableAndAlbumTable
  };
})();
module.exports = { musicDB, db };
//初始化数据库
function initializeDatabase() {
  db.serialize(() => {
   
    //创建歌曲、专辑、歌单、歌单歌曲关联表
    db.run(
      `CREATE TABLE IF NOT EXISTS song (
        title TEXT,
        artist TEXT,
        album TEXT,
        album_artist TEXT,
        format TEXT,
        disc TEXT,
        track TEXT,
        cover TEXT,
        lyrics TEXT,
        date TEXT,
        duration FLOAT,
        size TEXT,
        bitsdepth TEXT,
        samplerate TEXT,
        bitrate INTEGER,
        channels INTEGER,
        filename TEXT,
        filepath TEXT PRIMARY KEY)`,
      (err) => (err ? console.log(err) : console.log("song table created or already exists."))
    );
    db.run(
      `
    CREATE TABLE IF NOT EXISTS album (
      album TEXT PRIMARY KEY,
      album_artist TEXT,
      disc_count INTEGER,
      track_count INTEGER,
      date TEXT,
      cover TEXT,
      FOREIGN KEY (album) REFERENCES song(album)
    )
  `,
      (err) => {
        if (err) {
          return console.error("Error creating album table:", err.message);
        }
        console.log("album table created or already exists.");
      }
    );
    db.run(
      `
    CREATE TABLE IF NOT EXISTS songsheet(
    name TEXT PRIMARY KEY NOT NULL
    )
    `,
      (err) => {
        if (err) {
          return console.error("Error creating songsheet table:", err.message);
        }
        console.log("songsheet table created or already exists.");
      }
    );
    db.run(
      `
    CREATE TABLE IF NOT EXISTS songsheet_song(
    songsheet_name TEXT ,
    song_filepath TEXT ,
    position INTEGER,
    PRIMARY KEY (songsheet_name,song_filepath)
    )
    `,
      (err) => {
        if (err) {
          return console.error(
            "Error creating songsheet_song table:",
            err.message
          );
        }
        console.log("songsheet_song table created or already exists.");
      }
    );
    db.run(
      `CREATE TABLE IF NOT EXISTS folderpath(
    path TEXT PRIMARY KEY
    )`,
      (err) => {
        if (err) {
          return console.error("Error creating folderpath table:", err.message);
        }
        console.log("folderpath table created or already exists.");
      }
    );
  });

  // db.all(`DELETE FROM songsheet;`);
  // db.all(`DELETE FROM songsheet_song;`);
}
function deleteSongTableAndAlbumTable(){
    db.run(`DELETE FROM song;`);
    db.run(`DELETE FROM album;`);
}
//向歌曲表写数据
async function writeDataTo_SongTable(filepath) {
  
  
    try {
      // 1. 获取元数据
      await Meta.setMetadata(filepath);
      const metadata = Meta.getMetadata();

      // 2. 插入数据
      db.all(
        `INSERT OR IGNORE INTO song (title,artist,album,album_artist,format,disc,track,cover,lyrics,date,duration,size,bitsdepth,samplerate,bitrate,channels,filename,filepath) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          metadata.title,
          metadata.artist,
          metadata.album,
          metadata.album_artist,
          metadata.format,
          metadata.disc,
          metadata.track,
          metadata.cover,
          metadata.lyrics,
          metadata.date,
          metadata.duration,
          metadata.size,
          metadata.bitsdepth,
          metadata.samplerate,
          metadata.bitrate,
          metadata.channels,
          metadata.filename,
          metadata.filepath,
        ],
        function (err) {
          if (err) console.log(err);
          else {
            console.log(`插入成功: ${metadata.title}`);
          }
        }
      );
    } catch (error) {
      console.error(`处理文件 ${file} 时出错:`, error);
    }
  
}
//依据Song表向Album表写数据
function writeDataTo_AlbumTable_By_SongTable() {
  db.all(
    `
    INSERT OR IGNORE INTO album (album, album_artist, disc_count, track_count,date,cover)
    SELECT 
      album,
      album_artist,
      COUNT(DISTINCT disc) AS disc_count,
      COUNT(DISTINCT filepath) AS track_count,
      date,
      cover
    FROM song
    GROUP BY album, album_artist
  `,
    (err) => {
      if (err) {
        return console.error("Error initializing album data:", err.message);
      }
      console.log("Album data initialized from song table.");
    }
  );
}

function writeToFolderpathTable(arr) {
  if (arr.length > 0) {
    arr.forEach((item) => {
      db.all(`INSERT OR IGNORE INTO folderpath (path) VALUES(?)`, [item]);
    });
  }
}
function getFolderpath() {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM folderpath`, (err, rows) => {
    if(err) reject(err);
    else resolve(rows);
  });
  })
}
//关闭数据库
function closeDatabase() {
  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log("Closed the database connection.");
  });
}
