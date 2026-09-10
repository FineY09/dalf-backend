# DALF API 代理服务器

这是 DALF（法语论证写作应用）的后端代理服务器。它用于安全地调用 Claude API。

## 功能

- ✅ 代理 Claude API 调用
- ✅ Bearer token 认证
- ✅ CORS 支持
- ✅ 错误处理
- ✅ 日志记录
- ✅ Vercel 部署就绪

## 部署到 Vercel

### 环境变量

部署时需要设置以下环境变量：

| 变量名 | 说明 | 示例 |
|------|------|------|
| `CLAUDE_API_KEY` | 你的 Claude API 密钥 | `sk-ant-...` |
| `AUTH_KEY` | 用于认证请求的密钥 | `dalf-2024-secret` |

### 快速开始

1. 复制此项目到 GitHub
2. 在 Vercel 中导入该 GitHub 仓库
3. 在部署设置中添加环境变量
4. 点击部署

### 本地测试

```bash
# 安装依赖
npm install

# 创建 .env 文件
echo "CLAUDE_API_KEY=sk-ant-..." > .env
echo "AUTH_KEY=dalf-2024-secret" >> .env

# 运行服务器
npm start
```

服务器会在 `http://localhost:3000` 启动

## API 端点

### GET /health

健康检查端点。

**响应：**
```json
{
  "status": "ok",
  "message": "DALF API Proxy is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### POST /api/chat

代理 Claude API 调用。

**认证：**
```
Authorization: Bearer dalf-2024-secret
```

**请求体：**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "你的消息"
    }
  ],
  "max_tokens": 800
}
```

**成功响应：**
```json
{
  "success": true,
  "content": "Claude 的回复文本",
  "usage": {
    "input_tokens": 10,
    "output_tokens": 100
  }
}
```

**错误响应：**
```json
{
  "error": "错误信息",
  "code": "ERROR_CODE"
}
```

## 错误代码

| 代码 | 说明 |
|------|------|
| `AUTH_FAILED` | 认证失败（密钥错误或缺失）|
| `INVALID_REQUEST` | 请求格式不正确 |
| `CONFIG_ERROR` | 服务器配置错误 |
| `INVALID_API_KEY` | Claude API 密钥无效 |
| `RATE_LIMIT` | 请求过于频繁 |
| `API_ERROR_*` | Claude API 错误 |
| `SERVER_ERROR` | 服务器内部错误 |

## 安全注意事项

- ✅ Claude API 密钥存储在服务器环境变量中，不会暴露给客户端
- ✅ 客户端只需知道 Bearer token（AUTH_KEY）
- ✅ 所有请求都需要有效的 Authorization 头
- ✅ 支持 CORS，可以从任何来源调用

## 文件结构

```
dalf-backend/
├── api/
│   └── proxy.js          # 主要的 Express 服务器
├── package.json          # 依赖配置
├── vercel.json          # Vercel 部署配置
├── .gitignore           # Git 忽略文件
├── README.md            # 本文件
└── .env                 # 环境变量（部署时设置）
```

## 故障排除

### 问题：部署失败
- 检查 package.json 和 api/proxy.js 是否存在
- 检查 vercel.json 语法是否正确

### 问题："未授权：密钥不正确"
- 确认 AUTH_KEY 环境变量已正确设置
- 确认请求的 Authorization 头格式：`Bearer YOUR_KEY`

### 问题："Claude API 密钥无效"
- 确认 CLAUDE_API_KEY 环境变量已正确设置
- 检查密钥是否有效（visit console.anthropic.com）

### 问题：健康检查返回 404
- 确认 vercel.json 的路由配置正确
- 检查 Vercel 的部署日志

## 支持

如果遇到问题，请检查：
1. Vercel 的部署日志
2. 浏览器的开发者工具（F12）
3. 服务器的 console 输出

## 许可证

MIT
