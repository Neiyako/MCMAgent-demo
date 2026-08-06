<template>
  <aside class="history-panel">
    <div class="history-header"><span><i class="fas fa-history"></i> 对话历史</span><button class="new-btn" @click="createNew"><i class="fas fa-plus"></i> 新建</button></div>
    <div class="history-list"><div v-if="!convList.length" class="empty">暂无对话</div><div v-for="conv in convList" :key="conv.id" class="history-item" :class="{ active: conv.id === currentId }" @click="switchTo(conv.id)"><span class="conv-title">{{ conv.title }}</span><span class="conv-time">{{ formatTime(conv.createdAt) }}</span><button class="del-btn" @click.stop="deleteConv(conv.id)" title="删除"><i class="fas fa-trash-alt"></i></button></div></div>
  </aside>
</template>
<script setup lang="ts">
import { computed } from "vue"
import { useAppStore } from "@/stores/appStore"
const store = useAppStore()
const props = defineProps<{ role: "modeler" | "coder" | "writer" }>()
const convList = computed(() => store.conversations[props.role] || [])
const currentId = computed(() => store.currentConvId[props.role])
const emit = defineEmits<{ (e: "switch-conv"): void }>()
const createNew = () => { store.createConversation(props.role); emit("switch-conv") }
const switchTo = (id: string) => { store.switchConversation(props.role, id); emit("switch-conv") }
const deleteConv = (id: string) => { if (confirm("确定删除此对话吗？")) store.deleteConversation(props.role, id); emit("switch-conv") }
const formatTime = (ts: number) => { const d = new Date(ts); return `${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}` }
</script>
<style scoped>
.history-panel { width:240px; min-width:240px; background:#f8fafc; border-right:1px solid #e2e8f0; display:flex; flex-direction:column; height:100%; overflow:hidden; }
.history-header { padding:14px 16px 10px; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center; flex-shrink:0; }
.history-header span { font-weight:600; font-size:14px; color:#0b2b44; } .history-header span i { color:#2d7aff; }
.new-btn { background:#2d7aff; color:white; border:none; border-radius:6px; padding:4px 12px; font-size:13px; display:flex; align-items:center; gap:4px; } .new-btn:hover { background:#1a5cdb; }
.history-list { flex:1; overflow-y:auto; padding:8px 0; }
.empty { color:#94a3b8; font-size:13px; text-align:center; padding:40px 16px; }
.history-item { display:flex; align-items:center; padding:8px 14px; cursor:pointer; border-left:3px solid transparent; transition:all 0.15s; gap:6px; }
.history-item:hover { background:#f1f5f9; }
.history-item.active { background:#e2e8f0; border-left-color:#2d7aff; }
.conv-title { flex:1; font-size:13px; color:#334155; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.conv-time { font-size:11px; color:#94a3b8; flex-shrink:0; }
.del-btn { background:none; border:none; color:#94a3b8; cursor:pointer; padding:2px; } .del-btn:hover { color:#ef4444; }
</style>