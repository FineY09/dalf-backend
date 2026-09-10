# DALF Backend API

DALF (Digital Argumentation & Language Feedback) API Proxy Server for Claude Integration

## Features

- ✅ Express.js Server
- ✅ CORS enabled for frontend integration
- ✅ Claude API proxy with authentication
- ✅ Health check endpoint
- ✅ Environment variable configuration
- ✅ Error handling

## Environment Variables

Set these in Vercel:

- `CLAUDE_API_KEY`: Your Claude API key from https://console.anthropic.com/account/keys
- `AUTH_KEY`: Authorization token for API access (e.g., `dalf-2024-secret`)

## API Endpoints

### Health Check
```
GET /health
```

Returns:
```json
{
  "status": "ok",
  "message": "DALF API Proxy is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Chat API
```
POST /api/chat
Authorization: Bearer {AUTH_KEY}
Content-Type: application/json
```

Request body:
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Your message here"
    }
  ],
  "max_tokens": 1024
}
```

Response:
```json
{
  "success": true,
  "content": "Claude's response...",
  "usage": {
    "input_tokens": 100,
    "output_tokens": 200
  }
}
```

## Deployment to Vercel

1. Create GitHub repository with these files
2. Import repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## Local Development

```bash
npm install
npm start
```

Server runs on http://localhost:3000
