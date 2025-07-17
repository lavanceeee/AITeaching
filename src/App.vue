<script setup lang="ts">

</script>

<template>
  <router-view/>
</template>

<style>
/* 全局样式 */
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden; /* 防止整个页面出现滚动条 */
}

#app {
  width: 100%;
  height: 100%;
  overflow: hidden; /* 同样防止app层出现滚动条 */
}
</style>
