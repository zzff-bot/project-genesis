# Cloudflare Worker — DeepSeek API 代理

这个 Worker 作为 DeepSeek API 的安全代理层，API Key 仅存储在 Worker 环境变量中，不会暴露给浏览器端（前端 JS 代码中不再包含 API Key）。

## 架构

```
浏览器 → Cloudflare Worker → DeepSeek API
        (持有 API Key)       (Key 不暴露给前端)
```

## 部署步骤

### 1. 安装 Wrangler CLI（一次性）

```bash
npm install -g wrangler
```

### 2. 登录 Cloudflare

```bash
npx wrangler login
```

> 如果你还没有 Cloudflare 账号，请先在 [cloudflare.com](https://cloudflare.com) 免费注册。

### 3. 配置 API Key 加密变量

```bash
npx wrangler secret put DEEPSEEK_API_KEY
```

在弹出的提示中输入你的 DeepSeek API Key：
```
sk-66b8cd64412b4a178358f873368f35aa
```

### 4. 部署 Worker

```bash
npx wrangler deploy
```

部署成功后你会看到类似这样的输出：
```
Deployed deepseek-api-proxy (id: xxx)
  https://deepseek-api-proxy.你的用户名.workers.dev
```

### 5. 配置前端

将上一步得到的 URL 设置为前端的代理地址。有两种方式：

**本地开发**：编辑 `agent-app/.env`：
```
VITE_API_PROXY_URL=https://deepseek-api-proxy.你的用户名.workers.dev
```

**GitHub Pages 生产环境**：在 GitHub 仓库中添加 Variable：
1. 打开仓库 → Settings → Secrets and variables → Actions → Variables
2. 点击 **New repository variable**
3. Name: `VITE_API_PROXY_URL`
4. Value: `https://deepseek-api-proxy.你的用户名.workers.dev`

## CORS 配置

Worker 已配置允许以下来源跨域访问：
- `https://zzff-bot.github.io`（GitHub Pages）
- `http://localhost:5173`（Vite 开发服务器）
- `http://localhost:4173`（Vite 预览服务器）

如需添加其他来源，编辑 `index.js` 中的 `ALLOWED_ORIGINS` 数组。
