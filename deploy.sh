#!/bin/bash

# ============================================================
# MCM AI Agent 一键部署脚本
# 功能：环境检查、目录创建、环境配置、Docker 构建与启动
# 使用：./deploy.sh
# ============================================================

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印信息函数
info() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# 检查 Docker 是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        error "Docker 未安装，请先安装 Docker（https://docs.docker.com/get-docker/）"
    fi
    info "Docker 已安装: $(docker --version)"
}

# 检查 Docker Compose 是否安装（兼容 v1/v2）
check_compose() {
    if docker compose version &> /dev/null; then
        COMPOSE_CMD="docker compose"
        info "Docker Compose 已安装: $(docker compose version)"
    elif command -v docker-compose &> /dev/null; then
        COMPOSE_CMD="docker-compose"
        info "Docker Compose 已安装: $(docker-compose --version)"
    else
        error "Docker Compose 未安装，请先安装 Docker Compose"
    fi
}

# 创建必要的目录
create_dirs() {
    info "创建必要目录..."
    mkdir -p public/docs/models
    mkdir -p public/reports
    mkdir -p uploads
    mkdir -p figures
    mkdir -p skills
    mkdir -p logs
    info "目录创建完成"
}

# 环境变量配置
setup_env() {
    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            cp .env.example .env
            info "已从 .env.example 创建 .env 文件，请根据需要修改"
        else
            warn ".env.example 不存在，创建默认 .env 文件"
            cat > .env <<EOF
OPENAI_API_KEY=your_api_key_here
OPENAI_API_BASE=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o
LOG_LEVEL=INFO
MAX_MESSAGE_LENGTH=50000
MAX_PDF_EXTRACT_CHARS=8000
EOF
            info "已创建默认 .env，请修改 OPENAI_API_KEY"
        fi
        warn "请编辑 .env 文件，设置正确的 OPENAI_API_KEY"
        read -p "按 Enter 继续部署（或 Ctrl+C 退出修改）..."
    else
        info ".env 文件已存在"
    fi
}

# 检查端口占用
check_ports() {
    local ports=(80 8000 6379)
    for port in "${ports[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            warn "端口 $port 已被占用，请停止占用程序或修改 docker-compose.yml 中的端口映射"
            read -p "按 Enter 继续尝试部署（可能冲突）..."
        fi
    done
}

# 拉取基础镜像（加速构建）
pull_base_images() {
    info "拉取基础镜像（可能耗时）..."
    docker pull node:20-alpine || true
    docker pull nginx:alpine || true
    docker pull python:3.10-slim || true
    docker pull redis:7.2-alpine || true
    info "基础镜像拉取完成（如有失败可忽略）"
}

# 构建并启动服务
build_and_up() {
    info "开始构建并启动所有服务..."
    $COMPOSE_CMD down --remove-orphans 2>/dev/null || true
    $COMPOSE_CMD up -d --build
    if [ $? -eq 0 ]; then
        info "所有服务已成功启动"
    else
        error "服务启动失败，请查看日志：$COMPOSE_CMD logs"
    fi
}

# 等待服务就绪
wait_for_services() {
    info "等待后端服务启动..."
    local max_attempts=30
    local attempt=1
    while [ $attempt -le $max_attempts ]; do
        if curl -s http://localhost:8000/health >/dev/null 2>&1; then
            info "后端服务已就绪"
            break
        fi
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    if [ $attempt -gt $max_attempts ]; then
        warn "后端服务健康检查超时，但服务可能仍在启动中"
    fi
}

# 显示访问信息
show_info() {
    echo ""
    info "=========================================="
    info "部署完成！"
    info "访问地址:"
    echo -e "  前端: ${BLUE}http://localhost${NC}"
    echo -e "  后端 API: ${BLUE}http://localhost:8000${NC}"
    echo -e "  API 文档: ${BLUE}http://localhost:8000/docs${NC}"
    echo ""
    info "查看日志:"
    echo "  $COMPOSE_CMD logs -f"
    echo ""
    info "停止服务:"
    echo "  $COMPOSE_CMD down"
    info "=========================================="
}

# 主流程
main() {
    echo "=========================================="
    echo "  MCM AI Agent 一键部署脚本"
    echo "=========================================="
    check_docker
    check_compose
    create_dirs
    setup_env
    check_ports
    pull_base_images
    build_and_up
    wait_for_services
    show_info
}

# 执行
main