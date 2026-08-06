<template>
  <div class="panel">
    <div class="panel-header">
      <i class="fas fa-robot"></i> AI评审 · 上传PDF智能分析
    </div>
    <div class="review-body">
      <div class="drop-zone" @dragover.prevent @drop="handleDrop" @click="fileInput?.click()">
        <i class="fas fa-cloud-upload-alt"></i>
        <span>拖拽PDF文件到此处，或点击选择</span>
        <span v-if="uploadedFile" class="file-name">{{ uploadedFile.name }}</span>
        <input type="file" ref="fileInput" accept=".pdf" style="display:none" @change="handleFileSelect" />
      </div>
      <div class="review-actions">
        <button @click="analyze" :disabled="!uploadedFile || analyzing" class="analyze-btn">
          <i class="fas fa-microscope"></i> {{ analyzing ? "分析中..." : "开始分析" }}
        </button>
      </div>
      <div class="review-result" v-if="result || analyzing">
        <div class="result-header"><i class="fas fa-file-alt"></i> 评审报告</div>
        <div class="result-content" v-html="renderedResult"></div>
      </div>
      <div v-else class="empty-hint">
        <i class="fas fa-file-pdf"></i> 上传PDF后点击分析，评审报告将显示在此
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAppStore } from '@/stores/appStore';
import { useSettings } from '@/composables/useSettings';
import { chatService } from '@/apis/chatService';
import { parseSSE } from '@/utils/sseParser';
import { renderMarkdown } from '@/utils/markdown';

const store = useAppStore();
const { settings } = useSettings();

const uploadedFile = ref<File | null>(null);
const analyzing = ref(false);
const result = ref('');   // 原始文本
const fileInput = ref<HTMLInputElement>();

// 渲染后的 HTML
const renderedResult = computed(() => renderMarkdown(result.value));

const handleDrop = (e: DragEvent) => {
  e.preventDefault();
  const files = e.dataTransfer?.files;
  if (files && files.length) {
    const f = files[0];
    if (f.type === 'application/pdf') {
      uploadedFile.value = f;
    } else {
      alert('请拖入PDF文件');
    }
  }
};

const handleFileSelect = (e: Event) => {
  const input = e.target as HTMLInputElement;
  if (input.files && input.files.length) {
    uploadedFile.value = input.files[0];
  }
};

const analyze = async () => {
  if (!uploadedFile.value) return;
  analyzing.value = true;
  result.value = '';

  // 在会话中创建一个空的助手消息，用于保存评审结果
  store.addMessage('writer', { role: 'assistant', content: '🤖 正在生成评审报告...' });

  try {
    const file = uploadedFile.value;
    const reader = new FileReader();
    const base64 = await new Promise<string>((resolve) => {
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(file);
    });

    const headers: any = { 'Content-Type': 'application/json' };
    if (settings.value.apiKey) headers['X-API-Key'] = settings.value.apiKey;
    if (settings.value.baseUrl) headers['X-API-Base'] = settings.value.baseUrl;
    if (settings.value.model) headers['X-Model'] = settings.value.model;

    const res = await chatService.sendMessage({
      headers,
      body: {
        session_id: store.sessionId,
        role: 'writer',
        message: '请对这篇论文进行评审（包括模型逻辑、结构、创新性等）',
        skill: 'judger',
        files: [{ filename: file.name, data: base64, mime_type: 'application/pdf' }]
      }
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || err.message || `HTTP ${res.status}`);
    }

    let full = '';
    let hasError = false;
    for await (const evt of parseSSE(res.body!)) {
      if (evt.event === 'error') {
        hasError = true;
        full = '❌ ' + (evt.data.error || '评审失败');
        result.value = full;
        store.updateLastMessage('writer', full);
        break;
      } else if (evt.event === 'content' || evt.event === 'content_delta') {
        full += evt.data.content || '';
        result.value = full;
        // 实时更新会话中的助手消息
        store.updateLastMessage('writer', full);
      } else if (evt.event === 'done') {
        break;
      }
    }
    if (!hasError && full) {
      // 最终确保消息已更新
      store.updateLastMessage('writer', full);
    }
  } catch (e: any) {
    const errMsg = '❌ ' + (e.message || '请求失败');
    result.value = errMsg;
    store.updateLastMessage('writer', errMsg);
  } finally {
    analyzing.value = false;
  }
};
</script>

<style scoped>
.panel {
  padding: 16px 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.panel-header {
  font-size: 20px;
  font-weight: 700;
  color: #0b2b44;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.panel-header i {
  color: #f59e0b;
}
.review-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
}
.drop-zone {
  border: 2px dashed #cbd5e1;
  border-radius: 16px;
  padding: 30px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #fafcff;
  flex-shrink: 0;
}
.drop-zone:hover {
  border-color: #2d7aff;
  background: #f1f5f9;
}
.drop-zone i {
  font-size: 40px;
  color: #94a3b8;
  display: block;
  margin-bottom: 8px;
}
.drop-zone .file-name {
  display: block;
  margin-top: 6px;
  font-weight: 600;
  color: #0b2b44;
}
.review-actions {
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}
.analyze-btn {
  background: #2d7aff;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 10px 32px;
  font-weight: 600;
  font-size: 15px;
  transition: background 0.2s;
}
.analyze-btn:hover:not(:disabled) {
  background: #1a5cdb;
}
.analyze-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.review-result {
  flex: 1;
  border: 1px solid #eef2f6;
  border-radius: 12px;
  padding: 16px;
  overflow-y: auto;
  background: white;
  min-height: 200px;
}
.result-header {
  font-weight: 700;
  margin-bottom: 12px;
  color: #0b2b44;
  font-size: 16px;
}
.result-content {
  font-size: 14px;
  line-height: 1.7;
  color: #0b2b44;
}
.result-content :deep(p) {
  margin: 0 0 8px 0;
}
.result-content :deep(pre) {
  background: #f1f5f9;
  color: #0b2b44;
  padding: 12px 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 6px 0;
}
.result-content :deep(code) {
  background: #f1f5f9;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 13px;
}
.result-content :deep(.code-block) {
  position: relative;
}
.result-content :deep(.code-block .mcm-code-lang) {
  display: inline-block;
  background: #d1d9e6;
  color: #1e293b;
  font-size: 11px;
  padding: 4px 12px;
  border-radius: 0 0 4px 0;
  font-weight: 600;
}
.result-content :deep(.copy-code-btn) {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #e2e8f0;
  border: 1px solid #cbd5e1;
  color: #0b2b44;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 12px;
  cursor: pointer;
}
.result-content :deep(.copy-code-btn:hover) {
  background: #cbd5e1;
}
.empty-hint {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  gap: 8px;
  font-size: 16px;
}
.empty-hint i {
  font-size: 48px;
  opacity: 0.4;
}
</style>