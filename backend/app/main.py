from fastapi import FastAPI, HTTPException, Request, Form, UploadFile, File
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Literal, List, Optional
import litellm
import os
import json
import time
import traceback
import base64
import io
import aiofiles
from datetime import datetime
from dotenv import load_dotenv
import uuid

from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch

load_dotenv()
app = FastAPI(title="MCM AI Agent API", version="3.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

SKILLS_DIR = os.getenv("SKILLS_DIR", "./skills")
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
FIGURES_DIR = os.path.join(os.path.dirname(__file__), "..", "figures")
MAX_MESSAGE_LENGTH = int(os.getenv("MAX_MESSAGE_LENGTH", "50000"))
MAX_PDF_EXTRACT_CHARS = int(os.getenv("MAX_PDF_EXTRACT_CHARS", "8000"))

for d in [UPLOAD_DIR, FIGURES_DIR, SKILLS_DIR]:
    os.makedirs(d, exist_ok=True)

app.mount("/figures", StaticFiles(directory=FIGURES_DIR), name="figures")

docs_dir = os.path.join(os.getcwd(), "public", "docs")
if os.path.exists(docs_dir):
    app.mount("/docs", StaticFiles(directory=docs_dir), name="docs")

REPORT_DIR = os.path.join(os.getcwd(), "public", "reports")
os.makedirs(REPORT_DIR, exist_ok=True)
app.mount("/reports", StaticFiles(directory=REPORT_DIR), name="reports")

LOGS = []

class FileData(BaseModel):
    filename: str
    data: str
    mime_type: str

class ChatReq(BaseModel):
    session_id: str
    role: Literal["modeler", "coder", "writer"]
    message: str
    files: List[FileData] = []
    skill: Optional[str] = None
    history: List[dict] = []  # 新增历史消息字段

class ReportRequest(BaseModel):
    content: str
    title: str = "AI 评审报告"
    filename: Optional[str] = None

SKILLS_CACHE = {}
def load_skill(role: str, skill_name: Optional[str] = None) -> str:
    name = skill_name or role
    if name in SKILLS_CACHE: return SKILLS_CACHE[name]
    try:
        with open(os.path.join(SKILLS_DIR, f"{name}.md"), "r", encoding="utf-8") as f:
            content = f.read()
        SKILLS_CACHE[name] = content
        return content
    except FileNotFoundError:
        try:
            with open(os.path.join(SKILLS_DIR, f"{role}.md"), "r", encoding="utf-8") as f:
                content = f.read()
            SKILLS_CACHE[role] = content
            return content
        except FileNotFoundError:
            return f"You are a helpful {role} assistant."

try:
    import pdfplumber
    def extract_pdf_text(b64: str) -> str:
        pdf_bytes = base64.b64decode(b64)
        if len(pdf_bytes) > 10 * 1024 * 1024: raise ValueError("PDF 超过 10MB")
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            return "\n".join([p.extract_text() or "" for p in pdf.pages]).strip()
except ImportError:
    def extract_pdf_text(b64: str) -> str: raise RuntimeError("pdfplumber 未安装")

try:
    from docx import Document
    def extract_docx_text(b64: str) -> str:
        doc = Document(io.BytesIO(base64.b64decode(b64)))
        return "\n".join([p.text for p in doc.paragraphs if p.text.strip()]).strip()
except ImportError:
    def extract_docx_text(b64: str) -> str: raise RuntimeError("python-docx 未安装")

def truncate_text(text: str, max_len: int) -> str:
    return text[:max_len] + ("\n\n...（截断）" if len(text) > max_len else "")

def get_llm_config(request: Request):
    return {
        "api_key": request.headers.get("X-API-Key") or os.getenv("OPENAI_API_KEY"),
        "base_url": request.headers.get("X-API-Base") or os.getenv("OPENAI_API_BASE"),
        "model": request.headers.get("X-Model") or os.getenv("OPENAI_MODEL") or "gpt-4o",
    }

@app.post("/api/v1/chat")
async def chat(req: ChatReq, request: Request):
    req.message = truncate_text(req.message, MAX_MESSAGE_LENGTH)
    skill = load_skill(req.role, req.skill)
    config = get_llm_config(request)
    if not config["api_key"]:
        raise HTTPException(400, "缺少 API Key")

    # ---- 构建当前用户消息内容 ----
    user_content = []
    if req.message:
        user_content.append({"type": "text", "text": req.message})
    for file in req.files:
        try:
            if file.mime_type.startswith("image/"):
                user_content.append({"type": "image_url", "image_url": {"url": f"data:{file.mime_type};base64,{file.data}"}})
            elif file.mime_type == "application/pdf":
                text = extract_pdf_text(file.data)
                if text:
                    truncated = truncate_text(text, MAX_PDF_EXTRACT_CHARS)
                    user_content.append({"type": "text", "text": f"【PDF 内容】\n{truncated}"})
            elif file.mime_type in ("application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword"):
                text = extract_docx_text(file.data)
                if text:
                    truncated = truncate_text(text, MAX_PDF_EXTRACT_CHARS)
                    user_content.append({"type": "text", "text": f"【Word 内容】\n{truncated}"})
            else:
                user_content.append({"type": "text", "text": f"【文件】{file.filename}"})
        except Exception as e:
            user_content.append({"type": "text", "text": f"⚠️ 文件 {file.filename} 处理失败: {str(e)}"})

    # ---- 构建完整 messages：系统提示 + 历史 + 当前用户 ----
    messages = []
    if skill:
        messages.append({"role": "system", "content": skill})

    # 添加历史消息（过滤掉系统消息，避免重复）
    if req.history:
        for msg in req.history:
            if msg.get("role") != "system":
                messages.append(msg)

    # 添加当前用户消息
    if user_content:
        # 如果只有一条纯文本，直接用字符串（兼容不同API）
        if len(user_content) == 1 and user_content[0]["type"] == "text":
            messages.append({"role": "user", "content": user_content[0]["text"]})
        else:
            messages.append({"role": "user", "content": user_content})
    else:
        # 如果没有内容（理论上不会发生），但以防万一
        messages.append({"role": "user", "content": req.message})

    # ---- 日志记录 ----
    start_time = time.time()
    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "session": req.session_id,
        "role": req.role,
        "skill": req.skill,
        "message": req.message[:200],
        "files": [f.filename for f in req.files],
        "model": config["model"],
        "api_base": config["base_url"] or "default",
        "response": "",
        "duration": 0,
        "status": "success"
    }

    async def generate():
        nonlocal log_entry
        try:
            kwargs = {
                "model": config["model"],
                "messages": messages,
                "stream": True,
                "temperature": 0.7,
                "api_key": config["api_key"],
                "timeout": 300,
            }
            if config["base_url"]:
                kwargs["api_base"] = config["base_url"]
            response = await litellm.acompletion(**kwargs)
            full = ""
            async for chunk in response:
                if chunk.choices and chunk.choices[0].delta.content:
                    content = chunk.choices[0].delta.content
                    full += content
                    yield f"event: content\ndata: {json.dumps({'content': content})}\n\n"
            log_entry["response"] = full[:500]
            log_entry["duration"] = time.time() - start_time
            LOGS.append(log_entry)
            yield "event: done\ndata: {}\n\n"
        except Exception as e:
            traceback.print_exc()
            log_entry["status"] = "error"
            log_entry["error"] = str(e)
            LOGS.append(log_entry)
            yield f"event: error\ndata: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")

