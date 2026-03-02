// State
let ws = null;
let sessionId = null;
let chatJid = null;
let assistantName = 'NanoClaw';
let isConnected = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000;

// DOM Elements
const authScreen = document.getElementById('auth-screen');
const chatScreen = document.getElementById('chat-screen');
const authForm = document.getElementById('auth-form');
const authTokenInput = document.getElementById('auth-token');
const tokenInputContainer = document.getElementById('token-input-container');
const connectBtn = document.getElementById('connect-btn');
const authError = document.getElementById('auth-error');
const statusDot = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');
const assistantNameEl = document.getElementById('assistant-name');
const messagesContainer = document.getElementById('messages');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');

// Initialize
function init() {
  // Check if auth token is required (from server config or previous session)
  const hasStoredToken = localStorage.getItem('nanoclaw_auth_token');
  if (hasStoredToken) {
    authTokenInput.value = hasStoredToken;
    tokenInputContainer.classList.add('hidden');
  }

  authForm.addEventListener('submit', handleAuth);
  messageForm.addEventListener('submit', handleMessage);

  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleMessage(e);
    }
  });
}

// WebSocket Connection
function connectWebSocket(token) {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/ws`;

  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    reconnectAttempts = 0;
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    handleWsMessage(data);
  };

  ws.onclose = () => {
    isConnected = false;
    updateConnectionStatus('disconnected');

    // Attempt reconnection
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++;
      updateConnectionStatus('reconnecting');
      setTimeout(() => connectWebSocket(token), RECONNECT_DELAY);
    } else {
      updateConnectionStatus('failed');
      showAuthError('Connection lost. Please refresh to reconnect.');
    }
  };

  ws.onerror = () => {
    showAuthError('Connection error. Please check if the server is running.');
  };
}

// Handle WebSocket Messages
function handleWsMessage(data) {
  switch (data.type) {
    case 'connected':
      sessionId = data.sessionId;
      assistantName = data.assistant || 'NanoClaw';
      assistantNameEl.textContent = assistantName;
      authenticate();
      break;

    case 'auth':
      handleAuthResponse(data);
      break;

    case 'message':
      displayMessage(data.from, data.content, data.timestamp);
      if (data.from === 'assistant') {
        removeTypingIndicator();
      }
      break;

    case 'pong':
      // Ping/pong for connection health
      break;

    case 'error':
      showAuthError(data.message || 'An error occurred');
      break;
  }
}

// Authentication
function handleAuth(e) {
  e.preventDefault();

  const token = authTokenInput.value.trim();

  // Store token for auto-reconnect
  if (token) {
    localStorage.setItem('nanoclaw_auth_token', token);
  }

  clearAuthError();
  connectBtn.textContent = 'Connecting...';
  connectBtn.disabled = true;

  connectWebSocket(token);
}

function authenticate() {
  const token = authTokenInput.value.trim();
  sendWsMessage({
    type: 'auth',
    token,
  });
}

function handleAuthResponse(data) {
  if (data.success) {
    chatJid = data.chatJid;
    isConnected = true;
    updateConnectionStatus('connected');

    // Switch to chat screen
    authScreen.classList.add('hidden');
    chatScreen.classList.remove('hidden');

    // Enable input
    messageInput.disabled = false;
    sendBtn.disabled = false;
    messageInput.focus();

    // Check if registered
    if (data.isRegistered) {
      removeWelcomeMessage();
    }
  } else {
    showAuthError(data.error || 'Authentication failed');
    connectBtn.textContent = 'Connect';
    connectBtn.disabled = false;
    ws?.close();
  }
}

// Send Message
function handleMessage(e) {
  e.preventDefault();

  const content = messageInput.value.trim();
  if (!content || !isConnected) return;

  // Display user message immediately
  displayMessage('user', content, new Date().toISOString());
  messageInput.value = '';

  // Send to server
  sendWsMessage({
    type: 'message',
    content,
  });

  // Show typing indicator
  showTypingIndicator();
  scrollToBottom();
}

function sendWsMessage(data) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

// Display Messages
function displayMessage(from, content, timestamp) {
  removeWelcomeMessage();

  const messageEl = document.createElement('div');
  messageEl.className = `message ${from}`;

  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';

  if (from === 'assistant') {
    // Simple markdown-like formatting
    bubble.innerHTML = formatMessage(content);
  } else {
    bubble.textContent = content;
  }

  const timeEl = document.createElement('div');
  timeEl.className = 'message-time';
  timeEl.textContent = formatTime(timestamp);

  messageEl.appendChild(bubble);
  messageEl.appendChild(timeEl);
  messagesContainer.appendChild(messageEl);

  scrollToBottom();
}

function formatMessage(content) {
  // Escape HTML
  let formatted = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Code blocks
  formatted = formatted.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');

  // Inline code
  formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Bold
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Line breaks to paragraphs
  formatted = formatted.split('\n\n').map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`).join('');

  return formatted;
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Typing Indicator
function showTypingIndicator() {
  removeTypingIndicator();

  const indicator = document.createElement('div');
  indicator.className = 'typing-indicator';
  indicator.id = 'typing-indicator';
  indicator.innerHTML = '<span></span><span></span><span></span>';

  messagesContainer.appendChild(indicator);
  scrollToBottom();
}

function removeTypingIndicator() {
  const indicator = document.getElementById('typing-indicator');
  if (indicator) {
    indicator.remove();
  }
}

// UI Helpers
function updateConnectionStatus(status) {
  statusDot.className = 'status-dot';
  statusDot.classList.add(status);

  switch (status) {
    case 'connected':
      statusText.textContent = 'Connected';
      break;
    case 'disconnected':
      statusText.textContent = 'Disconnected';
      break;
    case 'reconnecting':
      statusText.textContent = `Reconnecting... (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`;
      break;
    case 'failed':
      statusText.textContent = 'Connection failed';
      break;
    default:
      statusText.textContent = 'Connecting...';
  }
}

function showAuthError(message) {
  authError.textContent = message;
}

function clearAuthError() {
  authError.textContent = '';
}

function removeWelcomeMessage() {
  const welcome = messagesContainer.querySelector('.welcome-message');
  if (welcome) {
    welcome.remove();
  }
}

function scrollToBottom() {
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Ping/pong for connection health
setInterval(() => {
  if (isConnected) {
    sendWsMessage({ type: 'ping' });
  }
}, 30000);

// Start
init();
