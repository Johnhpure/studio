# AI Studio Docker 部署指南

本指南将帮助您在 Dell 物理服务器上使用 Docker 部署 AI Studio 项目。

## 📋 前置要求

- Docker Engine 20.10+
- Docker Compose 2.0+
- 至少 2GB 可用内存
- 至少 5GB 可用磁盘空间

## 🚀 快速部署

### 1. 克隆项目到服务器

```bash
git clone <your-repo-url> ai-studio
cd ai-studio
```

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp env.example .env

# 编辑环境变量（重要！）
nano .env
```

**必须配置的环境变量：**
- `GOOGLE_API_KEY` 或 `GEMINI_API_KEY`: Google Gemini API 密钥
- `NEXT_PUBLIC_APP_URL`: 您的服务器访问地址

### 3. 一键部署

```bash
# 使用部署脚本（推荐）
./deploy.sh

# 或手动执行
docker-compose up -d --build
```

### 4. 访问应用

打开浏览器访问: `http://your-server-ip:3000`

## 🛠️ 部署脚本使用

`deploy.sh` 脚本提供了完整的部署管理功能：

```bash
# 构建镜像
./deploy.sh build

# 启动服务
./deploy.sh start

# 停止服务
./deploy.sh stop

# 重启服务
./deploy.sh restart

# 查看日志
./deploy.sh logs

# 清理所有资源
./deploy.sh clean

# 显示帮助
./deploy.sh help
```

## 🔧 手动部署步骤

如果不使用部署脚本，可以手动执行以下命令：

### 构建镜像

```bash
docker build -t ai-studio:latest .
```

### 启动服务

```bash
docker-compose up -d
```

### 查看状态

```bash
docker-compose ps
docker-compose logs -f
```

## 📁 项目结构

```
ai-studio/
├── Dockerfile              # Docker 镜像构建文件
├── docker-compose.yml      # Docker Compose 配置
├── .dockerignore           # Docker 构建忽略文件
├── deploy.sh               # 部署脚本
├── env.example             # 环境变量模板
└── README-Docker.md        # 本文档
```

## 🔐 环境变量配置

### 必需配置

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `GOOGLE_API_KEY` | Google Gemini API 密钥 | `AIza...` |
| `NEXT_PUBLIC_APP_URL` | 应用访问地址 | `http://192.168.1.100:3000` |

### 可选配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `PORT` | 应用端口 | `3000` |
| `NODE_ENV` | 运行环境 | `production` |
| `LOG_LEVEL` | 日志级别 | `info` |

## 🌐 网络配置

### 端口映射

- `3000`: 应用主端口
- 如需要 HTTPS，可配置 Nginx 反向代理

### 防火墙设置

确保开放必要端口：

```bash
# Ubuntu/Debian
sudo ufw allow 3000

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

## 📊 监控和日志

### 查看应用日志

```bash
# 实时日志
docker-compose logs -f ai-studio

# 最近 100 行日志
docker-compose logs --tail 100 ai-studio
```

### 健康检查

应用包含内置健康检查，可通过以下方式查看：

```bash
# 查看容器健康状态
docker ps

# 详细健康检查信息
docker inspect ai-studio-app | grep -A 10 Health
```

## 🔄 更新部署

### 更新应用代码

```bash
# 拉取最新代码
git pull origin main

# 重新构建并重启
./deploy.sh restart
```

### 更新 Docker 镜像

```bash
# 重新构建镜像
./deploy.sh build

# 重启服务
./deploy.sh start
```

## 🗂️ 数据持久化

默认配置包含数据卷挂载：

```yaml
volumes:
  - app-data:/app/data
```

如需备份数据：

```bash
# 备份数据卷
docker run --rm -v ai-studio_app-data:/data -v $(pwd):/backup alpine tar czf /backup/app-data-backup.tar.gz -C /data .

# 恢复数据卷
docker run --rm -v ai-studio_app-data:/data -v $(pwd):/backup alpine tar xzf /backup/app-data-backup.tar.gz -C /data
```

## 🐛 故障排查

### 常见问题

1. **端口被占用**
   ```bash
   # 检查端口占用
   sudo netstat -tlnp | grep :3000
   
   # 修改 docker-compose.yml 中的端口映射
   ports:
     - "3001:3000"  # 改为其他端口
   ```

2. **API 密钥错误**
   - 检查 `.env` 文件中的 API 密钥是否正确
   - 确认 API 密钥有足够的配额和权限

3. **内存不足**
   ```bash
   # 检查系统资源
   free -h
   docker stats
   ```

4. **构建失败**
   ```bash
   # 清理 Docker 缓存
   docker system prune -a
   
   # 重新构建
   ./deploy.sh clean
   ./deploy.sh build
   ```

### 日志分析

```bash
# 应用日志
docker-compose logs ai-studio

# 系统日志
journalctl -u docker

# 容器详细信息
docker inspect ai-studio-app
```

## 📞 技术支持

如遇到问题，请检查：

1. Docker 和 Docker Compose 版本
2. 服务器资源使用情况
3. 网络连接和防火墙设置
4. 环境变量配置
5. API 密钥有效性

## 🔒 安全建议

1. **环境变量安全**
   - 不要将 `.env` 文件提交到版本控制
   - 定期更换 API 密钥
   - 使用强密码保护服务器

2. **网络安全**
   - 配置防火墙只开放必要端口
   - 考虑使用 HTTPS（配置 SSL 证书）
   - 限制服务器访问权限

3. **容器安全**
   - 定期更新 Docker 镜像
   - 使用非 root 用户运行容器
   - 定期清理未使用的镜像和容器
