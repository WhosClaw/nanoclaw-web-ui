# NanoClaw Web UI

一个现代化、响应式的 AI 助手网页聊天界面。基于 Express、WebSocket 和原生 JavaScript 构建 - 无需任何框架。

![Web UI 预览](docs/screenshot.png)

[English](README.md) | 简体中文

## 功能特性

### 核心功能
- 🌐 **实时通信** - 基于 WebSocket 的即时消息传递
- 🔐 **可选认证** - 基于令牌的访问控制
- 📱 **移动端响应式** - 完美支持桌面和移动设备
- 🎨 **深浅色主题** - 支持深色/浅色主题切换
- 💬 **Markdown 支持** - 机器人响应富文本格式化
- 🔄 **自动重连** - 连接断开时自动重连
- 📦 **独立部署** - 轻松集成任何后端服务
- 🚀 **轻量级** - 无重型框架依赖，纯原生 JavaScript

### v1.1.0 新增功能
- 💬 **会话管理** - 支持多会话创建、切换、重命名、删除
- ⌨️ **代码高亮** - 集成 highlight.js，支持 180+ 种编程语言
- 🔗 **连接状态** - 实时延迟显示和质量指示器
- ✍️ **输入指示** - Agent 正在输入的动画提示
- ✉️ **已读回执** - 消息状态追踪（发送中/已发送/已送达/已读）
- 🌍 **国际化** - 支持英文和简体中文双语
- 🔍 **消息搜索** - 全局模糊搜索，支持键盘导航 (Ctrl+K)
- 📎 **文件上传** - 拖拽上传文件和图片 (Ctrl+U)
- 📊 **使用统计** - 消息统计和活跃度图表
- 🖼️ **品牌 Logo** - 可自定义的应用图标

## 快速开始

### 安装

```bash
npm install nanoclaw-web-ui
```

### 基础用法

```javascript
import WebUIServer from 'nanoclaw-web-ui';

const server = new WebUIServer({
  port: 3000,
  assistantName: '我的助手',
  onMessage: async (message) => {
    console.log('收到消息:', message.content);
    // 处理消息并发送响应
    server.sendToSession(message.chatJid.replace('web:', ''), {
      type: 'message',
      from: 'assistant',
      content: '你好！你说：' + message.content,
      timestamp: new Date().toISOString(),
    });
  },
});

await server.start();
```

### 带认证的用法

```javascript
const server = new WebUIServer({
  port: 3000,
  authToken: process.env.SECRET_TOKEN,
  onAuthenticate: (sessionId) => {
    // 自定义认证逻辑
    return true; // 或检查你的用户数据库
  },
});
```

## 配置选项

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `port` | number | `3000` | 监听端口 |
| `authToken` | string | `undefined` | 可选的认证令牌 |
| `assistantName` | string | `"NanoClaw"` | UI 中显示的机器人名称 |
| `staticPath` | string | `"../public"` | 静态文件路径 |
| `onMessage` | function | - | 接收消息的回调 |
| `onAuthenticate` | function | - | 自定义认证回调 |

## 环境变量

```bash
WEB_UI_PORT=3000           # 监听端口
WEB_UI_AUTH_TOKEN=secret   # 可选认证令牌
ASSISTANT_NAME=我的机器人   # 机器人名称
STATIC_PATH=./public       # 自定义静态文件路径
```

## API 端点

### GET `/api/health`
健康检查端点。

**响应：**
```json
{
  "status": "ok",
  "assistant": "NanoClaw",
  "timestamp": "2024-03-02T10:00:00.000Z"
}
```

### GET `/api/session?session=xxx`
获取会话信息。

### POST `/api/broadcast`
向所有连接的会话发送消息。

**请求体：**
```json
{
  "from": "assistant",
  "content": "大家好！"
}
```

### POST `/api/send`
向指定会话发送消息。

**请求体：**
```json
{
  "sessionId": "web_xxx",
  "from": "assistant",
  "content": "你好！"
}
```

## WebSocket 协议

### 客户端 → 服务器

