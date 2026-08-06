<template>
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>
<script setup lang="ts">
import { onMounted } from "vue"
import { useAppStore } from "@/stores/appStore"
const store = useAppStore()
onMounted(() => store.init())
</script>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
#app { min-height:100vh; background:#eef3f8; font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif; }
.fade-enter-active, .fade-leave-active { transition: opacity .3s; }
.fade-enter-from, .fade-leave-to { opacity:0; }
</style>