<script>
import Public from './components/Public.vue';
import Bar from './components/Bar.vue';
import Navbar from './components/Navbar.vue';
export default{
  components:{
    Navbar,
    Public,
    Bar
  }
}
</script>



<template>
  <Navbar></Navbar>
  <Public>
    <router-view/>
    <Bar></Bar>
  </Public>
    
  </template>
