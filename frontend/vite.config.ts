import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import fs from "fs";

// 扫描 public/docs/models 目录下的 PDF 文件
const modelsDir = path.resolve(__dirname, "./public/docs/models");
let pdfFiles: any[] = [];

if (fs.existsSync(modelsDir)) {
  const files = fs.readdirSync(modelsDir).filter(f => f.endsWith(".pdf"));
  pdfFiles = files.map((file, index) => {
    const name = file.replace(/\.pdf$/, "");
    // 支持多种命名格式，如 "2026_IMMC_Problem" 或 "2026_MCM_Problem_A"
    const parts = name.split("_");
    const year = parts[0] || "未知";
    let title = parts.slice(1).join(" ") || name;
    // 将下划线替换为空格，并首字母大写
    title = title.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    return {
      id: index + 1,
      year,
      title,
      pdf: file,               // 文件名，如 "2026_MCM_Problem_A.pdf"
      desc: `${year} 年 ${title} 模型`,
      tags: ["PDF"]
    };
  });
  console.log(`✅ 扫描到 ${pdfFiles.length} 个 PDF 文件`);
} else {
  console.warn("⚠️ 未找到 PDF 目录，请检查 public/docs/models 是否存在");
}

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") }
  },
  base: "/",
  publicDir: path.resolve(__dirname, "./public"),
  define: {
    // 注入为 JSON 字符串
    __PDF_LIST__: JSON.stringify(pdfFiles)
  },
  server: {
    proxy: {
      "/api": { target: "http://localhost:8000", changeOrigin: true },
      "/figures": { target: "http://localhost:8000", changeOrigin: true }
      // 不再代理 /docs，由 Vite 开发服务器提供静态文件
    }
  }
});