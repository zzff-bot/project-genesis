# 双体验模式（Dual Experience）设计规范

## 产品理念

同一套 AI 能力，提供两种完全不同的用户体验。

## Professional Mode

面向开发者与高级用户。 可显示： - Token - Prompt - Memory - Workflow -
Tool Calling - Context - Latency - Cost - Model - Temperature - 推理过程

支持 Developer Mode： 用户自主决定是否开启所有调试信息。

## Character Mode

面向普通用户。 默认隐藏： - Token - Prompt - Memory - Workflow - Tool -
Cost - Latency - 推理过程

界面更像聊天软件，强调沉浸感与拟人化，仅显示聊天内容、头像、状态等。

## UI审美要求

关键词： Calm / Elegant / Human / Invisible Technology

参考： ChatGPT、Claude、Apple、Raycast、Linear、Notion、Vercel。

动画： 全部采用 Spring Motion；
页面切换、消息、侧栏、卡片均保持自然顺滑。

## 开发原则

所有技术信息必须"可配置、可隐藏"，默认关闭。 专业模式开启全部能力；
角色模式保持沉浸感，不暴露底层实现。
