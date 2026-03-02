/**
 * Basic Usage Example
 *
 * This example shows how to use WebUIServer with minimal configuration.
 */

import WebUIServer from 'nanoclaw-web-ui';

// Create a simple echo server
const server = new WebUIServer({
  port: 3000,
  assistantName: 'EchoBot',
  onMessage: async (message) => {
    console.log(`[${message.senderName}]: ${message.content}`);

    // Echo the message back
    server.sendToSession(message.chatJid.replace('web:', ''), {
      type: 'message',
      from: 'assistant',
      content: `You said: ${message.content}`,
      timestamp: new Date().toISOString(),
    });
  },
});

// Start the server
await server.start();

console.log('Echo bot running on http://localhost:3000');
console.log('Type Ctrl+C to stop');
