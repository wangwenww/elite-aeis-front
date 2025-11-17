# 前端环境切换与 ngrok 演示指南

本文介绍如何在本地开发环境与 ngrok 临时演示环境之间快速切换，以及完整的演示流程。

## 1. 目录结构概览

```
src/
  config/
    env.local.json        # 本地环境配置
    env.ngrok.json        # ngrok 演示环境配置
    runtimeConfig.js      # 统一读取配置
```

`runtimeConfig.js` 会根据运行时变量 `VITE_RUNTIME_ENV` 读取对应的 JSON 文件，从而得到当前环境的 `apiBaseUrl`。Axios 客户端默认使用这个地址。

## 2. 前置准备

1. **安装依赖**
   ```bash
   cd /Users/wangwen/WebstormProjects/eliet-aeis
   npm install
   ```

2. **确认后端**
   - FastAPI 项目运行在本地：`uvicorn src.api.main:app --reload --port 8000`
   - 若要对外演示，请先确保后端本地服务可以正常响应。

3. **安装并登录 ngrok**
   ```bash
   brew install --cask ngrok  # 若未安装
   ngrok config add-authtoken <你的-ngrok-token>
   ```

## 3. 本地开发环境

1. 确认 `src/config/env.local.json` 内容（默认已写好）：
   ```json
   {
     "label": "本地开发",
     "apiBaseUrl": "http://localhost:8000"
   }
   ```

2. 启动前端：
   ```bash
   npm run dev
   ```

3. 浏览器访问 Vite 提示的地址（默认 `http://localhost:45654`）。此时 Axios 会请求本地后端。

## 4. 配置 ngrok 演示环境

### 4.1 启动 ngrok 隧道

1. 在后端项目所在机器运行 ngrok，将本地 `8000` 端口映射到公网：
   ```bash
   ngrok http 8000
   ```

2. 记录终端输出的 HTTPS 地址，例如：`https://abc123.ngrok.app`。

### 4.2 更新演示配置

1. 打开 `src/config/env.ngrok.json`，把 `apiBaseUrl` 改成刚才的 ngrok 地址：
   ```json
   {
     "label": "ngrok 临时演示",
     "apiBaseUrl": "https://abc123.ngrok.app"
   }
   ```

2. **可选建议**：把该文件加入 `.gitignore`，避免临时域名提交到仓库。

### 4.3 启动前端（指向 ngrok）

1. 在前端项目根目录运行：
   ```bash
   npm run dev:ngrok
   ```
   该命令会自动设置 `VITE_RUNTIME_ENV=ngrok`，前端改用 ngrok 的后端接口。

2. 把 Vite 的访问地址（例如 `http://localhost:45654`）分享给需要体验的人；对方访问时，所有 API 请求会通过 ngrok 转发到你的本地后端。

> 若需要打包静态文件用于部署，可运行 `npm run build:ngrok`，编译出的资源会默认使用 ngrok 配置的后端地址。

## 5. 环境切换与回退

- **切回本地开发**：直接关闭 `npm run dev:ngrok`，运行 `npm run dev` 即可。`VITE_RUNTIME_ENV` 默认为 `local`，配置自动恢复。
- **临时覆盖**：如果只想短暂测试新域名，可在命令前临时注入变量，不改 JSON：
  ```bash
  VITE_API_BASE_URL=https://新的域名.ngrok.app npm run dev
  ```
- **多环境扩展**：如未来加入测试服务器、新加坡正式站，只需新增 `env.staging.json` 类似文件，并在 `runtimeConfig.js` 的 `registry` 内登记，同时增加对应的 npm script。

## 6. 常见问题排查

- **后端跨域错误 (CORS)**
  - 确保 FastAPI 的 CORS 设置允许 ngrok 域名，例如：
    ```python
    origins = [
        "http://localhost:45654",
        "https://abc123.ngrok.app"
    ]
    ```

- **ngrok 地址变化**
  - 每次重启 ngrok 免费版都会生成新域名，请记得同步修改 `env.ngrok.json` 并重新运行 `npm run dev:ngrok`。

- **端口占用**
  - 默认 Vite 端口为 45654，如需修改，可在 `package.json` 的 scripts 部分或 `vite.config.js` 中调整。

- **演示结束**
  - 停止 `npm run dev:ngrok` 和 ngrok 隧道，项目自然回到本地状态。

## 7. 快速操作清单

1. 本地开发
   ```bash
   npm run dev
   ```
2. 启动 ngrok 隧道
   ```bash
   ngrok http 8000
   ```
3. 更新 `env.ngrok.json` 的 `apiBaseUrl`
4. 启动前端指向 ngrok
   ```bash
   npm run dev:ngrok
   ```
5. 演示结束，关闭命令并重新 `npm run dev`

按此流程，即可在几分钟内完成从本地开发到对外演示的环境切换，同时保持随时可回退到自己的开发环境。