@app.post("/api/v1/upload")
async def upload_file(session_id: str = Form(...), file: UploadFile = File(...)):
    try:
        content = await file.read()
        if len(content) > 20 * 1024 * 1024:
            raise HTTPException(413, "文件超过 20MB")
        file_id = f"file_{int(time.time())}_{file.filename}"
        save_path = os.path.join(UPLOAD_DIR, file_id)
        async with aiofiles.open(save_path, "wb") as f:
            await f.write(content)
        return {"file_id": file_id, "filename": file.filename, "size": len(content)}
    except Exception as e:
        raise HTTPException(500, f"上传失败: {e}")

@app.get("/api/logs/export")
async def export_logs():
    content = json.dumps(LOGS, ensure_ascii=False, indent=2)
    return StreamingResponse(
        io.BytesIO(content.encode("utf-8")),
        media_type="application/json",
        headers={"Content-Disposition": "attachment; filename=logs.json"}
    )

@app.get("/health")
async def health():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

@app.get("/")
async def root():
    return {"message": "MCM AI Agent API v3.0", "docs": "/docs"}

@app.post("/api/v1/generate-report")
async def generate_report(req: ReportRequest):
    try:
        if req.filename:
            base_name = req.filename.replace(".pdf", "")
        else:
            base_name = f"report_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        safe_name = "".join(c for c in base_name if c.isalnum() or c in " _-")[:50]
        filename = f"{safe_name}_{uuid.uuid4().hex[:8]}.pdf"
        filepath = os.path.join(REPORT_DIR, filename)

        doc = SimpleDocTemplate(filepath, pagesize=A4)
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'TitleStyle',
            parent=styles['Title'],
            fontSize=18,
            textColor=colors.darkblue,
            spaceAfter=12
        )
        body_style = styles['BodyText']
        date_style = ParagraphStyle('Date', parent=styles['Normal'], fontSize=10, textColor=colors.grey)

        story = []
        story.append(Paragraph(req.title, title_style))
        story.append(Spacer(1, 0.2 * inch))
        story.append(Paragraph(f"生成日期：{datetime.now().strftime('%Y-%m-%d %H:%M')}", date_style))
        story.append(Spacer(1, 0.2 * inch))

        paragraphs = req.content.split('\n\n')
        for para in paragraphs:
            if para.strip():
                text = para.replace('\n', ' ')
                story.append(Paragraph(text, body_style))
                story.append(Spacer(1, 0.1 * inch))

        doc.build(story)
        return {"pdf_url": f"/reports/{filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"报告生成失败: {str(e)}")