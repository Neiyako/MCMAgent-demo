# MCM AI Agent 🧠

> 美国大学生数学建模竞赛（MCM/ICM）AI 辅助工具 —— 三位一体智能工作台

[![部署状态](https://img.shields.io/badge/deploy-ready-brightgreen)](https://github.com/your-repo)
[![技术栈](https://img.shields.io/badge/vue-3.5-blue)](https://vuejs.org/)
[![后端](https://img.shields.io/badge/fastapi-0.115-blue)](https://fastapi.tiangolo.com/)
[![Docker](https://img.shields.io/badge/docker-ready-blue)](https://www.docker.com/)

---

## 📖 项目简介

**MCM AI Agent** 是一个专为 MCM/ICM 参赛团队设计的全栈 AI 辅助平台，通过三个独立角色（建模手、编程手、论文手）为团队提供智能对话、知识检索、文档管理、图表渲染、PDF 生成等能力。项目采用 **Vue 3 + FastAPI + LiteLLM** 架构，支持多种大语言模型（OpenAI、DeepSeek、Gemini 等），可私有化部署，数据本地存储，安全可控。

---

## ✨ 核心功能

| 角色 | 核心能力 | 特色工具 |
|------|----------|----------|
| **建模手** (Modeler) | 问题拆解、模型设计、数学推理 | • 往届 MCM 真题库（PDF 浏览）<br>• 双栏模型对比阅读器<br>• 草稿笔记（本地存储） |
| **编程手** (Coder) | 算法实现、数据清洗、代码生成 | • 手写渲染台（Mermaid / 树形结构）<br>• 代码块高亮与复制<br>• 草稿笔记 |
| **论文手** (Writer) | 论文撰写、图表排版、AI 评审 | • AI 智能评审（上传 PDF 生成报告）<br>• 文章结构渲染台<br>• 草稿笔记 |

**通用功能**：
- 💬 **多模态对话**：支持文本、图片、PDF、Word 文件上传，AI 自动识别并回答
- 📚 **对话历史**：所有会话自动保存，支持切换、删除、导出
- 🎨 **Markdown + LaTeX**：完整支持数学公式、代码块、表格、流程图
- 📄 **PDF 报告生成**：AI 评审结果一键导出为格式化 PDF
- 🔒 **本地数据**：所有配置、草稿、历史记录存储在浏览器 localStorage，隐私安全
- ⚙️ **多模型兼容**：支持 OpenAI、DeepSeek、Gemini、Claude 等（通过 LiteLLM 代理）

---

## 🧱 技术栈

| 层级 | 技术选型 |
|------|----------|
| 前端 | Vue 3 (Composition API, `<script setup>`) + Vite + TypeScript |
| 状态管理 | Pinia |
| 路由 | Vue Router 4 |
| UI 样式 | 原生 CSS（无依赖） + Font Awesome 图标 |
| Markdown | marked + KaTeX（数学公式） |
| 图表 | Mermaid + D3 |
| 后端 | Python 3.10 + FastAPI + Uvicorn |
| LLM 网关 | LiteLLM（统一调用 OpenAI/DeepSeek/Gemini 等） |
| 文件处理 | pdfplumber（PDF 解析）、python-docx（Word 解析）、reportlab（PDF 生成） |
| 容器化 | Docker + Docker Compose |
| 数据库（可选） | Redis（用于会话缓存，当前为可选） |

---

## 🚀 一键部署（推荐）

### 前置条件
- 安装 **Docker**（>= 20.10）和 **Docker Compose**（>= 2.0）
- 确保端口 `80`、`8000`、`6379` 未被占用（或自行修改映射）
- 拥有至少一个 LLM 服务的 API Key（如 OpenAI、DeepSeek 等）

### 部署步骤
1. **克隆项目**
   ```bash
   git clone https://github.com/Neiyako/MCMAgent-demo.git
   cd MCMAgent-demo
   ```

2. **执行一键部署脚本**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

3. **配置环境变量（首次运行会自动提示）**  
   脚本会自动创建 `.env` 文件，您需要修改其中的 `OPENAI_API_KEY`（或使用 `DEEPSEEK_API_KEY` 等，根据您选择的模型修改 `OPENAI_API_BASE` 和 `OPENAI_MODEL`）。
   ```env
   OPENAI_API_KEY=sk-xxxxx
   OPENAI_API_BASE=https://api.openai.com/v1
   OPENAI_MODEL=gpt-4o
   # 如果使用 DeepSeek：
   # OPENAI_API_BASE=https://api.deepseek.com/v1
   # OPENAI_MODEL=deepseek-chat
   ```

4. **等待部署完成**（首次构建约 3-5 分钟）

5. **访问应用**  
   浏览器打开 `http://localhost`，开始使用！

---

### 📂 目录结构（部署后自动创建）
```
项目根目录/
├── backend/               # 后端源码
├── frontend/              # 前端源码
├── public/                # 静态资源（挂载）
│   ├── docs/models/       # 模型 PDF 文件（可自由增删）
│   └── reports/           # 生成的报告 PDF
├── skills/                # 角色系统提示（可自定义）
├── uploads/               # 用户上传文件临时存储
├── figures/               # 图表存储
├── logs/                  # 日志（可选）
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
├── deploy.sh
└── .env
```

---

## 🎯 使用指南

### 1. 首次启动
- 进入首页，选择角色（建模手 / 编程手 / 论文手）
- 点击“切换角色”可随时更换，所有数据（对话、草稿）按角色隔离

### 2. 对话交互
- 在输入框输入文本，按 Enter 发送
- 点击回形针图标可上传文件（支持图片、PDF、Word）
- AI 会流式返回回答，支持 Markdown、代码块、公式渲染
- 每条助手消息右上角有“复制”按钮

### 3. 模型 PDF 库（建模手）
- 将任意 PDF 文件放入 `public/docs/models/` 目录
- 重启容器或执行 `docker compose restart backend`，前端会自动列出所有 PDF
- 点击卡片可预览 PDF，模型对比工具可选择任意两个进行并排阅读

### 4. AI 评审（论文手）
- 上传 PDF 论文，点击“开始分析”
- AI 会生成详细的评审报告（含模型逻辑、创新性、结构等）
- 评审完成后自动生成 PDF 报告，可在对话中下载

### 5. 自定义技能（系统提示）
- 编辑 `skills/modeler.md`、`skills/coder.md`、`skills/writer.md` 可定制角色行为
- 重启后端生效

---

## ❓ 常见问题（FAQ）

### 1. 部署后访问 `http://localhost` 显示 502 或无法连接
- 检查 Docker 容器是否正常运行：`docker compose ps`
- 查看日志：`docker compose logs frontend` 和 `docker compose logs backend`
- 确保端口 80 未被占用（Mac/Linux 下可能需要 sudo）

### 2. AI 回答很“呆”或忘记上下文
- 确认前端请求中是否携带了 `history` 字段（检查浏览器 Network 面板）
- 后端 `main.py` 中 `chat` 函数已支持 `req.history`，请确保代码为最新版本
- 若对话过长，可限制历史消息数量（如保留最近 10 轮）

### 3. 图片上传失败或报错
- 当前后端支持图片作为输入（分析），但**不支持图像生成**。如需生成图片，请使用 OpenAI `gpt-image-2` 等专用模型，并在前端调用 `/api/v1/generate-image` 端点（需自行扩展）
- 确保图片大小不超过 10MB

### 4. PDF 列表不显示新添加的文件
- 因为列表在构建时注入，增删文件后需要**重启后端容器**：
  ```bash
  docker compose restart backend
  ```
- 或者重新构建镜像：`docker compose up -d --build backend`

### 5. 如何更换模型？
- 修改 `.env` 中的 `OPENAI_API_BASE` 和 `OPENAI_MODEL`
- 支持模型列表参考 [LiteLLM Providers](https://docs.litellm.ai/docs/providers)

### 6. 后端日志显示 `litellm.APIConnectionError` 或认证错误
- 检查 API Key 是否正确，是否有足够余额
- 如果使用 Google Gemini/Vertex AI，需额外安装 `google-auth` 并配置服务账号（参考文档）

### 7. 生成的 PDF 报告中文乱码
- 报告使用 `reportlab` 生成，默认字体不支持中文。解决方案：
  - 安装中文字体（如 `SimHei.ttf`）并注册到 `reportlab`（需修改后端代码）
  - 或改用 `weasyprint` 生成（支持中文更好），但需额外配置

---

## 🛠️ 开发模式（非 Docker）

如果您希望在本地开发环境中运行（不使用 Docker），请参考以下步骤：

### 前端
```bash
cd frontend
npm install
npm run dev          # 访问 http://localhost:5173
```

### 后端
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

**注意**：需要手动创建 `public/docs/models`、`public/reports` 等目录，并配置代理（Vite 开发服务器代理 `/api` 到 `localhost:8000`）。

---

## 📄 许可证
本项目采用 **MIT 许可证**，您可以自由使用、修改和分发。

---

## 🤝 贡献
欢迎提交 Issue 和 Pull Request，帮助改进项目。

---

## 📞 联系
如有问题，请提交 Issue 或邮件至 `Neiyako@163.com`。

---

**祝您比赛顺利！🏆**
```
