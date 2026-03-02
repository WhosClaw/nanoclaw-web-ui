import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration - can be overridden via environment variables
const config = {
  PORT: parseInt(process.env.WEB_UI_PORT || '3000', 10),
  AUTH_TOKEN: process.env.WEB_UI_AUTH_TOKEN || '',
  ASSISTANT_NAME: process.env.ASSISTANT_NAME || 'NanoClaw',
  STATIC_PATH: process.env.STATIC_PATH || path.join(__dirname, '../public'),
};

export interface WebMessage {
  id: string;
  chatJid: string;
  sender: string;
  senderName: string;
  content: string;
  timestamp: string;
}

export interface WebMessageHandler {
  (message: WebMessage): void | Promise<void>;
}

export interface WebServerOptions {
  port?: number;
  authToken?: string;
  assistantName?: string;
  staticPath?: string;
  onMessage?: WebMessageHandler;
  onAuthenticate?: (sessionId: string) => boolean;
}

interface WebSession {
  ws: WebSocket;
  sessionId: string;
  isAuthenticated: boolean;
  lastActivity: Date;
}

/**
 * Web UI Server for NanoClaw
 * Provides a web-based chat interface with WebSocket support
 */
export class WebUIServer {
  private app: express.Application;
  private server: ReturnType<typeof createServer>;
  private wss: WebSocketServer | null = null;
  private sessions: Map<string, WebSession> = new Map();
  private connected = false;
  private config: typeof config;

  private onMessageCallback?: WebMessageHandler;
  private onAuthenticateCallback?: ((sessionId: string) => boolean) | undefined;

  constructor(options: WebServerOptions = {}) {
    this.config = {
      PORT: options.port ?? config.PORT,
      AUTH_TOKEN: options.authToken ?? config.AUTH_TOKEN,
      ASSISTANT_NAME: options.assistantName ?? config.ASSISTANT_NAME,
      STATIC_PATH: options.staticPath ?? config.STATIC_PATH,
    };

    this.onMessageCallback = options.onMessage;
    this.onAuthenticateCallback = options.onAuthenticate;

    this.app = express();
    this.server = createServer(this.app);

    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
  }

