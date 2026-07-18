// ===== 生成唯一 ID =====
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

// 领域类型
export type { AgentMode, AgentConfig } from './agent.types';
export type { ChatMessage, ChatSession, AppState } from './chat.types';
export type { VisualStyle, VisualStyleMeta } from './visual.types';
export { VISUAL_STYLES } from './visual.types';
export type { PersonalityTemplate } from './personality.types';
export { PERSONALITY_TEMPLATES } from './personality.types';
