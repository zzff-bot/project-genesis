# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个「定制 AI 智能体对话 APP」—— 用户可自定义智能体的视觉风格、性格特征和引导目的，然后与定制好的智能体进行对话。使用 DeepSeek API 作为后端 LLM，所有数据保存在浏览器 localStorage 中。

## 常用命令

```bash
npm run dev          # 启动开发服务器（默认 http://localhost:5173）
npm run build        # 类型检查 + 生产构建
npm run lint         # Oxlint 代码检查
npm run preview      # 预览生产构建
```

## 技术栈

- **React 19** + **TypeScript 6** + **Vite 8**
- **Tailwind CSS 4**（通过 `@tailwindcss/vite` 插件集成，零配置）
- **React Router v7**（`react-router-dom`，使用传统 `BrowserRouter` 模式，非 Data Router）
- **Lucide React** 图标库
- **DeepSeek API**（OpenAI 兼容格式，`deepseek-chat` 模型，流式调用）

## 环境变量

- `.env` — 存放 `VITE_DEEPSEEK_API_KEY`，已加入 `.gitignore`
- `src/vite-env.d.ts` — 类型声明，定义了 `ImportMetaEnv` 接口
- 代码中通过 `import.meta.env.VITE_DEEPSEEK_API_KEY` 读取

## 架构核心

### 数据流

```
用户操作 → AgentContext (useReducer) → 组件 re-render
                ↕
         localStorage 持久化（带内存缓存层）
                ↕
         DeepSeek API (流式 + RAF 节流)
```

### 路由

- `/` — `AgentConfigPage`：智能体创建/管理首页
- `/chat/:agentId` — `ChatPage`：对话界面
- `*` → 重定向到 `/`

### 全局状态 (AgentContext)

`src/contexts/AgentContext.tsx` 使用 `useReducer` 管理全部应用状态：

| Action | 用途 |
|---|---|
| `ADD_MESSAGE` | 追加消息到 state.sessions |
| `UPDATE_LAST_ASSISTANT` | 流式更新最后一条助手消息内容（RAF 节流） |
| `SET_STREAMING` | 控制流式状态 |
| `ADD_AGENT` / `DELETE_AGENT` | 智能体 CRUD |

**关键函数 `sendMsg` 流程**：
1. 用户消息写入 state + storage（`role: 'user'`）
2. 空助手消息**仅 dispatch 到 state**（不写 storage，因为 `history.slice(0, -1)` 需要排除它）
3. RAF 节流循环更新 `UPDATE_LAST_ASSISTANT`
4. 流结束后**追加**一条新 `role: 'assistant'` 消息到 storage（注意：不能覆写最后一条，那永远是用户消息）
5. state 和 storage 中的助手消息 ID 可能不同（state 中是占位 ID，storage 中是最终 ID），这是正常的

### 视觉主题系统

5 种主题（`modern` / `minimal` / `warm` / `tech` / `playful`）通过 CSS 变量实现。

- **`:root`** — 默认变量（modern 配色），供 AgentConfigPage 等无主题页面使用
- **`.theme-{style}`** — 各主题覆盖变量，由 ChatPage 根元素挂载
- 所有组件通过 `var(--color-*)` 引用颜色，而非硬编码色值

### DeepSeek API 集成

- API Key 通过 `import.meta.env.VITE_DEEPSEEK_API_KEY` 读取
- 使用流式调用（`sendMessageStream`），打字机效果
- 每次请求携带 system prompt + 最近 20 轮对话历史（`MAX_HISTORY = 20`）
- System prompt 由 `src/utils/promptBuilder.ts` 根据用户配置动态生成

### Markdown 渲染（防止 XSS）

`ChatMessage.tsx` 中的 `renderContent` 采用**先转义再转换**策略：
1. 提取代码块和行内代码 → 用占位符保护
2. HTML 转义所有剩余文本
3. 在已转义文本上应用 Markdown 正则（粗体、标题、列表、链接等）
4. 还原占位符

这样确保用户输入中的 `<script>` 等标签被转义为 `&lt;script&gt;`，杜绝 XSS。

### localStorage 存储层（带内存缓存）

`src/services/storage.ts` 封装所有本地存储操作：

- **键名**：`agent-configs`、`chat-sessions`、`active-agent-id`
- **内存缓存**：`agentsCache` 和 `sessionsCache`，写入时自动更新，避免重复 `JSON.parse`
- **不要在组件中直接操作 localStorage**，始终通过 storage 服务

### 关键类型

所有类型定义集中在 `src/types/index.ts`：
- `AgentConfig` — 智能体配置（名称、风格、性格、角色、目标、systemPrompt）
- `ChatMessage` — 对话消息（`role: 'user' | 'assistant'`）
- `VisualStyle` — 联合类型，5 种视觉风格
- `VISUAL_STYLES` 和 `PERSONALITY_TEMPLATES` 预设数据

## 注意事项

- React Router v7 使用传统 `BrowserRouter`，**不使用 Data Router 模式**。`useBlocker` / `usePrompt` 等 Data Router API 在此项目中不可用。流式输出时的导航守卫通过 `beforeunload` 事件 + 返回按钮 `confirm` 实现。
- 流式更新使用 `requestAnimationFrame` 节流，每帧最多 dispatch 一次，避免数百次 re-render
- AgentConfigPage **不挂载 theme 类**，依赖 `:root` 默认 CSS 变量；ChatPage 通过 `theme-${agent.visualStyle}` 覆盖
- `storage.addAgent` 和 `storage.deleteAgent` 会先清除缓存再操作，确保读到最新数据
