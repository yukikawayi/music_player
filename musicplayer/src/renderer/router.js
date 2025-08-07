import { createRouter, createWebHashHistory } from 'vue-router'
import Album from './components/Album.vue'
import AlbumDetails from './components/AlbumDetails.vue'

import Home from './components/Home.vue'
import Artist from './components/Artist.vue'
import ArtistDetails from './components/ArtistDetails.vue'

import Songsheet from './components/Songsheet.vue'
import AllSongs from './components/AllSongs.vue'
import SongsheetDetail from './components/SongsheetDetail.vue'
import Config from './components/Config.vue'
const routes = [
  {
    path:"/",
    name:"Home",
    component:Home
  },
  {
    path:"/allsongs",
    name:"AllSongs",
    component:AllSongs
  },
  {
    path: '/albums',
    name: 'Album',
    component: Album,
  },
  {
    path: '/albums/:albumName',  // 使用动态路由参数
    name: 'AlbumDetails',
    component: AlbumDetails,
    //component:()=>import("@/components/FatherAndSon.vue"),
    props: true  // 启用 props 接收路由参数
  },
  {
    path:"/artists",
    name:"Artist",
    component:Artist
  },
  {
    path:"/artists/:artistName",
    name:"ArtistDetails",
    component:ArtistDetails,
    props:true
  },
  {
    path:"/songsheets",
    name:"Songsheet",
    component:Songsheet
  },
  {
    path:"/songsheets/:songsheetName",
    name:"SongsheetDetail",
    component:SongsheetDetail,
    props:true
  },
  {
    path:"/config",
    name:"Config",
    component:Config
  }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes
})

export default router