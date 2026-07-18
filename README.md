# Project Genesis — Digital Being Platform

一个让你「创造数字生命」的 AI 智能体平台，而非传统的 AI Agent Builder。

## 设计哲学

**Create Someone, Not Something.**

不是创建 AI 工具，而是创造有性格、有风格、有使命感的数字生命。

## 技术栈

- React 19 + TypeScript + Vite 8
- Tailwind CSS 4
- Framer Motion (Spring 动画)
- Zustand (状态管理)
- DeepSeek API (LLM)
- React Router v7
- Lucide React (图标)

## 快速开始

```bash
cd agent-app
npm install
npm run dev
```

在 `agent-app/.env` 中配置 DeepSeek API Key：

```
VITE_DEEPSEEK_API_KEY=你的API密钥
```

## 功能

- 🎨 3 种视觉风格主题 (现代 / 温暖 / 活泼)
- 🤖 AI 意图分析 — 自然语言描述即可创建智能体
- 💬 实时流式对话
- 👤 真人模式 — 纯文字对话，无动作描写
- 🌓 深色 / 浅色模式
- ⌨️ Ctrl+K 全局命令面板

## 项目结构

```
agent-app/
├── src/
│   ├── app/          # 入口 + 路由
│   ├── features/     # 功能页面
│   ├── shared/       # 共享组件、hooks、类型
│   ├── stores/       # Zustand 状态管理
│   ├── engines/      # Prompt 构建
│   └── components/   # 第三方组件
└── public/
```

## 许可

MIT
