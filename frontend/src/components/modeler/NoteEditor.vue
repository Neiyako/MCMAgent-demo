<template>
  <div class="note-panel">
    <div class="note-toolbar">
      <span><i class="fas fa-sticky-note"></i> 文本草稿</span>
      <button class="new-btn" @click="createNote"><i class="fas fa-plus"></i> 新建</button>
    </div>
    <div class="note-body">
      <div class="note-list">
        <div v-for="(note, idx) in notes" :key="note.id" class="note-item" :class="{ active: activeId === note.id }" @click="loadNote(note.id)">
          <span class="note-title">{{ note.title }}</span>
          <span class="note-time">{{ formatTime(note.updated) }}</span>
          <button class="del-btn" @click.stop="deleteNote(note.id)"><i class="fas fa-trash-alt"></i></button>
        </div>
        <div v-if="!notes.length" class="empty">暂无草稿，点击新建</div>
      </div>
      <div class="note-editor">
        <input v-model="currentTitle" placeholder="草稿标题" class="note-title-input" />
        <textarea v-model="currentContent" placeholder="在此编辑草稿内容..." class="note-textarea"></textarea>
        <div class="note-actions"><button @click="saveNote" class="save-btn"><i class="fas fa-save"></i> 保存</button></div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from "vue"
const STORAGE_KEY = "mcm_notes_modeler"
interface Note { id: string; title: string; content: string; updated: number }
const notes = ref<Note[]>([])
const activeId = ref<string | null>(null)
const currentTitle = ref("")
const currentContent = ref("")
const loadNotes = () => { try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) notes.value = JSON.parse(raw) } catch {} }
const saveNotes = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(notes.value))
const createNote = () => {
  const id = "note_" + Date.now()
  const note: Note = { id, title: "新草稿", content: "", updated: Date.now() }
  notes.value.unshift(note)
  activeId.value = id
  currentTitle.value = note.title
  currentContent.value = note.content
  saveNotes()
}
const loadNote = (id: string) => {
  const note = notes.value.find(n => n.id === id)
  if (note) { activeId.value = id; currentTitle.value = note.title; currentContent.value = note.content }
}
const saveNote = () => {
  if (!activeId.value) return
  const note = notes.value.find(n => n.id === activeId.value)
  if (note) { note.title = currentTitle.value || "无标题"; note.content = currentContent.value; note.updated = Date.now(); saveNotes() }
  notes.value = [...notes.value]
}
const deleteNote = (id: string) => { if (confirm("确定删除此草稿？")) { notes.value = notes.value.filter(n => n.id !== id); if (activeId.value === id) { activeId.value = null; currentTitle.value = ""; currentContent.value = "" } saveNotes() } }
const formatTime = (ts: number) => { const d = new Date(ts); return d.getMonth()+1 + "/" + d.getDate() + " " + String(d.getHours()).padStart(2,"0") + ":" + String(d.getMinutes()).padStart(2,"0") }
onMounted(loadNotes)
</script>
<style scoped>
.note-panel { display:flex; flex-direction:column; height:100%; background:white; }
.note-toolbar { padding:10px 20px; border-bottom:1px solid #eef2f6; display:flex; justify-content:space-between; font-weight:600; flex-shrink:0; }
.note-toolbar .new-btn { background:#2d7aff; color:white; border:none; border-radius:6px; padding:4px 12px; font-size:13px; }
.note-body { flex:1; display:flex; overflow:hidden; }
.note-list { width:220px; min-width:180px; border-right:1px solid #eef2f6; overflow-y:auto; padding:8px 0; background:#fafcff; }
.note-item { display:flex; align-items:center; padding:6px 12px; cursor:pointer; border-left:3px solid transparent; gap:6px; }
.note-item:hover { background:#f1f5f9; } .note-item.active { background:#e2e8f0; border-left-color:#2d7aff; }
.note-title { flex:1; font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.note-time { font-size:10px; color:#94a3b8; flex-shrink:0; }
.del-btn { background:none; border:none; color:#94a3b8; cursor:pointer; } .del-btn:hover { color:#ef4444; }
.empty { color:#94a3b8; font-size:13px; text-align:center; padding:20px 0; }
.note-editor { flex:1; display:flex; flex-direction:column; padding:12px 20px; }
.note-title-input { padding:6px 0; font-size:16px; font-weight:600; border:none; border-bottom:1px solid #eef2f6; outline:none; margin-bottom:8px; }
.note-textarea { flex:1; border:none; outline:none; resize:none; font-size:14px; line-height:1.8; font-family:inherit; padding:4px 0; }
.note-actions { margin-top:8px; display:flex; justify-content:flex-end; }
.save-btn { background:#22c55e; color:white; border:none; border-radius:6px; padding:6px 16px; font-size:13px; }
</style>