**连接与认证：**
```json
{
  "type": "auth",
  "token": "optional-token"
}
```

**发送消息：**
```json
{
  "type": "message",
  "content": "你好机器人！"
}
```

**心跳：**
```json
{
  "type": "ping"
}
```

### 服务器 → 客户端

**已连接：**
```json
{
  "type": "connected",
  "sessionId": "web_1234567890_abc123",
  "assistant": "NanoClaw"
}
```

**认证响应：**
```json
{
  "type": "auth",
  "success": true,
  "sessionId": "web_1234567890_abc123"
}
```

**消息：**
```json
{
  "type": "message",
  "from": "assistant",
  "content": "你好！",
  "timestamp": "2024-03-02T10:00:00.000Z"
}
```

**错误：**
```json
{
  "type": "error",
  "message": "错误描述"
}
```

## 键盘快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+K` | 打开消息搜索 |
| `Ctrl+U` | 打开文件上传 |
| `Ctrl+T` | 切换深浅色主题 |
| `Shift+Enter` | 输入框换行 |

## 开发

```bash
# 克隆仓库
git clone https://github.com/WhosClaw/nanoclaw-web-ui.git
cd nanoclaw-web-ui

# 安装依赖
npm install

# 开发模式运行
npm run dev

# 生产环境构建
npm run build

# 启动生产服务器
npm start

# 运行测试
npm test
```

## 集成示例

### Express 集成

```javascript
import express from 'express';
import WebUIServer from 'nanoclaw-web-ui';

const app = express();
const webUI = new WebUIServer({ port: 3000 });

// 在现有 API 旁使用 webUI
app.get('/api/custom', (req, res) => {
  res.json({ data: '自定义端点' });
});

// 从你的 API 发送消息
app.post('/api/notify', (req, res) => {
  webUI.broadcast('system', req.body.message);
  res.json({ sent: true });
});

await webUI.start();
```

### NanoClaw 集成

```javascript
import WebUIServer from 'nanoclaw-web-ui';

const webUI = new WebUIServer({
  onMessage: async (msg) => {
    // 转发给 NanoClaw agent
    const response = await runAgent(msg.content);
    webUI.sendToSession(msg.chatJid.replace('web:', ''), {
      type: 'message',
      from: 'assistant',
      content: response,
      timestamp: new Date().toISOString(),
    });
  },
});
```

## 自定义

### 样式定制

编辑 `public/css/styles.css` 来自定义外观。UI 使用 CSS 变量便于主题定制：

```css
:root {
  --bg-primary: #0f0f0f;
  --bg-secondary: #1a1a1a;
  --bg-message-user: #2563eb;
  --bg-message-assistant: #2a2a2a;
  --text-primary: #ffffff;
  /* ... 更多变量 */
}
```

### 前端逻辑

编辑 `public/js/app.js` 添加自定义功能：
- 文件上传
- 语音消息
- 自定义命令
- 会话持久化

### 自定义 Logo

要使用自定义 Logo，替换 `public/index.html` 中的 `.app-logo` SVG 内容，或直接使用图片：

```html
<div class="app-logo">
  <img src="your-logo.png" alt="Logo" width="32" height="32">
</div>
```

## 部署

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  web-ui:
    image: nanoclaw-web-ui:latest
    ports:
      - "3000:3000"
    environment:
      - WEB_UI_AUTH_TOKEN=your-secret-token
      - ASSISTANT_NAME=我的机器人
    restart: unless-stopped
```

### 反向代理 (Nginx)

```nginx
location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
}
```

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件。

## 贡献

欢迎贡献！请随时提交 Pull Request。

## 支持

- 📧 Email: support@example.com
- 🐛 问题反馈: [GitHub Issues](https://github.com/WhosClaw/nanoclaw-web-ui/issues)
- 💬 讨论: [GitHub Discussions](https://github.com/WhosClaw/nanoclaw-web-ui/discussions)

## 致谢

作为模块化组件为 [NanoClaw](https://github.com/anthropics/nanoclaw) 构建 - 一个轻量级 AI 助手框架。

---

用 ❤️ 为开源社区打造
