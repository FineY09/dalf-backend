const express = require('express');
const cors = require('cors');
const app = express();

// 环境变量
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const AUTH_KEY = process.env.AUTH_KEY || 'dalf-2024-secret';
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors({
  origin: '*',
  methods: ['POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'DALF API Proxy is running' });
});

// 主要的 API 代理端点
app.post('/api/chat', async (req, res) => {
  try {
    // 验证授权密钥
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${AUTH_KEY}`) {
      return res.status(401).json({ error: '未授权：密钥不正确' });
    }

    // 获取请求数据
    const { messages, max_tokens = 800 } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: '无效请求：缺少 messages 字段' });
    }

    if (!CLAUDE_API_KEY) {
      return res.status(500).json({ error: '服务器配置错误：缺少 Claude API 密钥' });
    }

    console.log(`[${new Date().toISOString()}] 收到请求，消息数：${messages.length}`);

    // 调用 Claude API
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: max_tokens,
        messages: messages
      })
    });

    // 处理响应
    if (!claudeResponse.ok) {
      const errorData = await claudeResponse.json().catch(() => ({}));
      console.error(`[错误] Claude API 返回 ${claudeResponse.status}:`, errorData);

      if (claudeResponse.status === 401) {
        return res.status(401).json({ error: 'Claude API 密钥无效或已过期' });
      }

      return res.status(claudeResponse.status).json({
        error: `Claude API 错误: ${claudeResponse.status}`,
        details: errorData
      });
    }

    const data = await claudeResponse.json();
    console.log(`[${new Date().toISOString()}] ✓ 成功获取响应`);

    // 返回结果给前端
    res.json({
      success: true,
      content: data.content[0].text,
      usage: data.usage
    });

  } catch (error) {
    console.error('代理服务器错误：', error);
    res.status(500).json({
      error: '服务器内部错误',
      message: error.message
    });
  }
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('未处理的错误：', err);
  res.status(500).json({ error: '服务器错误', message: err.message });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  DALF API Proxy Server                 ║
║  服务器运行在: http://localhost:${PORT}      ║
║  健康检查: GET /health                 ║
║  API 端点: POST /api/chat               ║
╚════════════════════════════════════════╝
  `);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('服务器正在关闭...');
  process.exit(0);
});