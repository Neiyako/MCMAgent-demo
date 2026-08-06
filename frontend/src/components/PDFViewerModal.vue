<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <span><i class="fas fa-file-pdf" style="color:#ef4444; margin-right:8px;"></i>{{ title }}</span>
        <button class="close-btn" @click="close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        <iframe :src="pdfSrc" class="pdf-iframe" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ pdfSrc: string; title: string }>();
const emit = defineEmits(["close"]);
const close = () => emit("close");
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}
.modal-content {
  background: white;
  border-radius: 20px;
  width: 95vw;
  height: 92vh;
  max-width: 1400px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}
.modal-header {
  padding: 16px 24px;
  border-bottom: 1px solid #eef2f6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  font-weight: 600;
  font-size: 16px;
  color: #0b2b44;
  background: #fafcff;
}
.close-btn {
  background: #f1f5f9;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 18px;
  color: #475569;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}
.close-btn:hover {
  background: #e2e8f0;
  color: #0b2b44;
}
.modal-body {
  flex: 1;
  padding: 12px;
  background: #f8fafc;
  overflow: hidden;
}
.pdf-iframe {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 12px;
  background: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}
</style>