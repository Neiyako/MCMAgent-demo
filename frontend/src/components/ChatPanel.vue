<template>
  <div class="chat-panel">
    <div class="chat-header-actions"><span><i class="fas fa-comment-dots"></i> AI 对话</span><button class="download-btn" @click="downloadChat" title="下载当前对话"><i class="fas fa-download"></i></button></div>
    <div class="chat-messages" ref="msgContainer">
      <div v-for="(msg, idx) in messages" :key="idx" class="message" :class="msg.role">
        <div class="avatar"><i :class="msg.role==='user' ? 'fas fa-user' : 'fas fa-robot'"></i></div>
        <div class="bubble">
          <div v-if="msg.role==='assistant' && msg.images?.length" class="image-gallery"><img v-for="(img, i) in msg.images" :key="i" :src="img" class="result-image" @click="openImage(img)" /></div>
          <div class="content-wrapper" v-html="renderMarkdown(msg.content)"></div>
          <div v-if="msg.role === 'assistant' && msg.content" class="msg-actions"><button class="copy-btn" @click="copyContent(msg.content)"><i class="fas fa-copy"></i> 复制</button></div>
        </div>
      </div>
      <div v-if="loading" class="typing"><i class="fas fa-spinner fa-pulse"></i> AI 正在思考...</div>
    </div>
    <div class="chat-input-area">
      <div class="file-preview" v-if="files.length"><span v-for="(f, i) in files" :key="i" class="file-tag">{{ f.name }} <button @click="removeFile(i)">×</button></span></div>
      <div class="input-row">
        <input type="file" ref="fileInput" @change="onFileSelect" multiple style="display:none" />
        <button class="attach-btn" @click="fileInput?.click()"><i class="fas fa-paperclip"></i></button>
        <input v-model="inputText" @keyup.enter="send" placeholder="输入消息..." :disabled="loading" />
        <button class="send-btn" @click="send" :disabled="loading"><i class="fas fa-arrow-up"></i></button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from "vue"
