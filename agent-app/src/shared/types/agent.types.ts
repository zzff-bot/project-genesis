import type { VisualStyle } from './visual.types';

// ===== 智能体模式 =====
export type AgentMode = 'professional' | 'character';

// ===== 智能体配置 =====
export interface AgentConfig {
  id: string;
  name: string;
  visualStyle: VisualStyle;
  /** 默认交互模式（Character 陪伴 / Expert 协作） */
  mode: AgentMode;
  /** 真人模式 — 禁止动作描写词汇，更像真人聊天 */
  humanLike: boolean;
  personality: string;
  character: string;
  goal: string;
  systemPrompt: string;
  createdAt: number;
}
