# NanoClaw Web UI

A modern, responsive web-based chat interface for AI assistants. Built with Express, WebSocket, and vanilla JavaScript - no frameworks required.

![Web UI Preview](docs/screenshot.png)

## Features

- 🌐 **Real-time Communication** - WebSocket-based instant messaging
- 🔐 **Optional Authentication** - Token-based access control
- 📱 **Mobile Responsive** - Works seamlessly on desktop and mobile
- 🎨 **Dark Theme** - Easy on the eyes, modern design
- 💬 **Markdown Support** - Rich text formatting for bot responses
- 🔄 **Auto-Reconnect** - Automatically reconnects on connection loss
- 📦 **Standalone** - Easy integration with any backend
- 🚀 **Lightweight** - No heavy frameworks, pure vanilla JS

## Quick Start

### Installation

```bash
npm install nanoclaw-web-ui
```

### Basic Usage

```javascript
import WebUIServer from 'nanoclaw-web-ui';

const server = new WebUIServer({
  port: 3000,
  assistantName: 'MyAssistant',
  onMessage: async (message) => {
    console.log('Received:', message.content);
    // Process message and send response
    server.sendToSession(message.chatJid.replace('web:', ''), {
      type: 'message',
      from: 'assistant',
      content: 'Hello! You said: ' + message.content,
      timestamp: new Date().toISOString(),
    });
  },
});

await server.start();
```

### With Authentication

```javascript
const server = new WebUIServer({
  port: 3000,
  authToken: process.env.SECRET_TOKEN,
  onAuthenticate: (sessionId) => {
    // Custom authentication logic
    return true; // or check against your user database
  },
});
```

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `port` | number | `3000` | Port to listen on |
| `authToken` | string | `undefined` | Optional auth token |
| `assistantName` | string | `"NanoClaw"` | Bot name displayed in UI |
| `staticPath` | string | `"../public"` | Path to static files |
| `onMessage` | function | - | Callback for incoming messages |
| `onAuthenticate` | function | - | Custom auth callback |

## Environment Variables

```bash
WEB_UI_PORT=3000           # Port to listen on
WEB_UI_AUTH_TOKEN=secret   # Optional auth token
ASSISTANT_NAME=MyBot       # Bot name
STATIC_PATH=./public       # Custom static file path
```

## API Endpoints

### GET `/api/health`
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "assistant": "NanoClaw",
  "timestamp": "2024-03-02T10:00:00.000Z"
}
```

### GET `/api/session?session=xxx`
Get session info.

### POST `/api/broadcast`
Send message to all connected sessions.

**Body:**
```json
{
  "from": "assistant",
  "content": "Hello everyone!"
}
```

### POST `/api/send`
Send message to specific session.

**Body:**
```json
{
  "sessionId": "web_xxx",
  "from": "assistant",
  "content": "Hello!"
}
```

## WebSocket Protocol

### Client → Server

**Connect & Authenticate:**
```json
{
  "type": "auth",
  "token": "optional-token"
}
```

**Send Message:**
```json
{
  "type": "message",
  "content": "Hello bot!"
}
```

**Ping:**
```json
{
  "type": "ping"
}
```

### Server → Client

**Connected:**
```json
{
  "type": "connected",
  "sessionId": "web_1234567890_abc123",
  "assistant": "NanoClaw"
}
```

**Auth Response:**
```json
{
  "type": "auth",
  "success": true,
  "sessionId": "web_1234567890_abc123"
}
```

**Message:**
```json
{
  "type": "message",
  "from": "assistant",
  "content": "Hello!",
  "timestamp": "2024-03-02T10:00:00.000Z"
}
```

**Error:**
```json
{
  "type": "error",
  "message": "Error description"
}
```

## Development

```bash
# Clone repository
git clone https://github.com/your-username/nanoclaw-web-ui.git
cd nanoclaw-web-ui

# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Integration Examples

### Express Integration

```javascript
import express from 'express';
import WebUIServer from 'nanoclaw-web-ui';

const app = express();
const webUI = new WebUIServer({ port: 3000 });

// Use webUI alongside your existing API
app.get('/api/custom', (req, res) => {
  res.json({ data: 'custom endpoint' });
});

// Send messages from your API
app.post('/api/notify', (req, res) => {
  webUI.broadcast('system', req.body.message);
  res.json({ sent: true });
});

await webUI.start();
```

### NanoClaw Integration

```javascript
import WebUIServer from 'nanoclaw-web-ui';

const webUI = new WebUIServer({
  onMessage: async (msg) => {
    // Forward to NanoClaw agent
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

## Customization

### Styling

Edit `public/css/styles.css` to customize the appearance. The UI uses CSS variables for easy theming:

```css
:root {
  --bg-primary: #0f0f0f;
  --bg-secondary: #1a1a1a;
  --bg-message-user: #2563eb;
  --bg-message-assistant: #2a2a2a;
  --text-primary: #ffffff;
  /* ... more variables */
}
```

### Frontend Logic

Edit `public/js/app.js` to add custom features like:
- File uploads
- Voice messages
- Custom commands
- Session persistence

## Deployment

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
      - ASSISTANT_NAME=MyBot
    restart: unless-stopped
```

### Reverse Proxy (Nginx)

```nginx
location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
}
```

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

- 📧 Email: support@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/nanoclaw-web-ui/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/your-username/nanoclaw-web-ui/discussions)

## Acknowledgments

Built as a modular component for [NanoClaw](https://github.com/anthropics/nanoclaw) - a lightweight AI assistant framework.

---

Made with ❤️ for the open-source community
