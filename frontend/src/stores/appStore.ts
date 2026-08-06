import { defineStore } from "pinia"
import { ref, computed } from "vue"
export type Role = "modeler" | "coder" | "writer" | null
export interface Message { role: "user" | "assistant"; content: string; images?: string[]; timestamp?: number }
export interface Conversation { id: string; title: string; messages: Message[]; createdAt: number }
const CONVERSATIONS_KEY = "mcm_conversations"
const CURRENT_KEY = "mcm_current_conversation"
export const useAppStore = defineStore("app", () => {
  const role = ref<Role>(localStorage.getItem("user_role") as Role || null)
  const sessionId = ref(localStorage.getItem("session_id") || "")
  const loading = ref(false)
  const error = ref<string | null>(null)
  const conversations = ref<Record<Role, Conversation[]>>({ modeler: [], coder: [], writer: [] })
  const currentConvId = ref<Record<Role, string | null>>({ modeler: null, coder: null, writer: null })
  const roleName = computed(() => ({ modeler:"建模手", coder:"编程手", writer:"论文手" }[role.value as string] || ""))
  function loadConversations() {
    try { const raw = localStorage.getItem(CONVERSATIONS_KEY); if (raw) conversations.value = JSON.parse(raw) } catch(e){}
    try { const raw = localStorage.getItem(CURRENT_KEY); if (raw) currentConvId.value = JSON.parse(raw) } catch(e){}
    if (!currentConvId.value[role.value as Role]) {
      const r = role.value as Role
      if (conversations.value[r]?.length) { currentConvId.value[r] = conversations.value[r][0].id }
      else { createConversation(r) }
    }
  }
  function saveConversations() { localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations.value)) }
  function saveCurrent() { localStorage.setItem(CURRENT_KEY, JSON.stringify(currentConvId.value)) }
  function createConversation(role: Role, title?: string) {
    if (!role) return
    const id = `conv_${Date.now()}_${Math.random().toString(36).slice(2,6)}`
    const conv: Conversation = { id, title: title || "新对话", messages: [], createdAt: Date.now() }
    if (!conversations.value[role]) conversations.value[role] = []
    conversations.value[role].unshift(conv)
    currentConvId.value[role] = id
    saveConversations(); saveCurrent()
  }
  function deleteConversation(role: Role, id: string) {
    if (!role) return
    const list = conversations.value[role]
    const idx = list.findIndex(c => c.id === id)
    if (idx === -1) return
    list.splice(idx, 1)
    if (list.length) { currentConvId.value[role] = list[0].id } else { createConversation(role) }
    saveConversations(); saveCurrent()
  }
  function switchConversation(role: Role, id: string) {
    if (!role) return
    currentConvId.value[role] = id
    saveCurrent()
  }
  function getCurrentMessages(role: Role): Message[] {
    if (!role) return []
    const conv = conversations.value[role]?.find(c => c.id === currentConvId.value[role])
    return conv ? conv.messages : []
  }
  function addMessage(role: Role, msg: Message) {
    if (!role) return
    const conv = conversations.value[role]?.find(c => c.id === currentConvId.value[role])
    if (!conv) return
    conv.messages.push(msg)
    if (conv.messages.length === 1 && msg.role === "user" && conv.title === "新对话") {
      conv.title = msg.content.slice(0, 20) + (msg.content.length > 20 ? "..." : "")
    }
    saveConversations()
  }
  function updateLastMessage(role: Role, content: string, images?: string[]) {
    if (!role) return
    const conv = conversations.value[role]?.find(c => c.id === currentConvId.value[role])
    if (!conv || !conv.messages.length) return
    const last = conv.messages[conv.messages.length - 1]
    if (last.role === "assistant") { last.content = content; if (images) last.images = images; saveConversations() }
  }
  const setRole = (r: Role) => { role.value = r; if (r) { localStorage.setItem("user_role", r); loadConversations() } else { localStorage.removeItem("user_role") } }
  const setSessionId = (id: string) => { sessionId.value = id; localStorage.setItem("session_id", id) }
  const generateSession = () => { const id = `sess_${Date.now()}_${Math.random().toString(36).slice(2,8)}`; setSessionId(id); return id }
  const init = () => { if (!sessionId.value) generateSession(); loadConversations() }
  return { role, sessionId, loading, error, conversations, currentConvId, roleName, setRole, setSessionId, generateSession, createConversation, deleteConversation, switchConversation, getCurrentMessages, addMessage, updateLastMessage, init }
})