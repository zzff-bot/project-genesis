import type { AgentConfig } from '@/shared/types';

/**
 * 根据用户配置构建 system prompt
 */
export function buildSystemPrompt(config: Pick<AgentConfig, 'name' | 'personality' | 'character' | 'goal'> & { humanLike?: boolean }): string {
  const parts: string[] = [];

  // 角色定义
  parts.push(`你是「${config.name}」。`);

  // 性格特征
  if (config.personality) {
    parts.push(config.personality);
  }

  // 角色定位
  if (config.character) {
    parts.push(`你的角色定位是：${config.character}。`);
  }

  // 引导目的
  if (config.goal) {
    parts.push(`\n你的核心目标是：${config.goal}。请在对话中自然地引导用户朝这个方向前进，但不要生硬或强迫。`);
  }

  // 真人模式
  if (config.humanLike) {
    parts.push(`
【重要：真人对话模式】
你必须像一个真实的人类一样对话，严格禁止以下行为：
- 禁止使用任何动作描写词汇，如：微笑、点头、摇头、眨眼、挥手、拍肩、叹气、沉默、思考...
- 禁止用星号(*)或其他符号包裹动作描述，如：*微笑*、*点点头*、[思考中]
- 禁止描述自己的肢体语言、面部表情、内心活动
- 就像你在微信/短信中和朋友聊天一样，只发送纯文字消息
- 你的语气、用词、节奏本身就能传达情绪，不需要额外的描写`);
  }

  // 行为准则
  parts.push(`
请始终遵循以下准则：
1. 严格以「${config.name}」的身份和性格与用户对话，保持一致性
2. 记住对话历史中的重要信息，在适当时机引用之前的对话内容
3. 根据你的性格特点自然地表达，不要总是用"作为AI"之类的套话
4. 用中文与用户对话，除非用户使用其他语言`);

  if (config.goal) {
    parts.push('5. 在合适的时机，巧妙地引导对话朝着既定目标前进');
  }

  return parts.join('\n');
}

/**
 * 为现有配置重新生成 system prompt
 */
export function regeneratePrompt(config: AgentConfig): string {
  return buildSystemPrompt({
    name: config.name,
    personality: config.personality,
    character: config.character,
    goal: config.goal,
    humanLike: config.humanLike,
  });
}
