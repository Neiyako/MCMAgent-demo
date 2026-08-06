<template>
  <div class="settings"><h2>⚙️ 设置</h2>
    <div class="field"><label>API Key</label><input v-model="settings.apiKey" type="password" placeholder="sk-..." /></div>
    <div class="field"><label>API 地址 (Base URL)</label><input v-model="settings.baseUrl" placeholder="如 https://api.deepseek.com/v1" /><p class="hint">留空使用默认</p></div>
    <div class="field"><label>模型</label><input v-model="settings.model" placeholder="如 deepseek/deepseek-chat" /></div>
    <button @click="settings.save()">保存设置</button>
  </div>
</template>
<script setup lang="ts">
import { useSettings } from "@/composables/useSettings"
const settings = useSettings()
</script>
<style scoped>
.settings { max-width:500px; margin:40px auto; padding:24px; background:white; border-radius:16px; box-shadow:0 1px 4px rgba(0,0,0,0.08); }
.settings h2 { margin-bottom:20px; color:#0b2b44; }
.field { margin-bottom:16px; } .field label { display:block; font-weight:600; margin-bottom:4px; color:#0b2b44; } .field input { width:100%; padding:10px 12px; border:1px solid #e2e8f0; border-radius:8px; font-size:14px; } .field input:focus { outline:none; border-color:#2d7aff; } .hint { font-size:13px; color:#94a3b8; margin-top:4px; }
button { padding:10px 24px; background:#2d7aff; color:white; border:none; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; } button:hover { background:#1a5cdb; }
</style>