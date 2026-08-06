<template>
  <header class="topbar">
    <div class="left"><span class="brand"><i class="fas fa-brain"></i> MCM Agent</span><span class="role-badge" :class="role"><i :class="iconMap[role]"></i> {{ roleName }}</span></div>
    <div class="right"><button class="switch-btn" @click="$emit('switch-role')"><i class="fas fa-exchange-alt"></i> 切换角色</button><router-link to="/settings" class="settings-btn"><i class="fas fa-cog"></i></router-link></div>
  </header>
</template>
<script setup lang="ts">
defineProps<{ role: "modeler" | "coder" | "writer"; roleName: string }>()
defineEmits(["switch-role"])
const iconMap = { modeler: "fas fa-pencil-alt", coder: "fas fa-code", writer: "fas fa-file-alt" }
</script>
<style scoped>
.topbar { display:flex; justify-content:space-between; align-items:center; padding:0 24px; height:56px; background:#f8fafc; border-bottom:1px solid #e2e8f0; flex-shrink:0; }
.left { display:flex; align-items:center; gap:16px; }
.brand { font-weight:700; font-size:17px; color:#0b2b44; } .brand i { color:#2d7aff; }
.role-badge { padding:4px 16px; border-radius:40px; font-weight:600; color:white; display:flex; align-items:center; gap:6px; font-size:13px; }
.role-badge.modeler { background:linear-gradient(135deg,#2d7aff,#1a5cdb); }
.role-badge.coder { background:linear-gradient(135deg,#22c55e,#16a34a); }
.role-badge.writer { background:linear-gradient(135deg,#f59e0b,#d97706); }
.right { display:flex; gap:12px; align-items:center; }
.switch-btn { padding:6px 16px; border:1px solid #e2e8f0; border-radius:40px; background:white; font-size:13px; font-weight:500; color:#1e293b; }
.switch-btn:hover { background:#f1f5f9; }
.settings-btn { font-size:20px; color:#64748b; }
.settings-btn:hover { color:#0b2b44; }
</style>