  private setupMiddleware(): void {
    this.app.use(express.json());
    this.app.use(express.static(this.config.STATIC_PATH));
  }

  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/api/health', (_req, res) => {
      res.json({
        status: 'ok',
        assistant: this.config.ASSISTANT_NAME,
        timestamp: new Date().toISOString(),
      });
    });

    // Session info endpoint
    this.app.get('/api/session', (req, res) => {
      const sessionId = req.query.session as string;
      const session = this.sessions.get(sessionId);

      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      res.json({
        sessionId: session.sessionId,
        isAuthenticated: session.isAuthenticated,
        lastActivity: session.lastActivity,
      });
    });

    // Broadcast endpoint - send message to all sessions
    this.app.post('/api/broadcast', express.json(), (req, res) => {
      const { from, content } = req.body;

      if (!content) {
        return res.status(400).json({ error: 'Content is required' });
      }

      const sentCount = this.broadcast(from, content);
      res.json({ sentCount, message: 'Broadcast sent' });
    });

    // Send to specific session
    this.app.post('/api/send', express.json(), (req, res) => {
      const { sessionId, from, content } = req.body;

      if (!sessionId || !content) {
        return res.status(400).json({ error: 'sessionId and content are required' });
      }

      const sent = this.sendToSession(sessionId, {
        type: 'message',
        from: from || 'assistant',
        content,
        timestamp: new Date().toISOString(),
      });

      if (sent) {
        res.json({ message: 'Sent' });
      } else {
        res.status(404).json({ error: 'Session not found or not connected' });
      }
    });
  }

  private setupWebSocket(): void {
    this.wss = new WebSocketServer({ server: this.server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket, req) => {
      const sessionId = this.generateSessionId();

      logger.info({ sessionId, ip: req.socket.remoteAddress }, 'WebSocket connection initiated');

      // Send initial session info
      this.sendToWs(ws, {
        type: 'connected',
        sessionId,
        assistant: this.config.ASSISTANT_NAME,
      });

      ws.on('message', (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleWsMessage(ws, sessionId, message);
        } catch (err) {
          logger.warn({ sessionId, err }, 'Invalid WebSocket message');
          this.sendToWs(ws, { type: 'error', message: 'Invalid JSON' });
        }
      });

      ws.on('close', () => {
        const session = this.sessions.get(sessionId);
        if (session) {
          logger.info({ sessionId }, 'WebSocket disconnected');
          this.sessions.delete(sessionId);
        }
      });

      ws.on('error', (err) => {
        logger.warn({ sessionId, err }, 'WebSocket error');
      });
    });
  }

  private async handleWsMessage(
    ws: WebSocket,
    sessionId: string,
    message: any,
  ): Promise<void> {
    const session = this.sessions.get(sessionId);

    switch (message.type) {
      case 'auth': {
        const token = message.token;
        const isAuthenticated = !this.config.AUTH_TOKEN || token === this.config.AUTH_TOKEN;

        // Custom authentication check
        const customAuthResult = this.onAuthenticateCallback?.(sessionId);
        if (customAuthResult === false) {
          this.sendToWs(ws, { type: 'auth', success: false, error: 'Authentication denied' });
          return;
        }

        if (!isAuthenticated) {
          this.sendToWs(ws, { type: 'auth', success: false, error: 'Invalid token' });
          return;
        }

        // Store session
        this.sessions.set(sessionId, {
          ws,
          sessionId,
          isAuthenticated: true,
          lastActivity: new Date(),
        });

        this.sendToWs(ws, {
          type: 'auth',
          success: true,
          sessionId,
          assistantName: this.config.ASSISTANT_NAME,
        });

        logger.info({ sessionId }, 'Web session authenticated');
        break;
      }

      case 'message': {
        if (!session || !session.isAuthenticated) {
          this.sendToWs(ws, { type: 'error', message: 'Not authenticated' });
          return;
        }

        const content = message.content;
        if (!content || typeof content !== 'string') {
          this.sendToWs(ws, { type: 'error', message: 'Invalid content' });
          return;
        }

        const timestamp = new Date().toISOString();

        // Call message handler if provided
        if (this.onMessageCallback) {
          try {
            await this.onMessageCallback({
              id: `web_${sessionId}_${Date.now()}`,
              chatJid: `web:${sessionId}`,
              sender: sessionId,
              senderName: 'User',
              content,
              timestamp,
            });
          } catch (err) {
            logger.error({ sessionId, err }, 'Error in message handler');
          }
        }

        session.lastActivity = new Date();
        logger.debug({ sessionId, contentLength: content.length }, 'Web message received');
        break;
      }

      case 'ping': {
        if (session) {
          session.lastActivity = new Date();
          this.sendToWs(ws, { type: 'pong' });
        }
        break;
      }

      default:
        this.sendToWs(ws, { type: 'error', message: 'Unknown message type' });
    }
  }

  private sendToWs(ws: WebSocket, data: any): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }

  /**
   * Send a message to a specific session
   */
  public sendToSession(sessionId: string, data: any): boolean {
    const session = this.sessions.get(sessionId);
    if (session && session.ws.readyState === WebSocket.OPEN) {
      this.sendToWs(session.ws, data);
      return true;
    }
    return false;
  }

  /**
   * Broadcast a message to all authenticated sessions
   */
  public broadcast(from: string, content: string): number {
    let sentCount = 0;
    const data = {
      type: 'message',
      from,
      content,
      timestamp: new Date().toISOString(),
    };

    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.isAuthenticated && session.ws.readyState === WebSocket.OPEN) {
        this.sendToWs(session.ws, data);
        sentCount++;
      }
    }

    return sentCount;
  }

  /**
   * Get all active sessions
   */
  public getSessions(): Array<{ sessionId: string; lastActivity: Date }> {
    return Array.from(this.sessions.entries()).map(([sessionId, session]) => ({
      sessionId,
      lastActivity: session.lastActivity,
    }));
  }

  /**
   * Disconnect a specific session
   */
  public disconnectSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.ws.close();
      this.sessions.delete(sessionId);
      return true;
    }
    return false;
  }

  /**
   * Start the server
   */
  public async start(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.server.listen(this.config.PORT, () => {
        this.connected = true;
        logger.info(
          { port: this.config.PORT, assistant: this.config.ASSISTANT_NAME },
          'Web UI server started',
        );
        console.log(`\n  Web UI: http://localhost:${this.config.PORT}`);
        if (this.config.AUTH_TOKEN) {
          console.log(`  Auth token: ${this.config.AUTH_TOKEN}`);
        }
        console.log();
        resolve();
      });
    });
  }

  /**
   * Stop the server
   */
  public async stop(): Promise<void> {
    // Close all WebSocket connections
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.ws.readyState === WebSocket.OPEN) {
        session.ws.close();
      }
    }
    this.sessions.clear();

    // Close WebSocket server
    if (this.wss) {
      this.wss.close();
      this.wss = null;
    }

    // Close HTTP server
    return new Promise<void>((resolve) => {
      this.server.close(() => {
        this.connected = false;
        logger.info({}, 'Web UI server stopped');
        resolve();
      });
    });
  }

  /**
   * Check if server is running
   */
  public isRunning(): boolean {
    return this.connected;
  }

  private generateSessionId(): string {
    return `web_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}

// Simple logger
const logger = {
  info: (obj: any, msg: string) => console.log(`[INFO] ${msg}`, obj ? JSON.stringify(obj) : ''),
  warn: (obj: any, msg: string) => console.warn(`[WARN] ${msg}`, obj ? JSON.stringify(obj) : ''),
  error: (obj: any, msg: string) => console.error(`[ERROR] ${msg}`, obj ? JSON.stringify(obj) : ''),
  debug: (obj: any, msg: string) => {
    if (process.env.DEBUG) console.log(`[DEBUG] ${msg}`, obj ? JSON.stringify(obj) : '');
  },
};

// Export for direct usage
export default WebUIServer;

// CLI support - run directly if executed
const isDirectRun =
  process.argv[1] &&
  new URL(import.meta.url).pathname === new URL(`file://${process.argv[1]}`).pathname;

if (isDirectRun) {
  const server = new WebUIServer();

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received, shutting down...`);
    await server.stop();
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  server.start().catch((err) => {
    console.error('Failed to start Web UI server:', err);
    process.exit(1);
  });
}
