import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useChatStore = defineStore('chat', () => {
  const messagesMap = ref<Record<string, Array<{ role: string, content: string }>>>({
    default: []
  })

  const getCurrentMessages = (role: string) => {
    if (!messagesMap.value[role]) {
      messagesMap.value[role] = []
    }
    return messagesMap.value[role]
  }

  const sendMessage = async (role: string, content: string) => {
    const history = getCurrentMessages(role)
    history.push({ role: 'user', content })
    
    const assistantMsg = { role: 'assistant', content: '思考中...' }
    history.push(assistantMsg)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, message: content })
      })
      
      if (!response.ok) throw new Error('网络请求失败')
      
      const data = await response.json()
      assistantMsg.content = data.reply || data.message || '收到回复'
    } catch (err) {
      assistantMsg.content = '后端连接失败或返回异常，请检查后端服务。'
    }
  }

  return { getCurrentMessages, sendMessage }
})
