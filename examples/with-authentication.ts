/**
 * Authentication Example
 *
 * This example shows how to use token-based authentication.
 */

import WebUIServer from 'nanoclaw-web-ui';

// Simulated user database
const users = new Map([
  ['alice123', { name: 'Alice', token: 'secret-token-alice' }],
  ['bob456', { name: 'Bob', token: 'secret-token-bob' }],
]);

const server = new WebUIServer({
  port: 3000,
  authToken: 'shared-secret', // Simple token auth
  assistantName: 'SecureBot',

  // Or use custom authentication
  onAuthenticate: (sessionId, token) => {
    // Check against your user database
    for (const [userId, user] of users.entries()) {
      if (token === user.token) {
        console.log(`User ${user.name} authenticated`);
        return true;
      }
    }
    return false;
  },

  onMessage: async (message) => {
    // Message from authenticated user
    server.sendToSession(message.chatJid.replace('web:', ''), {
      type: 'message',
      from: 'assistant',
      content: `Authenticated message received: ${message.content}`,
      timestamp: new Date().toISOString(),
    });
  },
});

await server.start();
console.log('Secure bot running on http://localhost:3000');
console.log('Use token: shared-secret');