import { useAppStore } from "@/stores/appStore"
import { useSettings } from "@/composables/useSettings"
import { chatService } from "@/apis/chatService"
import { parseSSE } from "@/utils/sseParser"
import { renderMarkdown } from '@/utils/markdown';
import katex from "katex"
const store = useAppStore()
const { settings } = useSettings()
const props = defineProps<{ role: "modeler" | "coder" | "writer" }>()
const inputText = ref("")
const loading = ref(false)
const files = ref<File[]>([])
const fileInput = ref<HTMLInputElement>()
const msgContainer = ref<HTMLElement | null>(null)
const messages = computed(() => store.getCurrentMessages(props.role))
const scrollToBottom = () => nextTick(() => { if (msgContainer.value) msgContainer.value.scrollTop = msgContainer.value.scrollHeight })
watch(messages, scrollToBottom, { deep: true })
const onFileSelect = (e: Event) => { const input = e.target as HTMLInputElement; if (input.files) { for (const f of input.files) files.value.push(f) } input.value = "" }
const removeFile = (i: number) => files.value.splice(i, 1)
const send = async () => {
  if (!inputText.value.trim() && !files.value.length) return
  const msg = inputText.value; inputText.value = ""

  // --- 新增：获取当前历史消息（不包括即将添加的这条用户消息） ---
  const currentHistory = store.getCurrentMessages(props.role).map(m => ({
    role: m.role,
    content: m.content
  }))
  // ---------------------------------------------------------

  store.addMessage(props.role, { role: "user", content: msg })
  loading.value = true
  try {
    const fileData = await Promise.all(files.value.map((f) => new Promise<any>((resolve) => {
      const reader = new FileReader(); reader.onload = () => { const base64 = (reader.result as string).split(",")[1]; resolve({ filename: f.name, data: base64, mime_type: f.type }) }; reader.readAsDataURL(f)
    })))
    files.value = []
    const headers: any = { "Content-Type": "application/json" }
    if (settings.value.apiKey) headers["X-API-Key"] = settings.value.apiKey
    if (settings.value.baseUrl) headers["X-API-Base"] = settings.value.baseUrl
    if (settings.value.model) headers["X-Model"] = settings.value.model
    const res = await chatService.sendMessage({
      headers,
      body: {
        session_id: store.sessionId,
        role: props.role,
        message: msg,
        files: fileData,
        history: currentHistory   // 新增：传递历史消息
      }
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || err.message || `HTTP ${res.status}`)
    }
    store.addMessage(props.role, { role: "assistant", content: "" })
    let full = ""
    for await (const evt of parseSSE(res.body!)) {
      if (evt.event === "error") {
        store.updateLastMessage(props.role, "❌ " + (evt.data.error || "未知错误"))
        break
      } else if (evt.event === "content" || evt.event === "content_delta") {
        full += evt.data.content || ""
        store.updateLastMessage(props.role, full)
      } else if (evt.event === "images") {
        store.updateLastMessage(props.role, full, evt.data.images || [])
      } else if (evt.event === "done") break
    }
  } catch (e: any) {
    store.addMessage(props.role, { role: "assistant", content: "❌ " + (e.message || "请求失败") })
  } finally { loading.value = false }
}
const copyContent = (text: string) => { navigator.clipboard.writeText(text).then(() => alert("已复制")).catch(() => {}) }
const downloadChat = () => {
  const content = messages.value.map(m => `[${m.role}]: ${m.content}`).join("\n\n")
  const blob = new Blob([content], { type: "text/plain" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a"); a.href = url; a.download = `conversation_${new Date().toISOString()}.txt`; a.click(); URL.revokeObjectURL(url)
}
const openImage = (url: string) => window.open(url, "_blank")
function setupCodeCopy() {
  const container = msgContainer.value
  if (!container) return
  const handler = (e: Event) => {
    const target = (e.target as HTMLElement).closest(".copy-code-btn")
    if (target) {
      const code = (target as HTMLElement).dataset.code
      if (code) {
        navigator.clipboard.writeText(decodeURIComponent(code)).then(() => {
          const original = (target as HTMLElement).innerHTML
          (target as HTMLElement).innerHTML = '<i class="fas fa-check"></i> 已复制'
          setTimeout(() => { (target as HTMLElement).innerHTML = original }, 2000)
        }).catch(() => {})
      }
    }
  }
  container.addEventListener("click", handler)
}
onMounted(() => { scrollToBottom(); setupCodeCopy() })
</script>
<style scoped>
.chat-panel { display:flex; flex-direction:column; height:100%; background:#fbfdff; overflow:hidden; }
.chat-header-actions { padding:12px 20px 8px; border-bottom:1px solid #eef2f6; display:flex; justify-content:space-between; align-items:center; flex-shrink:0; font-weight:600; }
.chat-header-actions .download-btn { background:none; border:none; color:#64748b; font-size:16px; cursor:pointer; } .chat-header-actions .download-btn:hover { color:#2d7aff; }
.chat-messages { flex:1; overflow-y:auto; padding:16px 20px 0; display:flex; flex-direction:column; gap:12px; }
.message { display:flex; gap:10px; max-width:92%; }
.message.user { align-self:flex-end; flex-direction:row-reverse; }
.message .avatar { width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; background:#dbeafe; color:#1d4ed8; flex-shrink:0; font-size:13px; }
.message.user .avatar { background:#d1d9e6; color:#1e293b; }
.message .bubble { padding:8px 16px; border-radius:14px; border:1px solid #eef2f6; font-size:14px; line-height:1.6; background:white; word-break:break-word; max-width:100%; }
.message.user .bubble { background:#eef4ff; border-color:#d0e0ff; }
.content-wrapper { overflow-wrap:break-word; }
.content-wrapper :deep(p) { margin:0 0 6px 0; } .content-wrapper :deep(p:last-child) { margin:0; }
.content-wrapper :deep(code) { background:#f1f5f9; padding:1px 6px; border-radius:4px; font-size:13px; font-family: "Courier New", monospace; }
.content-wrapper :deep(pre) { background:#f1f5f9; color:#0b2b44; padding:12px 16px; border-radius:8px; overflow-x:auto; margin:6px 0; position:relative; }
.content-wrapper :deep(pre code) { background:transparent; padding:0; color:#0b2b44; }
.code-block { position:relative; }
.code-block .mcm-code-lang { display:inline-block; background:#d1d9e6; color:#1e293b; font-size:11px; font-family:ui-monospace,monospace; padding:4px 12px; border-radius:0 0 4px 0; letter-spacing:0.5px; text-transform:uppercase; font-weight:600; }
.copy-code-btn { position:absolute; top:8px; right:8px; background: #e2e8f0;border: 1px solid #cbd5e1;color: #0b2b44;padding:4px 10px; font-size:12px; cursor:pointer; transition:all 0.2s; display:flex; align-items:center; gap:4px; }
.copy-code-btn:hover { background: #cbd5e1;border-color: #94a3b8;}
.copy-code-btn.copied { background: #bbf7d0;       /* 浅绿色 */border-color: #22c55e;color: #166534;}
.content-wrapper :deep(ul), .content-wrapper :deep(ol) { padding-left:20px; margin:4px 0; }
.content-wrapper :deep(blockquote) { border-left:3px solid #2d7aff; padding-left:12px; margin:6px 0; color:#475569; }
.image-gallery { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:6px; }
.result-image { max-width:100%; max-height:300px; border-radius:6px; border:1px solid #e2e8f0; cursor:pointer; }
.inline-image { max-width:100%; max-height:400px; border-radius:6px; margin:6px 0; }
.msg-actions { margin-top:4px; display:flex; gap:6px; }
.copy-btn { background:#f1f5f9; border:none; border-radius:4px; padding:2px 8px; font-size:12px; color:#475569; cursor:pointer; } .copy-btn:hover { background:#e2e8f0; }
.typing { color:#94a3b8; font-size:14px; padding:8px 0; display:flex; align-items:center; gap:8px; }
.chat-input-area { padding:12px 20px 16px; border-top:1px solid #eef2f6; background:#fff; flex-shrink:0; }
.file-preview { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:8px; }
.file-tag { background:#f1f5f9; padding:2px 10px; border-radius:12px; font-size:12px; display:flex; align-items:center; gap:6px; } .file-tag button { background:none; border:none; color:#ef4444; cursor:pointer; font-size:14px; }
.input-row { display:flex; gap:6px; background:#f1f5f9; border-radius:60px; padding:3px 3px 3px 16px; align-items:center; border:1px solid #e2e8f0; }
.input-row input { flex:1; border:none; background:transparent; padding:8px 0; font-size:14px; outline:none; }
.input-row input:disabled { opacity:0.5; }
.input-row button { width:36px; height:36px; border-radius:50%; border:none; background:transparent; color:#475569; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:16px; }
.input-row .send-btn { background:#2d7aff; color:white; }
.input-row .send-btn:disabled { opacity:0.5; cursor:not-allowed; }
.input-row .attach-btn:hover { background:#e2e8f0; }
</style>