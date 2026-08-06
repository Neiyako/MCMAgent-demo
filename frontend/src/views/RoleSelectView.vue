<template>
  <div class="role-page">
    <div class="page-title"><div class="icon-wrapper"><i class="fas fa-brain"></i></div><h1>MCM AI Agent</h1><p>选择角色</p></div>
    <div class="role-cards">
      <div v-for="r in roles" :key="r.key" class="role-card" :class="r.key" @click="selectRole(r.key)">
        <div class="icon-circle"><i :class="r.icon"></i></div><h3>{{ r.name }}</h3><p>{{ r.desc }}</p><div class="enter-hint">进入</div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useAppStore } from "@/stores/appStore"
import { useRouter } from "vue-router"
const store = useAppStore(), router = useRouter()
const roles = [
  { key:"modeler", name:"建模手", icon:"fas fa-pencil-alt", desc:"问题拆解 · 模型设计" },
  { key:"coder", name:"编程手", icon:"fas fa-code", desc:"算法实现 · 数据清洗" },
  { key:"writer", name:"论文手", icon:"fas fa-file-alt", desc:"论文撰写 · 图表排版" }
]
const selectRole = (role: string) => { store.setRole(role as any); router.push(`/${role}`) }
</script>
<style scoped>
.role-page { min-height:100vh; display:flex; flex-direction:column; justify-content:center; align-items:center; padding:40px 20px; background:linear-gradient(145deg,#eef3f8,#dbe4ee); }
.page-title { text-align:center; margin-bottom:48px; }
.page-title .icon-wrapper { display:inline-flex; width:72px; height:72px; background:linear-gradient(135deg,#2d7aff,#1a5cdb); border-radius:24px; align-items:center; justify-content:center; box-shadow:0 12px 24px -8px rgba(45,122,255,0.35); margin-bottom:16px; }
.page-title .icon-wrapper i { font-size:34px; color:white; }
.page-title h1 { font-size:34px; font-weight:700; color:#0b2b44; } .page-title p { color:#64748b; font-size:17px; margin-top:6px; }
.role-cards { display:grid; grid-template-columns:repeat(3,1fr); gap:24px; max-width:1100px; width:100%; }
.role-card { padding:40px 28px 32px; border-radius:28px; cursor:pointer; text-align:center; border:3px solid transparent; background:white; box-shadow:0 4px 16px rgba(0,0,0,0.04); transition:all 0.3s ease; }
.role-card:hover { transform:translateY(-8px); box-shadow:0 20px 40px -12px rgba(0,0,0,0.15); border-color:currentColor; }
.role-card .icon-circle { width:80px; height:80px; border-radius:50%; display:flex; margin:0 auto 16px; align-items:center; justify-content:center; font-size:34px; color:white; }
.role-card.modeler .icon-circle { background:linear-gradient(135deg,#2d7aff,#1a5cdb); }
.role-card.coder .icon-circle { background:linear-gradient(135deg,#22c55e,#16a34a); }
.role-card.writer .icon-circle { background:linear-gradient(135deg,#f59e0b,#d97706); }
.role-card h3 { font-size:22px; font-weight:700; } .role-card p { font-size:14px; color:#64748b; }
.role-card .enter-hint { margin-top:18px; font-weight:600; opacity:0; transform:translateY(10px); transition:all 0.3s; }
.role-card:hover .enter-hint { opacity:1; transform:translateY(0); }
.role-card.modeler { color:#1a5cdb; } .role-card.coder { color:#16a34a; } .role-card.writer { color:#d97706; }
@media (max-width:820px) { .role-cards { grid-template-columns:1fr 1fr; } }
@media (max-width:540px) { .role-cards { grid-template-columns:1fr; } }
</style>