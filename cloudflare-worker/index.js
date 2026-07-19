/**
 * Cloudflare Worker — DeepSeek API 代理
 *
 * 将前端请求转发到 DeepSeek API，API Key 仅存储在 Worker 环境变量中，
 * 不会暴露给浏览器端。
 *
 * 部署后请在 Cloudflare Dashboard → Workers → Settings → Variables
 * 添加加密环境变量：DEEPSEEK_API_KEY
 */

// 允许的来源（你的 GitHub Pages 域名和本地开发服务器）
const ALLOWED_ORIGINS = [
  'https://zzff-bot.github.io',
  'http://localhost:5173',
  'http://localhost:4173',
];

function corsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

export default {
  async fetch(request, env) {
    // 处理 CORS 预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(request),
      });
    }

    // 只允许 POST
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', {
        status: 405,
        headers: { ...corsHeaders(request), 'Content-Type': 'text/plain' },
      });
    }

    // 获取请求体
    const body = await request.text();

    // 转发到 DeepSeek API
    const deepseekResponse = await fetch(
      'https://api.deepseek.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
        },
        body,
      },
    );

    // 透传响应（包括流式 SSE 响应）
    const responseHeaders = new Headers(deepseekResponse.headers);
    // 追加 CORS 头
    const cors = corsHeaders(request);
    for (const [key, value] of Object.entries(cors)) {
      responseHeaders.set(key, value);
    }

    return new Response(deepseekResponse.body, {
      status: deepseekResponse.status,
      statusText: deepseekResponse.statusText,
      headers: responseHeaders,
    });
  },
};
