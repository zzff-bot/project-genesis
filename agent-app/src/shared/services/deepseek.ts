import type { ChatMessage } from '@/shared/types';

const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || '';
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com/v1/chat/completions';
const MODEL = 'deepseek-chat';
const MAX_HISTORY = 20; // 最多携带最近 20 轮对话

interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface DeepSeekResponse {
  id: string;
  choices: Array<{
    message: { role: string; content: string };
    finish_reason: string;
  }>;
  usage: { prompt_tokens: number; completion_tokens: number };
}

/**
 * 调用 DeepSeek API 发送对话
 */
export async function sendMessage(
  systemPrompt: string,
  history: ChatMessage[],
  newMessage: string,
): Promise<string> {
  // 构建消息列表：system prompt + 最近历史 + 新消息
  const messages: DeepSeekMessage[] = [
    { role: 'system', content: systemPrompt },
  ];

  // 只取最近 N 轮历史
  const recentHistory = history.slice(-MAX_HISTORY * 2);
  for (const msg of recentHistory) {
    messages.push({ role: msg.role, content: msg.content });
  }

  // 添加新消息
  messages.push({ role: 'user', content: newMessage });

  const response = await fetch(DEEPSEEK_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepSeek API 错误 (${response.status}): ${errorText}`);
  }

  const data: DeepSeekResponse = await response.json();
  return data.choices[0]?.message?.content || '（智能体没有返回内容）';
}

/**
 * 流式调用 DeepSeek API（用于打字效果）
 */
export async function* sendMessageStream(
  systemPrompt: string,
  history: ChatMessage[],
  newMessage: string,
): AsyncGenerator<string> {
  const messages: DeepSeekMessage[] = [
    { role: 'system', content: systemPrompt },
  ];

  const recentHistory = history.slice(-MAX_HISTORY * 2);
  for (const msg of recentHistory) {
    messages.push({ role: msg.role, content: msg.content });
  }
  messages.push({ role: 'user', content: newMessage });

  const response = await fetch(DEEPSEEK_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 2048,
      stream: true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepSeek API 错误 (${response.status}): ${errorText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('无法读取流响应');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;

      const data = trimmed.slice(6);
      if (data === '[DONE]') return;

      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) yield content;
      } catch {
        // 忽略解析错误
      }
    }
  }
}
