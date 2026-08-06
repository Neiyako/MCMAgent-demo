<template>
  <div class="panel">
    <div class="panel-header">
      <i class="fas fa-archive"></i> 往届模型 · MCM真题
    </div>
    <div class="model-grid">
      <div
        v-for="m in modelList"
        :key="m.id"
        class="model-card"
        @click="openPDF(m)"
      >
        <div class="year">{{ m.year }}</div>
        <div class="title">{{ m.title }}</div>
        <div class="desc">{{ m.desc }}</div>
        <div class="tags">
          <span v-for="tag in m.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>
        <div class="view-btn">查看 <i class="fas fa-arrow-right"></i></div>
      </div>
    </div>
    <PDFViewerModal
      v-if="showModal"
      :pdfSrc="modalSrc"
      :title="modalTitle"
      @close="showModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import PDFViewerModal from "@/components/PDFViewerModal.vue";

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

const showModal = ref(false);
const modalSrc = ref("");
const modalTitle = ref("");

const openPDF = (m: any) => {
  modalSrc.value = `/docs/models/${m.pdf}`;
  modalTitle.value = `${m.year} ${m.title}`;
  showModal.value = true;
};
</script>

<style scoped>
.panel {
  padding: 16px 24px;
  height: 100%;
  overflow-y: auto;
}
.panel-header {
  font-size: 20px;
  font-weight: 700;
  color: #0b2b44;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.panel-header i {
  color: #2d7aff;
}
.model-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}
.model-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #eef2f6;
  padding: 20px 20px 16px;
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}
.model-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px -8px rgba(45, 122, 255, 0.15);
  border-color: #2d7aff;
}
.model-card .year {
  font-size: 13px;
  font-weight: 600;
  color: #2d7aff;
  letter-spacing: 0.5px;
}
.model-card .title {
  font-size: 17px;
  font-weight: 600;
  color: #0b2b44;
  margin: 6px 0 8px;
  line-height: 1.4;
}
.model-card .desc {
  font-size: 14px;
  color: #475569;
  line-height: 1.6;
}
.model-card .tags {
  margin-top: 12px;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.model-card .tag {
  background: #eef2f6;
  padding: 2px 12px;
  border-radius: 20px;
  font-size: 11px;
  color: #475569;
  font-weight: 500;
}
.model-card .view-btn {
  margin-top: 14px;
  font-size: 13px;
  font-weight: 600;
  color: #2d7aff;
  display: flex;
  align-items: center;
  gap: 6px;
  opacity: 0;
  transition: opacity 0.2s;
}
.model-card:hover .view-btn {
  opacity: 1;
}
</style>