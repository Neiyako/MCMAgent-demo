import { createRouter, createWebHistory } from "vue-router"
const routes = [
  { path: "/", name: "RoleSelect", component: () => import("@/views/RoleSelectView.vue") },
  { path: "/settings", name: "Settings", component: () => import("@/views/SettingsView.vue") },
  { path: "/modeler", name: "Modeler", component: () => import("@/views/ModelerView.vue"), meta: { role: "modeler" } },
  { path: "/coder", name: "Coder", component: () => import("@/views/CoderView.vue"), meta: { role: "coder" } },
  { path: "/writer", name: "Writer", component: () => import("@/views/WriterView.vue"), meta: { role: "writer" } },
  { path: "/:pathMatch(.*)*", component: () => import("@/views/NotFoundView.vue") }
]
const router = createRouter({ history: createWebHistory(), routes })
router.beforeEach((to, _from, next) => {
  const required = to.meta.role
  if (required) {
    const stored = localStorage.getItem("user_role")
    if (stored !== required) { next("/"); return }
  }
  next()
})
export default router