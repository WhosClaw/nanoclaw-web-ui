# Contributing to NanoClaw Web UI

Thank you for your interest in contributing! This guide will help you get started.

## Development Setup

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Clone and Install

```bash
# Clone repository
git clone https://github.com/WhosClaw/nanoclaw-web-ui.git
cd nanoclaw-web-ui

# Install dependencies
npm install
```

### Development Mode

```bash
# Run with hot reload
npm run dev

# The server will start on http://localhost:3000
```

### Build for Production

```bash
# Compile TypeScript
npm run build

# Start production server
npm start
```

## Project Structure

```
nanoclaw-web-ui/
├── public/
│   ├── css/
│   │   └── styles.css          # Main stylesheet with theme variables
│   ├── js/
│   │   └── app.js              # Frontend application logic
│   ├── i18n/
│   │   ├── en.json             # English translations
│   │   └── zh-CN.json          # Chinese translations
│   └── index.html              # Main HTML file
├── src/
│   └── index.ts                # Express server with WebSocket
├── docs/
│   └── screenshot.png          # Screenshot for README
└── package.json
```

## Code Style

- Use TypeScript for server code
- Use ES6+ JavaScript for client code
- Follow existing naming conventions
- Add comments for complex logic
- Keep functions focused and small

## Testing

```bash
# Run tests (when available)
npm test
```

## Submitting Changes

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Customization Guide

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

### Adding Translations

Add new language files in `public/i18n/`:

```json
{
  "appName": "NanoClaw",
  "chat": {
    "welcome": "Connected to {{name}}"
  }
}
```

Then add the language option in `public/js/app.js`.

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

## Deployment Guide

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

### Environment Variables

```bash
WEB_UI_PORT=3000           # Port to listen on
WEB_UI_AUTH_TOKEN=secret   # Optional auth token
ASSISTANT_NAME=MyBot       # Bot name
STATIC_PATH=./public       # Custom static file path
```

## Getting Help

- **Issues:** [GitHub Issues](https://github.com/WhosClaw/nanoclaw-web-ui/issues)
- **NanoClaw:** [https://github.com/qwibitai/nanoclaw](https://github.com/qwibitai/nanoclaw)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
