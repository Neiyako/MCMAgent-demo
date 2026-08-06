<template>
  <div class="not-found"><div class="code">404</div><h2>页面不存在</h2><p>你访问的页面已丢失或被移动</p><button class="back-btn" @click="$router.push('/')"><i class="fas fa-home"></i> 返回角色选择</button></div>
</template>
<style scoped>
.not-found { min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px; background:linear-gradient(145deg,#eef3f8,#dbe4ee); }
.not-found .code { font-size:90px; font-weight:800; background:linear-gradient(135deg,#2d7aff,#22c55e); -webkit-background-clip:text; background-clip:text; color:transparent; }
.not-found h2 { font-size:24px; color:#0b2b44; } .not-found p { color:#64748b; }
.back-btn { padding:10px 24px; border-radius:40px; border:none; background:linear-gradient(135deg,#2d7aff,#1a5cdb); color:white; font-weight:600; display:flex; align-items:center; gap:8px; cursor:pointer; }
</style>