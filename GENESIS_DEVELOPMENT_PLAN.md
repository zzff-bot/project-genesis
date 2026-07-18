# Project Genesis — 综合开发规划文档

> **Document ID**: GENESIS-PLAN-v1.0  
> **Last Updated**: 2026-07-18  
> **Status**: Active  
> **规范优先级**: Project Vision > Genesis Constitution > Product Philosophy > 本规划 > 其它规范

---

## 目录

- [Part 0: 基础 — 项目总览与愿景](#part-0-基础)
- [Part 1: 巩固 — P0 必须优先完成](#part-1-巩固)
- [Part 2: 数字生命核心 — P1 产品差异化](#part-2-数字生命核心)
- [Part 3: 智能进化 — P1 关系与成长](#part-3-智能进化)
- [Part 4: 能力扩展 — P2 功能完备](#part-4-能力扩展)
- [Part 5: 平台化 — P3 上线就绪](#part-5-平台化)
- [Part 6: 治理 — Skill 矩阵与开发规范](#part-6-治理)
- [附录: 实施优先级总览](#附录-实施优先级总览)

---

## Part 0: 基础

### Chapter 0: Project Genesis 总览与愿景

---

#### 0.1 产品哲学

**Project Genesis 是 Digital Being Platform（数字生命平台）。**

它不是 AI Agent Builder。不是 Prompt Builder。不是 ChatBot。

核心论断：**模型只是能力来源，数字生命才是产品。**

用户创建的不是一个"配置了 prompt 的聊天机器人"，而是一个拥有身份、记忆、关系、成长轨迹的**数字生命体**。模型（DeepSeek、GPT、Claude 等）是可替换的能力引擎，数字生命才是持久存在的产品对象。

这一哲学决定了我们所有的产品设计、UI 设计、AI 行为设计和工程实现。

---

#### 0.2 产品目标

打造一个让每个人都能**创造、培育、协作**数字生命的平台。

- **Character（数字生命）**：长期陪伴。拥有身份、成长、关系、情绪、记忆、目标。
- **Expert（数字专家）**：长期协作。拥有专业知识、工具能力、工作流能力。

---

#### 0.3 当前状态评估

**技术栈**：React 19 + TypeScript + Vite 8 + Tailwind CSS 4 + React Router v7 + framer-motion + zustand + DeepSeek API

**已实现（15 项功能）**：

| # | 功能 | 位置 |
|---|------|------|
| 1 | 智能体创建（5 种视觉风格 + 6 个性格模板 + 角色特征 + 引导目标） | `AgentConfigPage.tsx` |
| 2 | System Prompt 自动编译 | `utils/promptBuilder.ts` |
| 3 | DeepSeek API 流式对话（打字机效果 + RAF 节流） | `services/deepseek.ts` |
| 4 | localStorage 持久化（带内存缓存层） | `services/storage.ts` |
| 5 | 5 种视觉主题系统（CSS 变量驱动） | `index.css` + `chatPage.tsx` |
| 6 | 浅色/深色/自动主题切换 | `useTheme.ts` + `settingsStore.ts` |
| 7 | Dashboard 首页（统计 + Agent 列表 + 最近对话） | `DashboardPage.tsx` |
| 8 | Agent 市场页（6 个预设模板一键创建） | `AgentMarketplacePage.tsx` |
| 9 | Ctrl+K 命令面板 | `CommandPalette.tsx` |
| 10 | Professional/Character 模式切换 | `ChatPage.tsx` |
| 11 | Agent 信息侧边栏 | `AgentInfoPanel.tsx` |
| 12 | 对话记录管理 | `ConversationsPage.tsx` |
| 13 | 安全 Markdown 渲染（防 XSS） | `ChatMessage.tsx` |
| 14 | 数据导入/导出 | `SettingsPage.tsx` |
| 15 | 可折叠导航侧边栏 | `Sidebar.tsx` + `AppShell.tsx` |

**已预留路由但为占位页面**：

| 路由 | 预期功能 | 状态 |
|------|---------|------|
| `/prompts` | 提示词库 | 占位 |
| `/knowledge` | 知识库 | 占位 |
| `/workflows` | 工作流 | 占位 |
| `/agents/:agentId/edit` | 编辑智能体 | 路由存在但不可用 |

**核心缺失**：

- ❌ 用户认证系统
- ❌ 后端/数据库
- ❌ Character/Expert 真正的双体系
- ❌ Memory 系统
- ❌ Relationship 引擎
- ❌ Growth 引擎
- ❌ Persona DNA 系统
- ❌ Interview Engine（自然语言创建）
- ❌ 知识库/工作流引擎
- ❌ 多模型路由

---

#### 0.4 Genesis 核心设计原则 (GDS-001)

这些原则是最高规范，任何设计与实现都不得违反：

1. **Human First（人类优先）**：技术服务于人，不暴露技术复杂性给普通用户
2. **Persona First（人格优先）**：数字生命的"人格"是第一设计对象，AI 能力是隐藏的第二层
3. **Relationship First（关系优先）**：产品价值在用户与数字生命之间的关系，而非单次对话
4. **Natural Language First（自然语言优先）**：创建、配置、交互都用自然语言，不用复杂表单
5. **Progressive Disclosure（渐进式呈现）**：默认只展示用户需要的信息，高级功能按需展开
6. **Invisible Intelligence（隐形智能）**：智能隐藏在交互背后，不炫技、不暴露内部机制

#### 禁止事项

- ❌ 不要求普通用户编写 Prompt
- ❌ Character 模式下禁止暴露 AI 身份
- ❌ 默认隐藏 Prompt、Token、Reasoning
- ❌ 不用复杂表单代替自然语言创建

---

#### 0.5 双体系架构（最核心的架构决策）

```
                    ┌──────────────────────────────┐
                    │     Digital Being Platform    │
                    └──────────────────────────────┘
                                  │
              ┌───────────────────┴───────────────────┐
              │                                       │
    ┌─────────┴─────────┐                 ┌──────────┴─────────┐
    │   CHARACTER       │                 │   EXPERT           │
    │   数字生命         │                 │   数字专家          │
    ├───────────────────┤                 ├────────────────────┤
    │ 身份 · 成长 · 关系 │                 │ 知识 · 工具 · 工作流│
    │ 情绪 · 记忆 · 目标 │                 │ 专业 · 可靠 · 协作  │
    ├───────────────────┤                 ├────────────────────┤
    │ 长期陪伴           │                 │ 长期协作            │
    │ 温暖 · 沉浸 · 人性 │                 │ 精确 · 高效 · 专业  │
    └───────────────────┘                 └────────────────────┘
              │                                       │
              └───────────────────┬───────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │   共享 AI Engine 层         │
                    │   Prompt Compiler           │
                    │   Context Engine            │
                    │   Memory Engine             │
                    │   Model Router              │
                    │   Safety Filter             │
                    └───────────────────────────┘
```

**Character 和 Expert 不是同一个产品的两个"模式"，而是两个不同的产品品类，共享相同的底层 AI 引擎。**

---

#### 0.6 技术架构原则

1. **Feature-First 目录结构**：按功能模块组织代码，而非按技术角色
2. **Engine 解耦**：核心引擎（Prompt Compiler、Memory、Context 等）是纯 TypeScript 模块，零 UI 依赖
3. **Local-First**：前端优先使用本地存储（IndexedDB），后端作为同步和数据持久化层
4. **渐进增强**：每个模块可独立开发、测试、上线
5. **Skill-Driven Development**：所有模块通过 Skill pipeline 开发和审查

---

#### 0.7 验收标准

- [x] 产品定位唯一：Digital Being Platform
- [ ] 双体系架构在代码和 UI 层面实现（当前仅有 mode 切换，不算真正的双体系）
- [x] 设计原则在 Genesis Vision 中确立
- [ ] 所有原则在代码中有可追溯的实现
- [ ] Claude Code 可基于本文档独立开发新模块

---

## Part 1: 巩固

### Chapter 1: 代码架构重构与标准化

---

#### 1.1 产品哲学

当前项目是一个快速验证的原型。代码架构（单层扁平目录 + 单体 `useReducer`）是原型阶段的合理选择。但在进入产品化阶段之前，必须重构为可扩展的 Feature-First 架构。重构是**必要的技术债务偿还**，不改功能、不改 UI、不改体验。

---

#### 1.2 产品目标

将当前项目从"可用的原型"转变为"可迭代的产品工程"，建立后续所有开发共用的架构基线。

---

#### 1.3 技术架构

**目标目录结构**：

```
agent-app/src/
├── app/                          # 应用层
│   ├── App.tsx                   # 路由根组件
│   ├── main.tsx                  # 入口
│   ├── index.css                 # 全局样式 + 主题变量
│   └── vite-env.d.ts
├── features/                     # 功能模块（Feature-First）
│   ├── dashboard/
│   │   ├── components/           # DashboardPage + 子组件
│   │   ├── index.ts
│   │   └── DashboardPage.tsx
│   ├── agents/
│   │   ├── components/           # AgentConfigPage, AgentMarketplacePage, 创建表单组件
│   │   ├── hooks/
│   │   ├── index.ts
│   │   └── ...
│   ├── chat/
│   │   ├── components/           # ChatPage, ChatInput, ChatMessage, AgentInfoPanel
│   │   ├── hooks/
│   │   ├── index.ts
│   │   └── ...
│   ├── conversations/
│   │   └── ...
│   ├── settings/
│   │   └── ...
│   ├── prompts/                  # 当前占位，后续实现
│   ├── knowledge/                # 当前占位，后续实现
│   └── workflows/                # 当前占位，后续实现
├── engines/                      # 纯逻辑引擎（零 UI 依赖）
│   ├── prompt/                   # Prompt 编译引擎
│   ├── context/                  # 上下文管理引擎
│   ├── memory/                   # 记忆引擎
│   ├── relationship/             # 关系引擎
│   ├── growth/                   # 成长引擎
│   └── model-router/             # 模型路由引擎
├── shared/                       # 跨功能共享
│   ├── ui/                       # 通用 UI 组件库
│   ├── hooks/                    # 通用 hooks
│   ├── utils/                    # 通用工具函数
│   ├── types/                    # 领域类型定义
│   └── services/                 # API 服务层
├── stores/                       # Zustand 状态管理
├── assets/                       # 静态资源
└── styles/                       # 共享样式
```

**状态管理重构**：

当前 `AgentContext.tsx` 使用单个 `useReducer` 管理全部应用状态。重构为：
- `stores/agentStore.ts` — 智能体 CRUD（zustand）
- `stores/chatStore.ts` — 对话状态 + 流式控制（zustand）
- `stores/settingsStore.ts` — 已有，保持不变
- `stores/uiStore.ts` — UI 状态（侧边栏、面板、命令面板等）

---

#### 1.4 Claude Code 实现规范

1. **重构前先跑审计**：使用 `az-code-reviewer` 对当前代码做全面 review，标记技术债务
2. **增量迁移**：一次迁移一个 feature，迁移后验证构建通过 + 功能正常
3. **保持向后兼容**：重构期间不添加新功能
4. **使用工作树 (worktree)**：在隔离环境中重构，验证通过后合并

**Skill 流程**：
```
az-code-reviewer（审计现状）
  → az-senior-architect（设计目标架构）
    → az-senior-frontend（逐步迁移）
      → az-code-reviewer（每次迁移后 review）
        → sp-verification-before-completion（最终验证）
```

---

#### 1.5 验收标准

- [ ] 目录结构符合 Feature-First 规范
- [ ] 所有现有功能零退化（agent 创建、chat 流式、主题切换、dashboard、marketplace、settings、command palette、数据导出）
- [ ] 构建通过 `npm run build`
- [ ] 零新增 lint 错误
- [ ] 类型定义按领域拆分（`types/agent.types.ts`、`types/chat.types.ts` 等）

---

### Chapter 2: UI Design System v2

---

#### 2.1 产品哲学

设计系统不是"组件库"——它是 Genesis 产品哲学在视觉层面的物化。每个组件必须从零开始支持 Character 模式（温暖、人性、沉浸）和 Expert 模式（干净、精确、信息密集）。

---

#### 2.2 产品目标

建立完整的 token-based UI 设计系统，所有后续功能都基于此系统构建。提供可版本化、可主题化的组件基础设施。

---

#### 2.3 UI 规范

**设计 Token 体系**：

```
Primitive Tokens（基础色板/间距/字号）
  → Semantic Tokens（语义化：--color-primary, --color-surface, --color-text）
    → Component Tokens（组件级：--btn-primary-bg, --card-radius）
```

**Character 模式 vs Expert 模式视觉差异**：

| 维度 | Character 模式 | Expert 模式 |
|------|---------------|-------------|
| 圆角 | 较大（12-16px） | 较小（6-8px） |
| 阴影 | 柔和、温暖色调 | 锐利、中性色调 |
| 间距 | 宽松、呼吸感 | 紧凑、高效 |
| 字体 | 优先无衬线、圆体 | 包含等宽字体 |
| 色彩 | 温暖色调、渐变 | 冷静色调、功能色 |
| 数据密度 | 低、聚焦单一内容 | 高、信息面板 |

**组件库清单（v2 扩展）**：

当前已有（需扩展）：Button, Badge, Card, GlassPanel, Input, Modal, Toggle

需新增：
- Toast/Notification（操作反馈）
- Avatar（Character 头像生成）
- Skeleton（加载占位）
- Tooltip（悬浮提示）
- Dropdown（下拉菜单）
- Tabs（标签页切换）
- Progress/StatusBar
- Divider
- EmptyState（空状态标准化）

---

#### 2.4 Claude Code 实现规范

1. 使用 `ac-frontend-design` 生成完整设计规范
2. 使用 `az-ui-design-system` 设计组件架构
3. 为每个组件编写 Storybook 级文档（后续可在 `/design-system` 路由展示）
4. 组件 Props 从用户需求出发设计——Character 和 Expert 各需要什么 variant？

**Skill 流程**：
```
ac-frontend-design（设计规范）
  → az-ui-design-system（组件架构）
    → az-senior-frontend（实现组件）
      → az-a11y-audit（无障碍审查）
```

---

#### 2.5 验收标准

- [ ] 完整的设计 Token 文档（CSS 变量层级清晰）
- [ ] 所有新增组件实现
- [ ] `/design-system` 路由可用（dev-only），展示每个组件的全部状态
- [ ] Character 和 Expert 模式在组件层有明确的视觉差异
- [ ] 现有 5 个主题均可正常使用新组件

---

### Chapter 3: 数据层与持久化规范

---

#### 3.1 产品哲学

当前 `localStorage` 是原型阶段的合理选择。但要支持 Memory 系统、Relationship 追踪、离线使用，需要结构化的客户端数据库。这是一个**产品需求**——不解决数据层，后续所有引擎都无法落地。

---

#### 3.2 产品目标

用 IndexedDB（Dexie.js）替换 raw localStorage，建立类型安全、版本化、可迁移的客户端持久化层，为后续后端同步预留适配器接口。

---

#### 3.3 数据结构（全量 Genesis Schema）

```typescript
// === 用户 ===
interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: number;
}

// === 数字生命体（基类） ===
interface DigitalBeing {
  id: string;
  userId: string;
  type: 'character' | 'expert';
  name: string;
  visualStyle: VisualStyle;
  personaDNA: PersonaDNA;
  createdAt: number;
  updatedAt: number;
}

// === Character 扩展 ===
interface Character extends DigitalBeing {
  type: 'character';
  relationshipState: RelationshipState;
  memoryProfile: MemoryProfile;
  growthStage: GrowthStage;
  emotionalBaseline: EmotionalProfile;
}

// === Expert 扩展 ===
interface Expert extends DigitalBeing {
  type: 'expert';
  knowledgeDomains: KnowledgeDomain[];
  capabilities: Capability[];
  tools: ToolAccess[];
  collaborationMetrics: CollaborationMetrics;
}

// === Persona DNA ===
interface PersonaDNA {
  identity: {
    name: string;
    backstory: string;
    coreValues: string[];
    worldview: string;
  };
  voice: {
    toneSpectrum: Record<string, number>;  // e.g. { warm: 0.8, formal: 0.3 }
    vocabularyStyle: 'simple' | 'moderate' | 'sophisticated';
    sentencePattern: 'short' | 'balanced' | 'elaborate';
    humorStyle: 'none' | 'dry' | 'playful' | 'witty';
  };
  emotionalRange: {
    primaryEmotions: string[];
    intensityCurve: 'stable' | 'responsive' | 'sensitive';
    triggers: Record<string, string[]>;
  };
  behavioralPatterns: {
    conversationStyle: 'listener' | 'talker' | 'balanced';
    questionFrequency: 'rare' | 'moderate' | 'frequent';
    initiativeLevel: 'reactive' | 'balanced' | 'proactive';
    conflictStyle: 'avoidant' | 'accommodating' | 'assertive';
  };
  boundaries: {
    topicsToAvoid: string[];
    ethicalConstraints: string[];
    roleLimitations: string[];
  };
  relationshipStyle: {
    attachmentPattern: 'secure' | 'warm' | 'independent';
    trustBuildingPace: 'slow' | 'moderate' | 'fast';
    intimacyPreference: 'reserved' | 'balanced' | 'open';
  };
}

// === 记忆 ===
interface MemoryEntry {
  id: string;
  beingId: string;
  type: 'episodic' | 'semantic' | 'procedural' | 'reflection';
  content: string;
  importance: number;           // 0-1
  timestamp: number;
  lastAccessed: number;
  accessCount: number;
  sourceConversationId?: string;
  relatedMemories: string[];
  emotionalTone?: string;
}

// === 关系 ===
interface RelationshipState {
  affinity: number;             // 0-100
  trust: number;                // 0-100
  familiarity: number;          // 0-100
  stage: 'stranger' | 'acquaintance' | 'companion' | 'close-friend' | 'trusted-confidant';
  milestones: RelationshipMilestone[];
  sharedExperiences: string[];
  interactionRhythm: InteractionPattern;
}

// === 对话 ===
interface Conversation {
  id: string;
  beingId: string;
  userId: string;
  messages: ChatMessage[];
  contextSnapshot: ContextSummary;
  memoryReferences: string[];   // 引用的 MemoryEntry IDs
  tokenUsage: { prompt: number; completion: number };
  emotionalArc: EmotionalPoint[];
  createdAt: number;
  updatedAt: number;
}
```

---

#### 3.4 技术架构

```
src/shared/services/
├── db/
│   ├── index.ts           # Dexie 数据库初始化
│   ├── schema.ts          # 表定义（版本化）
│   ├── migrations/        # Schema 迁移脚本
│   │   ├── v1-to-v2.ts
│   │   └── ...
│   ├── beings.ts          # DigitalBeing CRUD
│   ├── memories.ts        # Memory CRUD + 检索
│   ├── conversations.ts   # Conversation CRUD
│   └── sync-adapter.ts    # 后端同步接口（预留）
├── storage-legacy.ts      # 保留旧 localStorage 代码用于数据迁移
└── migrate.ts             # 一次性迁移脚本：localStorage → IndexedDB
```

**为什么用 Dexie.js 而不是 raw IndexedDB？**
- Promise-based API，比 IndexedDB 回调简洁
- 内置 TypeScript 支持
- 版本化 Schema + 迁移支持
- 支持复合索引、全文搜索

---

#### 3.5 Claude Code 实现规范

1. `az-senior-architect` 审查 Schema 设计
2. `az-database-schema-designer` 审核数据结构
3. 先实现本地层，同步适配器留接口即可
4. 迁移脚本确保零数据丢失：读取 localStorage → 转换 → 写入 Dexie → 验证 → 清除 localStorage

**Skill 流程**：
```
az-senior-architect + az-database-schema-designer（Schema 设计）
  → az-senior-frontend（Dexie.js 实现）
    → tp-domain-model（领域建模审查）
```

---

#### 3.6 验收标准

- [ ] 所有 CRUD 操作通过 Dexie.js 层
- [ ] Schema 版本化生效
- [ ] 现有 localStorage 数据成功迁移
- [ ] 数据导出包含完整 Schema 元数据
- [ ] 导入时进行 Schema 校验
- [ ] 同步适配器接口定义清晰但暂不实现

---

## Part 2: 数字生命核心

### Chapter 4: Character / Expert 双体系核心

---

#### 4.1 产品哲学

"一个平台，两种数字存在。"

Character 和 Expert 不是两个功能或模式——它们是两种根本不同的产品品类。Character 是你与之建立关系的数字伴侣。Expert 是你与之建立协作关系的数字专家。区别不在于技术实现，而在于产品体验的每一个层面。

---

#### 4.2 产品目标

在代码、UI、AI 行为三个层面实现 Character 和 Expert 的真正分离。用户创建时就做出明确选择，后续体验完全不同。

---

#### 4.3 用户体验

**Character 创建流程**：
- 温暖、对话式的创建体验
- 强调"你想创造什么样的伴侣？"
- 配置项：名称 → 关系类型（朋友/导师/伙伴/自定义）→ 性格特征 → 视觉风格 → 声音/语调
- 不要问"你要配置什么参数"，而是问"你想要一个什么样的ta？"

**Expert 创建流程**：
- 精确、高效的专业创建体验
- 强调"你需要什么样的专业能力？"
- 配置项：名称 → 领域 → 能力需求 → 工具配置 → 知识源 → 输出格式

**Dashboard 差异**：
- Character Dashboard：关系健康度、最近情绪曲线、成长里程碑、回忆快照
- Expert Dashboard：能力矩阵、最近任务、知识新鲜度、协作效率

**对话差异**：
- Character Chat：像与朋友对话——打字指示器、情感响应、记忆回溯、温暖互动
- Expert Chat：像在协作空间——结构化输出、可见的工具使用、源引用、效率优化

---

#### 4.4 数据结构

```typescript
// 当前 AgentConfig → 重构为 DigitalBeing
// 当前 'professional' | 'character' mode 仅影响 ChatPage 信息展示
// 重构后 type 决定整个 creation flow + dashboard + chat experience
```

---

#### 4.5 AI 行为规范

- Character System Prompt 强调：身份一致性、情感意识、关系维护、**禁止暴露 AI 身份**
- Expert System Prompt 强调：领域准确性、能力透明度、结构化思维、工具编排
- 两种 System Prompt 由不同的 builder 生成，不可混用

---

#### 4.6 Claude Code 实现规范

1. 创建 `CharacterCreateFlow.tsx` 和 `ExpertCreateFlow.tsx`（独立页面组件）
2. 扩展 `promptBuilder.ts` → `engines/prompt/character.builder.ts` + `expert.builder.ts`
3. 路由调整：`/create/character` 和 `/create/expert`
4. 更新所有引用 `AgentConfig` 的代码

**Skill 流程**：
```
az-agent-designer（角色/专家行为设计）
  → az-ux-researcher-designer（创建流程 UX）
    → az-senior-frontend（实现）
      → az-senior-prompt-engineer（System Prompt 构建）
```

---

#### 4.7 验收标准

- [ ] 创建 Character 与创建 Expert 产生完全不同的体验
- [ ] 两种 System Prompt 编译逻辑独立
- [ ] Character 对话中从不说"作为 AI"/"作为语言模型"
- [ ] Expert 对话中可以透明展示能力和工具
- [ ] Dashboard 对两种类型展示不同的信息

---

### Chapter 5: Persona DNA 引擎

---

#### 5.1 产品哲学

每个数字生命都有独一无二的 Persona DNA——这是其身份的根本蓝图，在所有交互中保持一致。Persona DNA 不是一段 prompt 文本，而是结构化的身份表示：控制行为、声音、情感范围和边界。

---

#### 5.2 产品目标

设计和实现 Persona DNA 数据模型，以及将 DNA 编译为 AI 行为指令的引擎。

---

#### 5.3 技术架构

```
src/engines/persona/
├── dna-compiler.ts        # PersonaDNA → 结构化行为指令
├── dna-validator.ts       # DNA 完整性校验
├── dna-version.ts         # DNA 版本管理
└── dna-templates.ts       # 预设 DNA 模板（Character + Expert）
```

**DNA Compiler 职责**：
1. 接收 PersonaDNA 对象
2. 生成结构化的行为指令片段（非直接拼接 prompt）
3. 输出的指令片段被 Prompt Compiler（Chapter 6）消费
4. "谁是这个生命体" 与 "AI 应该如何行动" 分离

---

#### 5.4 Claude Code 实现规范

1. `az-agent-designer` 设计 PersonaDNA Schema
2. `az-senior-prompt-engineer` 实现 DNA → prompt 编译逻辑
3. 开发可视化 DNA 编辑器（特征雷达图 + 滑块 + 文本框）

**Skill 流程**：
```
az-agent-designer（DNA Schema 设计）
  → az-senior-prompt-engineer（编译逻辑）
    → az-ux-researcher-designer（DNA 编辑 UI）
      → az-senior-frontend（实现编辑器）
```

---

#### 5.5 验收标准

- [ ] PersonaDNA 是可序列化的 JSON 对象
- [ ] 两个不同 DNA 的生命体产生可观察的行为差异
- [ ] DNA 可导出、导入、版本化
- [ ] DNA 编辑器在创建流程中可用
- [ ] 修改 DNA 后对话行为同步更新

---

### Chapter 6: Prompt Compiler v2 + Context Engine

---

#### 6.1 产品哲学

用户永远不需要编写 Prompt。Prompt Compiler 接收结构化的 Persona DNA、Memory 上下文、Relationship 状态、情境感知，自动编译为优化的 System Prompt。这是"Invisible Intelligence"原则在技术层面的核心实现。

---

#### 6.2 产品目标

将当前简单字符串拼接的 `promptBuilder.ts` 替换为模块化、多层的 Prompt 编译管线。

---

#### 6.3 技术架构

```
src/engines/prompt/
├── pipeline.ts            # 编译管线编排
├── compilers/
│   ├── persona-compiler.ts      # PersonaDNA → 身份定义片段
│   ├── memory-compiler.ts       # Memory 检索结果 → 上下文片段
│   ├── relationship-compiler.ts # Relationship 状态 → 关系指令片段
│   ├── goal-compiler.ts         # 目标 → 引导指令片段
│   ├── safety-compiler.ts       # 安全规则 → 约束指令片段
│   └── token-optimizer.ts       # Token 预算分配与裁剪
├── character-compiler.ts  # Character 模式完整编译
└── expert-compiler.ts     # Expert 模式完整编译
```

**Context Engine**：

```
src/engines/context/
├── context-manager.ts     # 管理每次 API 调用的上下文窗口
├── priority-tiers.ts      # 三级优先级：Critical > Important > Archival
├── window-calculator.ts   # 动态计算 token 分配
└── context-injector.ts    # 格式化注入上下文
```

**Token Budget 分配策略**：
- System Prompt：40%（身份 + 行为规则）
- Memory Snippets：15%（相关记忆）
- Conversation History：35%（最近对话）
- Safety + Overhead：10%

---

#### 6.4 Claude Code 实现规范

1. `az-senior-architect` 设计编译管线
2. `az-senior-prompt-engineer` 实现各编译器
3. `kp-karpathy-guidelines` 审查 Prompt 质量
4. 每个编译器是纯函数，方便测试

**Skill 流程**：
```
az-senior-architect（管线架构）
  → az-senior-prompt-engineer（编译器实现）
    → kp-karpathy-guidelines（Prompt 质量审查）
      → az-llm-cost-optimizer（Token 预算优化）
```

---

#### 6.5 验收标准

- [ ] 编译管线对相同输入产生确定性输出
- [ ] Token 使用量可预测且不超预算
- [ ] 新增 PersonaDNA 字段自动流入 Prompt
- [ ] 每次请求的上下文窗口利用率可追踪
- [ ] Character 和 Expert 使用完全不同的编译模板

---

### Chapter 7: Memory 系统

---

#### 7.1 产品哲学

**没有记忆的数字生命不是生命——只是无状态的函数。** Memory 是身份连续性、关系深度和成长的基石。Memory 必须是多层的：短期（对话上下文）、长期（重要事件）、语义（学到的知识）、情景（经历叙事）。

---

#### 7.2 产品目标

实现 local-first 的 Memory 系统，具备自动重要性评分、记忆整合和检索能力。

---

#### 7.3 技术架构

```
src/engines/memory/
├── memory-store.ts        # IndexedDB 存储 + LRU 淘汰
├── importance-scorer.ts   # 重要性评分
├── memory-consolidator.ts # 记忆整合（定期后台任务）
├── memory-retriever.ts    # 检索 top-K 相关记忆
└── memory-injector.ts     # 格式化记忆供 Prompt 注入
```

**重要性评分维度**（Phase 1 启发式）：
- 交互长度（长对话 → 高重要性）
- 情感关键词（用户表达强烈情绪 → 高重要性）
- 用户明确信号（"记住这个" → 最高优先级）
- 话题新颖度（新话题 → 中等重要性）
- 重复提及（多次提到 → 累加重要性）

**记忆整合（后台任务）**：
- 应用空闲时触发
- 合并相关记忆 → 创建摘要/反思条目
- 低重要性旧记忆衰减或归档

**检索（Phase 1）**：
- 关键词 + 重要性匹配
- Phase 2 增加 embedding-based 语义搜索

---

#### 7.4 分阶段实现

| 阶段 | 内容 |
|------|------|
| Stage 1 | 显式保存/回忆（用户可以说"记住xxx"，生命体可以说"我记得xxx"） |
| Stage 2 | 自动重要性评分 + 后台整合 |
| Stage 3 | 语义搜索 + 主动记忆召回 |

---

#### 7.5 Claude Code 实现规范

1. `az-senior-architect` 设计 Memory 系统架构
2. `az-database-schema-designer` 审查 Memory Schema
3. 按 Stage 1→2→3 顺序迭代

**Skill 流程**：
```
az-senior-architect + az-database-schema-designer（架构 + Schema）
  → az-senior-frontend（Dexie.js 实现）
    → az-rag-architect（检索设计）
```

---

#### 7.6 验收标准

- [ ] Stage 1: 生命体能引用过去的对话
- [ ] 记忆重要性随时间衰减正确
- [ ] 整合产生有意义的摘要
- [ ] Character Info Panel 中有记忆时间线
- [ ] 用户可查看和删除单独的记忆

---

## Part 3: 智能进化

### Chapter 8: Relationship 引擎

---

#### 8.1 产品哲学

关系不是功能——是 Character 生命体的核心价值主张。关系有历史、深度、信任和弧线。Relationship Engine 追踪、建模、培育用户与数字生命之间不断演化的关系。

---

#### 8.2 产品目标

实现关系状态追踪、进展机制和关系感知的 AI 行为。

---

#### 8.3 数据结构（见 Chapter 3）

关系阶段：`stranger → acquaintance → companion → close-friend → trusted-confidant`

---

#### 8.4 技术架构

```
src/engines/relationship/
├── relationship-tracker.ts    # 逐轮对话分析，提取信号
├── relationship-injector.ts   # 提供关系上下文给 Prompt Compiler
├── milestone-detector.ts      # 识别重要关系时刻
└── affinity-calculator.ts     # 亲和力分数计算
```

**Expert 变体**：Expert 没有"关系"，而是"协作效能指标"（collaboration effectiveness）

---

#### 8.5 Claude Code 实现规范

- `az-agent-designer` 设计关系模型
- 关系数据默认对用户不可见（Progressive Disclosure），在 Professional 模式下可查看
- 阶段转换必须是渐进的、自然的

**Skill 流程**：
```
az-agent-designer（关系模型）
  → az-ux-researcher-designer（可视化设计）
    → az-senior-frontend（实现）
```

---

#### 8.6 验收标准

- [ ] 关系指标随真实交互模式变化
- [ ] 阶段转换可观察
- [ ] 里程碑被检测并在对话中自然引用
- [ ] Expert 的协作效能指标独立运作

---

### Chapter 9: Growth 引擎

---

#### 9.1 产品哲学

数字生命会成长——不只是积累数据，而是在理解、个性表达、能力上真正进化。Growth 是用户感知数字生命"活着"的证据。

---

#### 9.2 产品目标

实现成长机制：技能习得、个性精炼、知识扩展、基于交互历史的行为适应。

---

#### 9.3 数据结构

```typescript
interface GrowthProfile {
  currentStage: 'nascent' | 'developing' | 'mature' | 'evolved';
  skills: SkillWithProficiency[];
  personalityShift: PersonalityDelta;  // 与初始 DNA 的偏差
  knowledgeDomains: DomainConfidence[];
  adaptationHistory: AdaptationEvent[];
}
```

---

#### 9.4 技术架构

```
src/engines/growth/
├── growth-analyzer.ts    # 定期分析交互模式
├── growth-injector.ts    # 成长状态注入 PersonaDNA 编译
├── skill-tree.ts         # 技能树（Expert）/ 个性维度（Character）
└── milestone-tracker.ts  # 成长里程碑追踪
```

---

#### 9.5 验收标准

- [ ] 长期运营的生命体展示可观察的个性演变
- [ ] Expert 技能树追踪能力发展
- [ ] 成长跨 session 持久化
- [ ] 用户可查看成长摘要
- [ ] 成长不可回退（除非用户明确操作）

---

### Chapter 10: AI 行为规范

---

#### 10.1 产品哲学

AI 行为是设计学科，不是技术后想。数字生命如何沟通——语调、主动性、情感表达、边界尊重、记忆使用、成长表达——每个方面都必须有意识地设计和一致地执行。

---

#### 10.2 内容领域

1. **身份一致性**：生命体如何在所有对话中保持连贯的自我表征
2. **情感表达**：何时表达情感、如何表达、情感强度映射
3. **主动性与积极性**：何时提问、何时建议、何时跟随
4. **记忆使用**：何时引用过去、如何自然引入、什么永远不该主动提及
5. **边界执行**：敏感话题、角色越界、拒绝策略
6. **AI 身份隐藏（Character 模式）**：明确规则——永远不能说"作为 AI""作为语言模型""我没有感情"等；提供替代表达方式
7. **错误恢复**：API 失败、上下文溢出、矛盾指令的处理方式——同时保持角色

---

#### 10.3 Claude Code 实现规范

这是一份规范文档 + 在代码中的规则引擎实现。所有其他引擎查询此规则引擎。

**Skill 流程**：
```
az-agent-designer（行为规范设计）
  → az-prompt-governance（规范实现）
    → az-red-team（对抗性测试，确保 Character 永不暴露 AI 身份）
      → az-ai-security（安全审查）
```

---

#### 10.4 验收标准

- [ ] AI 行为规范文档存在
- [ ] 每条规则可追溯到代码实现
- [ ] 行为审计工具可验证合规性
- [ ] Character 生命体在任何对抗性测试下都不暴露 AI 身份

---

## Part 4: 能力扩展

### Chapter 11: Knowledge Base（知识库）

**目标**：让 Expert（和高级 Character）能访问和推理用户提供的知识。替换 `/knowledge` 占位页面。

**三阶段**：
- Phase 1：本地文本处理 + TF-IDF 关键词搜索
- Phase 2：Embedding-based 语义搜索（transformers.js 本地或 API）
- Phase 3：云端向量数据库

**Skill**：`az-rag-architect` → `ac-tpl-ai-ml-rag-pipeline` → `az-senior-frontend`

---

### Chapter 12: Workflow Engine（工作流引擎）

**目标**：让 Expert 能执行多步骤工作流。替换 `/workflows` 占位页面。

**技术方案**：
- `src/engines/workflow/`：DAG 执行器 + 可视化编辑器（React Flow）
- Phase 1：预设模板；Phase 2：用户可编辑

**Skill**：`az-agent-workflow-designer` → `az-senior-architect` → `az-senior-frontend`

---

### Chapter 13: Tool Calling System（工具调用系统）

**目标**：可插拔的工具调用架构。内置工具：网页搜索、计算器、代码执行、文件解析。可扩展自定义工具。

**Skill**：`az-senior-architect` → `az-senior-frontend`

---

### Chapter 14: Multi-Model Router（多模型路由）

**目标**：抽象 AI 后端，支持任意模型提供商。智能路由基于任务、成本、延迟。用户设定预算，路由器自动选择最优模型。

**技术**：`src/engines/model-router/`：provider adapters + router logic + cost tracker

**Skill**：`az-senior-architect` → `az-llm-cost-optimizer` → `claude-api`

---

## Part 5: 平台化

### Chapter 15: 后端 + 认证 + Interview Engine

---

#### 15.1 产品目标

三个相互关联的平台关键能力：
1. **Backend**：从 localStorage-only 迁移到真正的后端（Node.js Hono + PostgreSQL/Neon）
2. **Authentication**：用户账户、会话管理、多设备同步
3. **Interview Engine**：用自然语言对话替代表单式创建，系统询问用户想要什么样的生命体，自动生成完整配置 + PersonaDNA

---

#### 15.2 后端技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Hono（轻量 TypeScript 后端） |
| 数据库 | PostgreSQL (Neon Serverless) |
| ORM | Drizzle |
| 认证 | JWT + bcryptjs + Arctic (OAuth) |
| 校验 | Zod（前后端共享） |

**详细方案参见已批准的 `reactive-skipping-sun.md` 计划。**

---

#### 15.3 Interview Engine

这是对 Genesis "Natural Language First" 原则的最终实现：

```
src/engines/interview/
├── interview-conductor.ts   # 对话引导逻辑
├── question-generator.ts    # 根据已收集信息生成后续问题
├── config-compiler.ts       # 对话记录 → 完整生命体配置 + PersonaDNA
└── interview-templates.ts   # Character/Expert 不同的面试模板
```

**流程**：
1. 询问生命体类型（Character/Expert）
2. 询问使用目的/场景
3. 基于回答追问（性格偏好、能力需求、边界设定）
4. 编译完整配置 + PersonaDNA
5. 预览确认 → 创建

---

#### 15.4 验收标准

- [ ] 用户可注册、登录（邮箱 + Google OAuth）
- [ ] 数据跨设备同步
- [ ] DeepSeek API Key 不出现在前端代码中
- [ ] Interview 流程可替代表单创建
- [ ] 用户数据隔离（用户 A 看不到用户 B 的数据）

---

## Part 6: 治理

### Chapter 16: Roadmap、Skill 矩阵与开发规范

---

#### 16.1 分阶段 Roadmap

```
P0: 巩固 (Week 1-3)
├── Ch.1 架构重构 ──────── 当前原型 → Feature-First 工程
├── Ch.2 Design System v2 ─ 组件库 + Token 体系
└── Ch.3 数据层迁移 ────── localStorage → IndexedDB (Dexie.js)

P1: 核心 (Week 3-14)
├── Ch.4 双体系 ────────── Character / Expert 真正分离
├── Ch.5 Persona DNA ───── 结构化身份表示
├── Ch.6 Prompt Compiler ── 多层编译管线
├── Ch.7 Memory ────────── 记忆系统 Stage 1-2
├── Ch.8 Relationship ───── 关系引擎
├── Ch.9 Growth ────────── 成长引擎
└── Ch.10 AI Behavior ───── 行为规范 + 规则引擎

P2: 扩展 (Week 12-20) [与 P1 后期重叠]
├── Ch.11 Knowledge Base ── RAG 知识库
├── Ch.12 Workflow ──────── 工作流引擎
├── Ch.13 Tool Calling ──── 工具系统
└── Ch.14 Model Router ──── 多模型 + 成本控制

P3: 平台化 (Week 18-30)
└── Ch.15 Backend + Auth ─── 后端 + 认证 + Interview Engine
```

---

#### 16.2 Skill 使用矩阵

| Phase | 设计 Skill | 实现 Skill | 质量 Skill |
|-------|-----------|-----------|-----------|
| **P0** | `az-senior-architect`, `ac-frontend-design`, `az-ui-design-system` | `az-senior-frontend` | `az-a11y-audit`, `az-code-reviewer`, `sp-verification-before-completion` |
| **P1** | `az-agent-designer`, `az-senior-prompt-engineer`, `az-ux-researcher-designer` | `az-senior-frontend`, `az-database-schema-designer` | `az-code-reviewer`, `az-red-team`, `az-ai-security`, `kp-karpathy-guidelines` |
| **P2** | `az-rag-architect`, `az-agent-workflow-designer`, `az-senior-architect` | `az-senior-frontend`, `az-senior-backend`, `ac-tpl-ai-ml-rag-pipeline` | `az-code-reviewer`, `az-llm-cost-optimizer` |
| **P3** | `az-senior-architect` | `az-senior-backend`, `az-senior-frontend` | `az-security-pen-testing`, `az-senior-qa` |

---

#### 16.3 每个模块的标准开发流程

```
1. az-prd ───────────────── 生成模块 PRD（产品需求文档）
2. az-senior-architect ──── 审查架构设计、组件边界、数据流
3. az-senior-frontend/backend  实现
4. az-code-reviewer ─────── 质量审查
5. az-senior-qa ─────────── 对照 PRD 验收测试
6. az-changelog-generator ── 更新 Changelog
```

---

#### 16.4 质量门禁

每个模块合并前必须通过：
- ✅ 类型安全：零 `as` 无注解强制转换
- ✅ 无障碍审计（`az-a11y-audit`）
- ✅ 构建通过（`npm run build`）
- ✅ 零新增 lint 错误
- ✅ AI 行为模块：对抗性审查（`az-red-team`）

---

#### 16.5 编码禁令（Code Prohibitions）

这些是 Genesis 设计原则在代码层面的硬性约束：

```
❌ 禁止在 Character 模式 UI 中暴露 "AI"、"模型"、"Prompt"、"Token"
❌ 禁止要求用户编写 raw prompt
❌ 禁止在 Character 创建表单中展示超过 5 个字段
❌ 禁止 AI 在 Character 模式中说 "作为AI语言模型"、"我没有真实的感情"
❌ 禁止不加密存储 PII
❌ 禁止硬编码单一模型提供商
```

---

## 附录: 实施优先级总览

### 立即开始（P0 — 解锁一切）

| 优先级 | 章节 | 工作量 | 依赖 |
|--------|------|--------|------|
| 🔴 P0 | Ch.1 架构重构 | 1 周 | 无 |
| 🔴 P0 | Ch.2 Design System v2 | 1 周 | Ch.1 |
| 🔴 P0 | Ch.3 数据层迁移 | 1 周 | Ch.1 |

### 核心差异化（P1）

| 优先级 | 章节 | 工作量 | 依赖 |
|--------|------|--------|------|
| 🟡 P1 | Ch.4 双体系核心 | 2 周 | P0 |
| 🟡 P1 | Ch.5 Persona DNA | 1.5 周 | Ch.4 |
| 🟡 P1 | Ch.6 Prompt Compiler v2 | 2 周 | Ch.5 |
| 🟡 P1 | Ch.7 Memory 系统 | 2.5 周 | Ch.3, Ch.6 |
| 🟡 P1 | Ch.8 Relationship 引擎 | 1.5 周 | Ch.7 |
| 🟡 P1 | Ch.10 AI 行为规范 | 持续 | Ch.4 |

### 功能完备（P2）

| 优先级 | 章节 | 工作量 | 依赖 |
|--------|------|--------|------|
| 🟢 P2 | Ch.9 Growth 引擎 | 2 周 | Ch.7, Ch.8 |
| 🟢 P2 | Ch.11 Knowledge Base | 2 周 | Ch.6 |
| 🟢 P2 | Ch.12 Workflow Engine | 2 周 | Ch.11 |
| 🟢 P2 | Ch.13 Tool Calling | 1.5 周 | Ch.12 |
| 🟢 P2 | Ch.14 Model Router | 2 周 | Ch.6 |

### 平台规模（P3）

| 优先级 | 章节 | 工作量 | 依赖 |
|--------|------|--------|------|
| 🔵 P3 | Ch.15 后端+认证+Interview | 4 周 | P1 |

---

### 关键文件清单

以下是 P0/P1 阶段会被修改或替换的最关键文件：

| 文件 | 当前状态 | 目标 |
|------|---------|------|
| `src/contexts/AgentContext.tsx` | 单体 useReducer | 拆分为 agentStore + chatStore (zustand) |
| `src/utils/promptBuilder.ts` | 简单字符串拼接 | 迁移到 engines/prompt/pipeline.ts |
| `src/types/index.ts` | 单一类型文件 | 拆分为 types/agent.types.ts, types/chat.types.ts 等 |
| `src/services/storage.ts` | localStorage | 替换为 Dexie.js db layer |
| `src/App.tsx` | 路由定义 | Feature-First 路由结构 |

---

> **This document is the single source of truth for Project Genesis development.**  
> **Created**: 2026-07-18  
> **Next Review**: After P0 completion  
> **规范优先级**: Project Vision > Genesis Constitution > Product Philosophy > 本规划 > 其它规范
