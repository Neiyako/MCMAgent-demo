import { ref } from "vue"
const STORAGE_KEY = "mcm_settings"
export function useSettings() {
  const settings = ref({ apiKey: "", baseUrl: "", model: "" })
  const load = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        settings.value = { apiKey: parsed.apiKey || "", baseUrl: parsed.baseUrl || "", model: parsed.model || "" }
      }
    } catch (e) { console.warn("[useSettings] 加载失败:", e) }
  }
  const save = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings.value))
      alert("✅ 设置已保存")
    } catch (e) { console.error("[useSettings] 保存失败:", e); alert("❌ 保存失败") }
  }
  load()
  return { settings, save }
}