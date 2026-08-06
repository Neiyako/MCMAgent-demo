<template>
  <div class="panel">
    <div class="panel-header"><i class="fas fa-list-tree"></i> 文章结构 · 手写渲染台</div>
    <div class="paper-structure-body">
      <div class="editor-area">
        <textarea v-model="sourceText" placeholder="输入 Mermaid 或 Tree 文本..." class="code-textarea"></textarea>
        <div class="render-actions"><button @click="renderChart" class="render-btn"><i class="fas fa-play"></i> 渲染</button></div>
      </div>
      <div class="preview-area" ref="previewContainer">
        <div v-if="renderedHtml" v-html="renderedHtml" class="preview-content"></div>
        <div v-else class="empty-preview"><i class="fas fa-code"></i> 输入代码，点击渲染</div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from "vue"
import mermaid from "mermaid"
const sourceText = ref(`graph TD\n  摘要 --> 引言\n  引言 --> 模型\n  模型 --> 求解\n  求解 --> 结果\n  结果 --> 结论`)
const renderedHtml = ref("")
const previewContainer = ref<HTMLElement | null>(null)
const renderChart = async () => {
  if (!sourceText.value.trim()) { alert("请输入内容"); return }
  try {
    const isMermaid = /graph|sequenceDiagram|classDiagram|stateDiagram|erDiagram|journey|gantt|pie|flowchart/.test(sourceText.value)
    if (isMermaid) {
      const { svg } = await mermaid.render("mermaid-"+Date.now(), sourceText.value)
      renderedHtml.value = svg
    } else {
      const lines = sourceText.value.split("\n").filter(l => l.trim())
      let html = "<ul>"
      let indent = 0
      for (const line of lines) {
        const curIndent = line.search(/\S/)
        const text = line.trim()
        if (curIndent > indent) { html += "<ul>" }
        else if (curIndent < indent) { html += "</ul>" }
        html += `<li>${text}</li>`
        indent = curIndent
      }
      html += "</ul>"
      renderedHtml.value = html
    }
  } catch (e) { alert("渲染失败: " + e) }
}
onMounted(renderChart)
</script>
<style scoped>
.panel { padding:16px 20px; height:100%; display:flex; flex-direction:column; }
.panel-header { font-size:18px; font-weight:600; color:#0b2b44; margin-bottom:12px; }
.panel-header i { color:#f59e0b; margin-right:8px; }
.paper-structure-body { flex:1; display:grid; grid-template-columns:1fr 1fr; gap:16px; min-height:0; }
.editor-area { display:flex; flex-direction:column; gap:8px; }
.code-textarea { flex:1; padding:10px; font-family: "Courier New", monospace; font-size:13px; border:1px solid #e2e8f0; border-radius:6px; resize:none; background:#f8fafc; }
.render-actions { display:flex; justify-content:flex-end; }
.render-btn { background:#2d7aff; color:white; border:none; border-radius:6px; padding:6px 16px; }
.preview-area { border:1px solid #eef2f6; border-radius:6px; padding:12px; overflow:auto; background:#fafcff; }
.preview-content :deep(svg) { max-width:100%; height:auto; }
.preview-content :deep(ul) { padding-left:20px; }
.empty-preview { display:flex; align-items:center; justify-content:center; height:100%; color:#94a3b8; flex-direction:column; gap:8px; font-size:16px; }
.empty-preview i { font-size:32px; }
</style>