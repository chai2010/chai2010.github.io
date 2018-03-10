# 个人主页

### 本地测试:

1. 安装 Docker
1. 获取 Caddy 容器镜像: `docker pull abiosoft/caddy`
1. 安装 hugo: `brew install hugo`
1. 运行 `hugo`, 生成 public 目录
1. 运行 `make dev`, 启动服务
1. 打开 http://localhost:2015

### 部署服务

1. 安装 Docker
1. 获取 Caddy 容器镜像: `docker pull abiosoft/caddy`
1. 将 Makefile 和 Caddyfile 复制到云主机 `/root` 目录
1. 运行 `make pub`, 启动服务
1. 打开 https://localhost
