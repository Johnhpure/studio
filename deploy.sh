#!/bin/bash

# AI Studio Docker 部署脚本
# 用法: ./deploy.sh [build|start|stop|restart|logs|clean]

set -e

PROJECT_NAME="ai-studio"
IMAGE_NAME="ai-studio:latest"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查 Docker 是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null && ! command -v docker compose &> /dev/null; then
        log_error "Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi
}

# 检查环境文件
check_env() {
    if [ ! -f ".env" ]; then
        log_warning ".env 文件不存在"
        if [ -f "env.example" ]; then
            log_info "复制 env.example 到 .env"
            cp env.example .env
            log_warning "请编辑 .env 文件并填入正确的配置值"
            exit 1
        else
            log_error "env.example 文件不存在，无法创建 .env"
            exit 1
        fi
    fi
}

# 构建镜像
build_image() {
    log_info "开始构建 Docker 镜像..."
    docker build -t $IMAGE_NAME .
    log_success "Docker 镜像构建完成"
}

# 启动服务
start_services() {
    log_info "启动 AI Studio 服务..."
    if command -v docker-compose &> /dev/null; then
        docker-compose up -d
    else
        docker compose up -d
    fi
    log_success "AI Studio 服务启动完成"
    log_info "访问地址: http://localhost:3000"
}

# 停止服务
stop_services() {
    log_info "停止 AI Studio 服务..."
    if command -v docker-compose &> /dev/null; then
        docker-compose down
    else
        docker compose down
    fi
    log_success "AI Studio 服务已停止"
}

# 重启服务
restart_services() {
    log_info "重启 AI Studio 服务..."
    stop_services
    start_services
}

# 查看日志
show_logs() {
    log_info "显示 AI Studio 服务日志..."
    if command -v docker-compose &> /dev/null; then
        docker-compose logs -f
    else
        docker compose logs -f
    fi
}

# 清理资源
clean_resources() {
    log_warning "这将删除所有相关的 Docker 资源（镜像、容器、卷）"
    read -p "确定要继续吗？(y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "清理 Docker 资源..."
        
        # 停止并删除容器
        if command -v docker-compose &> /dev/null; then
            docker-compose down -v --remove-orphans
        else
            docker compose down -v --remove-orphans
        fi
        
        # 删除镜像
        docker rmi $IMAGE_NAME 2>/dev/null || true
        
        # 清理未使用的资源
        docker system prune -f
        
        log_success "清理完成"
    else
        log_info "取消清理操作"
    fi
}

# 显示帮助信息
show_help() {
    echo "AI Studio Docker 部署脚本"
    echo ""
    echo "用法: $0 [命令]"
    echo ""
    echo "命令:"
    echo "  build     构建 Docker 镜像"
    echo "  start     启动服务"
    echo "  stop      停止服务"
    echo "  restart   重启服务"
    echo "  logs      查看日志"
    echo "  clean     清理所有 Docker 资源"
    echo "  help      显示此帮助信息"
    echo ""
    echo "如果不指定命令，将执行 build + start"
}

# 主函数
main() {
    check_docker
    check_env

    case "${1:-default}" in
        "build")
            build_image
            ;;
        "start")
            start_services
            ;;
        "stop")
            stop_services
            ;;
        "restart")
            restart_services
            ;;
        "logs")
            show_logs
            ;;
        "clean")
            clean_resources
            ;;
        "help")
            show_help
            ;;
        "default")
            build_image
            start_services
            ;;
        *)
            log_error "未知命令: $1"
            show_help
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"
