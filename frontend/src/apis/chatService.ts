export const chatService = {
  sendMessage(params: any) {
    return fetch("/api/v1/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(params.headers || {}) },
      body: JSON.stringify(params.body)
    })
  },
  uploadFile(sessionId: string, file: File) {
    const formData = new FormData()
    formData.append("session_id", sessionId)
    formData.append("file", file)
    return fetch("/api/v1/upload", { method: "POST", body: formData })
  }
}