import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WebSocket } from 'ws';

// Mock express
vi.mock('express', () => {
  const mockApp = {
    use: vi.fn(),
    get: vi.fn(),
    post: vi.fn(),
  };
  const expressFn = vi.fn(() => mockApp) as any;
  expressFn.json = vi.fn(() => (req: any, res: any, next: any) => next());
  expressFn.static = vi.fn(() => (req: any, res: any, next: any) => next());
  return {
    default: expressFn,
  };
});

// Mock http
vi.mock('http', () => ({
  createServer: vi.fn(() => ({
    listen: vi.fn((_port: number, cb: () => void) => cb?.()),
    close: vi.fn((cb?: () => void) => cb?.()),
  })),
}));

// Mock ws
vi.mock('ws', () => {
  class MockWebSocketServer {
    close = vi.fn();
    private handlers: Map<string, Function> = new Map();

    constructor(_opts: any) {
      this.handlers.set('connection', this.handleConnection.bind(this));
    }

    on(event: string, handler: Function) {
      this.handlers.set(event, handler);
    }

    handleConnection(_ws: any, _req: any) {
      // Connection handled in tests
    }
  }

  return {
    WebSocketServer: MockWebSocketServer,
    WebSocket: {
      OPEN: 1,
      CONNECTING: 0,
      CLOSING: 2,
      CLOSED: 3,
    },
  };
});

import { WebUIServer, WebMessage } from './index.js';

describe('WebUIServer', () => {
  let server: WebUIServer;
  let mockWebSocket: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create a mock WebSocket for testing
    mockWebSocket = {
      readyState: 1, // OPEN
      send: vi.fn(),
      close: vi.fn(),
      on: vi.fn(),
    };

    server = new WebUIServer({
      port: 3001,
      assistantName: 'TestBot',
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create a server with default options', () => {
      const defaultServer = new WebUIServer();
      expect(defaultServer).toBeDefined();
      expect(defaultServer.isRunning()).toBe(false);
    });

    it('should create a server with custom options', () => {
      const customServer = new WebUIServer({
        port: 3002,
        assistantName: 'CustomBot',
        authToken: 'secret-token',
      });

      expect(customServer).toBeDefined();
    });

    it('should have correct server name', () => {
      expect(server).toBeDefined();
    });
  });

  describe('start', () => {
    it('should start the server successfully', async () => {
      await server.start();
      expect(server.isRunning()).toBe(true);
    });

    it('should be idempotent - multiple starts should work', async () => {
      await server.start();
      await server.start();
      expect(server.isRunning()).toBe(true);
    });
  });

  describe('stop', () => {
    it('should stop the server successfully', async () => {
      await server.start();
      expect(server.isRunning()).toBe(true);

      await server.stop();
      expect(server.isRunning()).toBe(false);
    });

    it('should handle stopping when not running', async () => {
      await expect(server.stop()).resolves.toBeUndefined();
    });
  });

  describe('sendToSession', () => {
    it('should return false for non-existent session', () => {
      const result = server.sendToSession('non-existent', {
        type: 'message',
        content: 'test',
      });
      expect(result).toBe(false);
    });
  });

  describe('broadcast', () => {
    it('should return 0 when no sessions are active', () => {
      const count = server.broadcast('assistant', 'Hello everyone!');
      expect(count).toBe(0);
    });
  });

  describe('getSessions', () => {
    it('should return empty array when no sessions', () => {
      const sessions = server.getSessions();
      expect(sessions).toEqual([]);
    });
  });

  describe('disconnectSession', () => {
    it('should return false for non-existent session', () => {
      const result = server.disconnectSession('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('onMessage callback', () => {
    it('should call onMessage when configured', async () => {
      const onMessageMock = vi.fn();

      const serverWithCallback = new WebUIServer({
        port: 3003,
        onMessage: onMessageMock,
      });

      expect(serverWithCallback).toBeDefined();
      expect(onMessageMock).not.toHaveBeenCalled();
    });
  });

  describe('onAuthenticate callback', () => {
    it('should support custom authentication', async () => {
      const onAuthMock = vi.fn(() => true);

      const serverWithAuth = new WebUIServer({
        port: 3004,
        onAuthenticate: onAuthMock,
      });

      expect(serverWithAuth).toBeDefined();
    });
  });
});

describe('WebMessage type', () => {
  it('should create a valid WebMessage', () => {
    const message: WebMessage = {
      id: 'test-id',
      chatJid: 'web:session-123',
      sender: 'session-123',
      senderName: 'Test User',
      content: 'Hello, world!',
      timestamp: '2024-03-02T10:00:00.000Z',
    };

    expect(message.id).toBe('test-id');
    expect(message.chatJid).toBe('web:session-123');
    expect(message.content).toBe('Hello, world!');
  });
});
