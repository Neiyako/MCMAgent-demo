export async function* parseSSE(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let buffer = ""
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const parts = buffer.split("\n\n")
    buffer = parts.pop() || ""
    for (const part of parts) {
      const lines = part.split("\n")
      let event = "content", data = ""
      for (const line of lines) {
        if (line.startsWith("event:")) event = line.slice(6).trim()
        else if (line.startsWith("data:")) data = line.slice(5).trim()
      }
      if (data) {
        try { const json = JSON.parse(data); yield { event, data: json } }
        catch { yield { event, data: { content: data } } }
      }
    }
  }
}