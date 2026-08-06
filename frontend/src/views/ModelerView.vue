<template>
  <div class="workbench">
    <TopToolbar role="modeler" :roleName="roleName" @switch-role="switchRole" />
    <div class="workbench-body">
      <HistoryPanel role="modeler" @switch-conv="onSwitchConv" />
      <main class="main-area">
        <div class="tabs">
          <button v-for="tab in tabs" :key="tab.key" class="tab" :class="{ active: activeTab === tab.key }" @click="activeTab=tab.key"><i :class="tab.icon"></i> {{ tab.label }}</button>
        </div>
        <div class="tab-content">
          <ChatPanel v-if="activeTab === 'chat'" ref="chatPanelRef" role="modeler" />
          <HistoricalModels v-else-if="activeTab === 'history'" />
          <ModelCompare v-else-if="activeTab === 'compare'" />
          <NoteEditor v-else-if="activeTab === 'draft'" />
        </div>
      </main>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue"
import { useAppStore } from "@/stores/appStore"
import { useRouter } from "vue-router"
import TopToolbar from "@/components/TopToolbar.vue"
import HistoryPanel from "@/components/HistoryPanel.vue"
import ChatPanel from "@/components/ChatPanel.vue"
import HistoricalModels from "@/components/modeler/HistoricalModels.vue"
import ModelCompare from "@/components/modeler/ModelCompare.vue"
import NoteEditor from "@/components/modeler/NoteEditor.vue"
const store = useAppStore(), router = useRouter()
const roleName = store.roleName
const activeTab = ref("chat")
const chatPanelRef = ref<InstanceType<typeof ChatPanel>>()
const tabs = [
  { key: "chat", label: "AI对话", icon: "fas fa-comment-dots" },
  { key: "history", label: "往届模型", icon: "fas fa-archive" },
  { key: "compare", label: "模型对比", icon: "fas fa-balance-scale" },
  { key: "draft", label: "文本草稿", icon: "fas fa-pen" }
]
const switchRole = () => { store.setRole(null); router.push("/") }
const onSwitchConv = () => {}
</script>
<style scoped>
.workbench { height:100vh; display:flex; flex-direction:column; background:white; }
.workbench-body { flex:1; display:flex; overflow:hidden; }
.main-area { flex:1; display:flex; flex-direction:column; background:#fafcff; overflow:hidden; }
.tabs { padding:8px 20px 0; display:flex; gap:4px; border-bottom:2px solid #eef2f6; background:white; flex-shrink:0; }
.tabs .tab { padding:10px 18px; font-size:13px; font-weight:500; color:#64748b; border:none; background:transparent; border-bottom:3px solid transparent; cursor:pointer; transition:all 0.2s; display:flex; align-items:center; gap:6px; }
.tabs .tab:hover { color:#0b2b44; }
.tabs .tab.active { color:#0b2b44; border-bottom-color:#2d7aff; }
.tab-content { flex:1; min-height: 0;overflow:hidden; }
</style>s