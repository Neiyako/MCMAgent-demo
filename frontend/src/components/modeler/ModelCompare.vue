<template>
  <div class="panel">
    <div class="panel-header">
      <i class="fas fa-balance-scale"></i> 模型对比 · 双栏PDF阅读
    </div>
    <div class="compare-controls">
      <div class="select-group">
        <label>模型 A</label>
        <select v-model="leftModel">
          <option value="">请选择</option>
          <option v-for="m in modelList" :key="m.id" :value="m">
            {{ m.year }} {{ m.title }}
          </option>
        </select>
      </div>
      <div class="select-group">
        <label>模型 B</label>
        <select v-model="rightModel">
          <option value="">请选择</option>
          <option v-for="m in modelList" :key="m.id" :value="m">
            {{ m.year }} {{ m.title }}
          </option>
        </select>
      </div>
    </div>
    <div class="compare-view" v-if="leftModel && rightModel">
      <div class="pdf-col">
        <div class="pdf-label">{{ leftModel.year }} {{ leftModel.title }}</div>
        <iframe :src="`/docs/models/${leftModel.pdf}`" class="pdf-iframe"></iframe>
      </div>
      <div class="pdf-col">
        <div class="pdf-label">{{ rightModel.year }} {{ rightModel.title }}</div>
        <iframe :src="`/docs/models/${rightModel.pdf}`" class="pdf-iframe"></iframe>
      </div>
    </div>
    <div v-else class="empty-hint">
      <i class="fas fa-hand-pointer"></i> 请选择两个模型进行对比
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

declare const __PDF_LIST__: any;

const modelList = computed(() => {
  try {
    if (Array.isArray(__PDF_LIST__)) return __PDF_LIST__;
    if (typeof __PDF_LIST__ === "string") {
      const parsed = JSON.parse(__PDF_LIST__);
      return Array.isArray(parsed) ? parsed : [];
    }
    return [];
  } catch (e) {
    console.warn("解析 PDF 列表失败", e);
    return [];
  }
});

const leftModel = ref<any>(null);
const rightModel = ref<any>(null);
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
  color: #2d7aff;
}
.compare-controls {
  display: flex;
  gap: 24px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}
.select-group {
  flex: 1;
  min-width: 180px;
}
.select-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 4px;
}
.select-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: white;
  font-size: 14px;
  color: #0b2b44;
  transition: border 0.2s;
}
.select-group select:focus {
  outline: none;
  border-color: #2d7aff;
  box-shadow: 0 0 0 3px rgba(45, 122, 255, 0.1);
}
.compare-view {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  min-height: 0;
  margin-top: 4px;
}
.pdf-col {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 400px;
}
.pdf-label {
  font-weight: 600;
  font-size: 14px;
  color: #0b2b44;
  padding: 6px 0 10px;
  border-bottom: 2px solid #eef2f6;
  margin-bottom: 10px;
}
.pdf-iframe {
  flex: 1;
  width: 100%;
  border: 1px solid #eef2f6;
  border-radius: 12px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.empty-hint {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 16px;
  gap: 8px;
}
.empty-hint i {
  font-size: 36px;
  opacity: 0.5;
}
/* 移动端适配：保持两列并排 */
@media (max-width: 768px) {
  .compare-view {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .pdf-col {
    min-height: 300px;
  }
}
</style>