# 定制 AI 智能体对话 APP

一个纯前端 SPA 应用，用户可以自定义 AI 智能体的视觉风格、性格特征和引导目的，然后与定制好的智能体进行实时对话。

## 功能特性

- **智能体定制** — 自由配置名称、视觉风格（5 种主题）、性格模板（6 种）、角色定位和引导目的
- **实时对话** — 基于 DeepSeek API 的流式对话，打字机效果
- **多智能体管理** — 支持创建、切换、删除多个智能体，每个智能体独立保存对话历史
- **5 种视觉主题** — Modern（蓝紫）、Minimal（黑白）、Warm（暖色）、Tech（霓虹绿深色）、Playful（粉紫）
- **Markdown 渲染** — 消息支持 Markdown 格式，代码高亮，且通过"先转义再转换"策略确保 XSS 安全
- **纯本地存储** — 所有数据保存在浏览器 localStorage，带内存缓存层，无需后端服务器

## 技术栈

| 技术 | 版本 | 用途 |
|---|---|---|
| React | 19 | UI 框架 |
| TypeScript | 6 | 类型安全 |
| Vite | 8 | 构建工具 |
| Tailwind CSS | 4 | 原子化 CSS 框架 |
| React Router | 7 | 客户端路由 |
| Lucide React | 1 | SVG 图标库 |
| DeepSeek API | — | LLM 后端（`deepseek-chat` 模型） |

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装与运行

```bash
# 安装依赖
npm install

# 配置 API Key（创建 .env 文件，写入你的 DeepSeek API Key）
echo VITE_DEEPSEEK_API_KEY=你的API密钥 > .env

# 启动开发服务器
npm run dev
```

浏览器访问 [http://localhost:5173](http://localhost:5173)。

### 其他命令

```bash
npm run build      # 类型检查 + 生产构建
npm run lint       # Oxlint 代码检查
npm run preview    # 预览生产构建
```

## 项目结构

```
src/
├── main.tsx                    # 应用入口
├── App.tsx                     # 根组件：路由 + 全局 Provider
├── index.css                   # Tailwind + CSS 变量主题系统 + 动画
├── vite-env.d.ts               # 环境变量类型声明
│
├── types/
│   └── index.ts                # 所有类型定义 + 预设数据常量
│
├── contexts/
│   └── AgentContext.tsx         # 全局状态管理（useReducer + Context）
│
├── services/
│   ├── storage.ts              # localStorage 封装（带内存缓存）
│   └── deepseek.ts             # DeepSeek API 客户端（流式 + 非流式）
│
├── utils/
│   └── promptBuilder.ts        # System Prompt 动态构建器
│
├── pages/
│   ├── AgentConfigPage.tsx     # 首页：智能体创建与管理
│   └── ChatPage.tsx            # 对话页面
│
├── components/
│   ├── StyleSelector.tsx       # 视觉风格选择器
│   ├── PersonalitySelector.tsx # 性格模板选择器
│   ├── GoalConfig.tsx          # 引导目的配置
│   ├── AgentInfoPanel.tsx      # 智能体信息侧边栏
│   ├── ChatMessage.tsx         # 消息气泡（Markdown + XSS 防护）
│   └── ChatInput.tsx           # 消息输入框（Enter 发送，自动高度）
│
└── assets/                     # 静态资源（图片、图标）
```

## 架构设计

### 数据流

```
用户操作 → AgentContext (useReducer) → 组件 re-render
                ↕
         localStorage 持久化（带内存缓存）
                ↕
         DeepSeek API（流式 + RAF 节流）
```

### 路由

| 路径 | 组件 | 说明 |
|---|---|---|
| `/` | `AgentConfigPage` | 智能体创建/管理首页 |
| `/chat/:agentId` | `ChatPage` | 对话页面 |
| `*` | 重定向到 `/` | 404 兜底 |

### 全局状态 (AgentContext)

使用 `useReducer` + React Context 管理全部应用状态，暴露以下核心方法：

| 方法 | 功能 |
|---|---|
| `createAgent(config)` | 创建新智能体，生成 System Prompt，写入存储 |
| `removeAgent(id)` | 删除智能体及关联对话历史 |
| `selectAgent(id)` | 切换活跃智能体，加载对话历史 |
| `sendMsg(content)` | 发送消息并流式接收回复 |
| `clearChat(agentId)` | 清空指定智能体的对话历史 |

### 视觉主题系统

5 种主题通过 CSS 变量实现，零运行时开销：

- **`:root`** — 默认变量（Modern 配色），供 AgentConfigPage 等无主题页面使用
- **`.theme-{style}`** — 各主题覆盖变量，由 ChatPage 根元素挂载
- 所有组件通过 `var(--color-*)` 引用颜色，不硬编码色值

### DeepSeek API 集成

- **API 格式**：OpenAI 兼容
- **模型**：`deepseek-chat`
- **调用方式**：流式（`sendMessageStream`），SSE 逐行解析
- **历史限制**：每次请求携带 system prompt + 最近 20 轮对话
- **节流策略**：流式更新使用 `requestAnimationFrame` 节流，避免过多 re-render

### Markdown 安全渲染

采用「先转义再转换」策略防止 XSS：

1. 提取代码块和行内代码，用占位符保护
2. HTML 转义所有剩余文本（`<script>` → `&lt;script&gt;`）
3. 在已转义文本上应用 Markdown 正则（粗体、标题、列表、链接等）
4. 还原代码占位符

### localStorage 存储层

封装在 `src/services/storage.ts`，所有持久化操作统一管理：

| 存储键 | 内容 |
|---|---|
| `agent-configs` | 所有智能体配置 |
| `chat-sessions` | 所有对话历史（按 agentId 索引） |
| `active-agent-id` | 当前活跃智能体 ID |

读写带内存缓存（`agentsCache` / `sessionsCache`），避免重复 `JSON.parse`。组件不应直接操作 localStorage，始终通过 storage 服务。

## 环境变量

| 变量 | 说明 |
|---|---|
| `VITE_DEEPSEEK_API_KEY` | DeepSeek API 密钥，定义在 `.env` 文件（已加入 `.gitignore`） |

## 注意事项

- 使用 React Router v7 传统 `BrowserRouter` 模式，`useBlocker` 等 Data Router API 不可用
- 流式输出时的导航守卫通过 `beforeunload` 事件 + 返回按钮 `confirm` 实现
- AgentConfigPage 不挂载 theme 类，依赖 `:root` 默认 CSS 变量
- ChatPage 通过 `theme-${agent.visualStyle}` 类覆盖主题变量
