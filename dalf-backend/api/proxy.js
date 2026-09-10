const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Environment variables
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const AUTH_KEY = process.env.AUTH_KEY;

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'DALF API Proxy is running',
    timestamp: new Date().toISOString()
  });
});

// API Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    // Check authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Missing or invalid authorization header'
      });
    }

    const token = authHeader.substring(7);
    if (token !== AUTH_KEY) {
      return res.status(401).json({
        success: false,
        error: 'Invalid authorization key'
      });
    }

    // Get request body
    const { messages, max_tokens } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid messages format'
      });
    }

    if (!CLAUDE_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'Claude API key not configured'
      });
    }

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: max_tokens || 1024,
        messages: messages
      })
    });

    if (!response.ok) {
      const errorData = await response.json();

      if (response.status === 401) {
        return res.status(401).json({
          success: false,
          error: 'Invalid Claude API key'
        });
      }

      if (response.status === 429) {
        return res.status(429).json({
          success: false,
          error: 'Rate limited. Please try again later.'
        });
      }

      return res.status(response.status).json({
        success: false,
        error: errorData.error?.message || 'Claude API error'
      });
    }

    const data = await response.json();
    const content = data.content[0]?.text || '';
    const usage = data.usage || {};

    res.json({
      success: true,
      content: content,
      usage: {
        input_tokens: usage.input_tokens || 0,
        output_tokens: usage.output_tokens || 0
      }
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
    path: req.path
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`╔════════════════════════════════════════╗`);
  console.log(`║     DALF API Proxy Server              ║`);
  console.log(`║  🚀 Server running on port ${PORT}      ║`);
  console.log(`║  📍 API: POST /api/chat                ║`);
  console.log(`║  🏥 Health: GET /health                ║`);
  console.log(`╚════════════════════════════════════════╝`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});
