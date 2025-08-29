# 桌面端本地音乐播放器
## 总览
技术栈：electron + vue + sqlite
此项目的编写初衷是学习javascript,vue,node.js,我又很喜欢听歌，于是慢慢就有了该项目
此版本实现的主要功能： 
1.扫描指定文件夹将歌曲元数据加入数据库； 
2.专辑页，歌手页，全部歌曲页显示； 
3.可自建歌单；  
4.可批量添加/删除歌曲在歌单； 
5.三种播放模式：顺序列表播放、循环列表播放、单曲循环 
## 介绍
### 播放页
<img width="1911" height="1071" alt="屏幕截图 2025-08-15 223445" src="https://github.com/user-attachments/assets/4db42a87-6b13-4505-b229-c9b67a70adbf" />

### 全部歌曲页面
<img width="1910" height="1011" alt="屏幕截图 2025-08-29 165025" src="https://github.com/user-attachments/assets/205794ea-c192-4f4a-90d3-e5f90465f9ed" />
可以批量将歌曲添加到歌单：
<img width="1907" height="1018" alt="屏幕截图 2025-08-29 165828" src="https://github.com/user-attachments/assets/59246ae1-2db2-4259-8de5-b01538093493" />

### 专辑页面
全部专辑展示：
<img width="1914" height="1008" alt="屏幕截图 2025-08-29 165002" src="https://github.com/user-attachments/assets/a4299792-a3e4-47b0-b7a8-ff282c87432b" />
单张专辑详情：
<img width="1919" height="1014" alt="屏幕截图 2025-08-29 165325" src="https://github.com/user-attachments/assets/e4b88732-1ecd-4acf-9e8d-e14d852e92f8" />
### 歌手（艺术家）页面
全部歌手：
<img width="1915" height="1010" alt="屏幕截图 2025-08-29 165143" src="https://github.com/user-attachments/assets/4ada96a8-71c0-4f6e-9e1c-9bf4b5351bfb" />
单个歌手详情：
<img width="1913" height="1008" alt="屏幕截图 2025-08-29 165233" src="https://github.com/user-attachments/assets/6f2ce193-db5f-427d-9d52-f8ecea77178b" />
## 项目使用
1.npm初始化
```base
npm init
```
2.安装依赖
```base
npm install
```
3.启动vue开发服务器
```base
npm run dev
```
4.启动electron
```base
npm run start
```
## 最后
由于本人刚入门，水平有限，该项目还非常稚嫩，功能也不是很完善，后续会重构升级
如果喜欢该项目，请点个star*_*

