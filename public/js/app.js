// ==================== i18n Configuration ====================
const i18n = {
  currentLang: localStorage.getItem('nanoclaw_language') || 'en',
  translations: {},

  async loadTranslations(lang) {
    try {
      const response = await fetch(`i18n/${lang}.json`);
      this.translations[lang] = await response.json();
    } catch (e) {
      console.warn(`Failed to load translations for ${lang}:`, e);
      // Fallback to embedded translations
      this.translations[lang] = this.getFallbackTranslations(lang);
    }
  },

  getFallbackTranslations(lang) {
    if (lang === 'zh-CN') {
      return {
        appName: "NanoClaw",
        auth: {
          title: "NanoClaw",
          subtitle: "网页聊天界面",
          tokenLabel: "认证令牌（如果需要）",
          tokenPlaceholder: "请输入认证令牌...",
          connectBtn: "连接",
          connecting: "连接中...",
          invalidToken: "令牌无效"
        },
        chat: {
          welcome: "已连接到 {{name}}",
          welcomeSubtitle: "发送消息开始对话。",
          placeholder: "输入消息... (Shift+Enter 换行)",
          send: "发送",
          sessions: "会话",
          newChat: "新建聊天",
          export: "导出",
          clear: "清空",
          typing: "正在输入...",
          online: "在线",
          offline: "离线",
          reconnecting: "重新连接中...",
          connectionFailed: "连接失败",
          connectionError: "连接错误"
        },
        session: {
          newChat: "新聊天 {{number}}",
          rename: "重命名会话",
          delete: "删除会话",
          cannotDeleteLast: "无法删除最后一个会话",
          deleted: "会话已删除",
          cleared: "消息已清空"
        },
        messages: {
          copy: "复制",
          edit: "编辑",
          delete: "删除",
          resend: "重新发送",
          copied: "已复制到剪贴板！",
          deleted: "消息已删除",
          confirmDelete: "删除这条消息？",
          confirmClear: "清空此会话的所有消息？",
          noMessages: "没有消息可导出",
          exported: "聊天记录已导出！"
        },
        status: {
          sending: "发送中...",
          sent: "已发送",
          delivered: "已送达",
          read: "已读",
          failed: "发送失败"
        },
        errors: {
          notAuthenticated: "未认证",
          invalidContent: "内容无效",
          unknownMessageType: "未知消息类型",
          connectionLost: "连接丢失。请刷新页面重新连接。",
          serverNotRunning: "连接错误。请检查服务器是否运行。"
        }
      };
    }
    return {
      appName: "NanoClaw",
      auth: {
        title: "NanoClaw",
        subtitle: "Web Chat Interface",
        tokenLabel: "Auth Token (if required)",
        tokenPlaceholder: "Enter auth token...",
        connectBtn: "Connect",
        connecting: "Connecting...",
        invalidToken: "Invalid token"
      },
      chat: {
        welcome: "Connected to {{name}}",
        welcomeSubtitle: "Send a message to start the conversation.",
        placeholder: "Type a message... (Shift+Enter for new line)",
        send: "Send",
        sessions: "Sessions",
        newChat: "New Chat",
        export: "Export",
        clear: "Clear",
        typing: "typing...",
        online: "Online",
        offline: "Offline",
        reconnecting: "Reconnecting...",
        connectionFailed: "Connection failed",
        connectionError: "Connection error"
      },
      session: {
        newChat: "New Chat {{number}}",
        rename: "Rename session",
        delete: "Delete session",
        cannotDeleteLast: "Cannot delete the last session",
        deleted: "Session deleted",
        cleared: "Messages cleared"
      },
      messages: {
        copy: "Copy",
        edit: "Edit",
        delete: "Delete",
        resend: "Resend",
        copied: "Copied to clipboard!",
        deleted: "Message deleted",
        confirmDelete: "Delete this message?",
        confirmClear: "Clear all messages in this session?",
        noMessages: "No messages to export",
        exported: "Chat exported!"
      },
      status: {
        sending: "Sending...",
        sent: "Sent",
        delivered: "Delivered",
        read: "Read",
        failed: "Failed"
      },
      errors: {
        notAuthenticated: "Not authenticated",
        invalidContent: "Invalid content",
        unknownMessageType: "Unknown message type",
        connectionLost: "Connection lost. Please refresh to reconnect.",
        serverNotRunning: "Connection error. Please check if the server is running."
      }
    };
  },

  t(key, vars = {}) {
    const keys = key.split('.');
    let value = this.translations[this.currentLang];

    for (const k of keys) {
      if (value && value[k]) {
        value = value[k];
      } else {
        return key; // Fallback to key
      }
    }

    if (typeof value === 'string') {
      // Replace {{var}} placeholders
      return value.replace(/\{\{(\w+)\}\}/g, (_, varName) => vars[varName] || '');
    }

    return key;
  },

  async setLanguage(lang) {
    if (!this.translations[lang]) {
      await this.loadTranslations(lang);
    }
    this.currentLang = lang;
    localStorage.setItem('nanoclaw_language', lang);
    document.body.dataset.language = lang;
    this.updateUIText();
  },

  updateUIText() {
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const vars = el.getAttribute('data-i18n-vars');
      const varsObj = vars ? JSON.parse(vars) : {};
      el.textContent = this.t(key, varsObj);
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      el.placeholder = this.t(key);
    });

    // Update titles
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      el.title = this.t(key);
    });

    // Update language button labels
    const langLabel = document.querySelector('.lang-label');
    if (langLabel) {
      langLabel.textContent = this.currentLang === 'zh-CN' ? '中文' : 'EN';
    }

    // Update auth screen
    const tokenLabel = document.querySelector('#token-input-container label');
    if (tokenLabel && tokenLabel.hasAttribute('data-i18n')) {
      tokenLabel.textContent = this.t(tokenLabel.getAttribute('data-i18n'));
    }

    // Update language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === this.currentLang);
    });

    // Update session list header
    const sessionsHeader = document.querySelector('.sidebar-header h2');
    if (sessionsHeader) {
      sessionsHeader.textContent = this.t('chat.sessions');
    }

    // Update header buttons
    updateHeaderButtons();
  }
};

// ==================== State ====================
let ws = null;
let sessionId = null;
let currentSessionId = null;
let chatJid = null;
let assistantName = 'NanoClaw';
let isConnected = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000;

// Message history storage
const MAX_STORED_MESSAGES = 500;
const STORAGE_KEY = 'nanoclaw_chat_history';
const SESSIONS_KEY = 'nanoclaw_sessions';

// Session management
let sessions = [];
let currentSessionIndex = 0;

// Connection tracking
let lastPingTime = Date.now();
let latency = 0;

// Message tracking for read receipts
const messageStatusMap = new Map();

// Agent typing state
let isAgentTyping = false;
let typingTimeout = null;

// ==================== DOM Elements ====================
const authScreen = document.getElementById('auth-screen');
const chatScreen = document.getElementById('chat-screen');
const authForm = document.getElementById('auth-form');
const authTokenInput = document.getElementById('auth-token');
const tokenInputContainer = document.getElementById('token-input-container');
const connectBtn = document.getElementById('connect-btn');
const authError = document.getElementById('auth-error');
const statusDot = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');
const statusDetail = document.getElementById('status-detail');
const connectionQuality = document.getElementById('connection-quality');
const assistantNameEl = document.getElementById('assistant-name');
const messagesContainer = document.getElementById('messages');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const sessionSidebar = document.getElementById('session-sidebar');
const sessionList = document.getElementById('session-list');
const newChatBtn = document.getElementById('new-chat-btn');
const toggleSidebarBtn = document.getElementById('toggle-sidebar-btn');
const agentTypingEl = document.getElementById('agent-typing');
const langToggle = document.getElementById('lang-toggle');

// New feature elements
const searchBar = document.getElementById('search-bar');
const searchInput = document.getElementById('search-input');
const searchToggleBtn = document.getElementById('search-toggle-btn');
const searchClose = document.getElementById('search-close');
const searchResults = document.getElementById('search-results');
const themeToggle = document.getElementById('theme-toggle');
const fileDropZone = document.getElementById('file-drop-zone');
const fileInput = document.getElementById('file-input');
const attachBtn = document.getElementById('attach-btn');
const fileDropClose = document.getElementById('file-drop-close');
const statsBtn = document.getElementById('stats-btn');
const statsModal = document.getElementById('stats-modal');
const statsOverlay = document.getElementById('stats-overlay');
const statsClose = document.getElementById('stats-close');
const statsBody = document.getElementById('stats-body');

// Search state
let searchResultsList = [];
let currentSearchIndex = 0;

// File upload state
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const SUPPORTED_FILE_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'text/plain', 'text/markdown',
  'application/json',
  'text/javascript', 'application/javascript',
  'text/typescript', 'application/typescript',
  'text/x-python', 'text/x-c', 'text/x-c++',
  'text/csv'
];

// ==================== Message Status (Read Receipts) ====================

function updateMessageStatus(msgId, status) {
  messageStatusMap.set(msgId, { status, timestamp: Date.now() });

  const statusEl = document.querySelector(`[data-msg-id="${msgId}"] .message-status`);
  if (!statusEl) return;

  statusEl.className = `message-status status-${status}`;
  statusEl.innerHTML = getStatusIcon(status);
  statusEl.title = i18n.t(`status.${status}`);

  // For 'read' status, add a visual pulse effect
  if (status === 'read') {
    statusEl.classList.add('status-read-pulse');
    setTimeout(() => statusEl.classList.remove('status-read-pulse'), 1000);
  }
}

function getStatusIcon(status) {
  switch (status) {
    case 'sending':
      return `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M12 2a10 10 0 0 1 10 10"/>
      </svg>`;
    case 'sent':
      return `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="22" y1="2" x2="11" y2="13"/>
        <polygon points="22 2 15 22 11 13"/>
        <polygon points="22 2 15 22 11 13"/>
      </svg>`;
    case 'delivered':
      return `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="22" y1="2" x2="11" y2="13"/>
        <polygon points="22 2 15 22 11 13"/>
        <path d="M22 2l-7 20-4-9-9-4 20-7z"/>
      </svg>`;
    case 'read':
      return `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-5.58-5.59L16 8l-5.59 5.59L9 16.17z"/>
      </svg>`;
    case 'failed':
      return `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
      </svg>`;
    default:
      return '';
  }
}

// ==================== Agent Typing Indicator ====================

function showAgentTyping() {
  isAgentTyping = true;

  // Clear existing timeout
  if (typingTimeout) {
    clearTimeout(typingTimeout);
  }

  // Show typing indicator
  agentTypingEl.classList.remove('hidden');

  // Auto-hide after 30 seconds if no message arrives
  typingTimeout = setTimeout(() => {
    hideAgentTyping();
  }, 30000);

  // Scroll to bottom to show typing indicator
  const messagesEl = document.getElementById('messages');
  if (messagesEl) {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
}

function hideAgentTyping() {
  isAgentTyping = false;
  agentTypingEl.classList.add('hidden');

  if (typingTimeout) {
    clearTimeout(typingTimeout);
    typingTimeout = null;
  }
}

// ==================== Session Management ====================

function createNewSession() {
  const newSession = {
    id: `session_${Date.now()}`,
    name: i18n.t('session.newChat', { number: sessions.length + 1 }),
    messages: [],
    createdAt: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
  };

  sessions.unshift(newSession);
  currentSessionIndex = 0;
  saveSessions();
  renderSessionList();
  switchToSession(0);
  clearMessagesUI();

  if (window.innerWidth <= 768) {
    sessionSidebar.classList.remove('open');
  }

  messageInput.focus();
}

function switchToSession(index) {
  if (index < 0 || index >= sessions.length) return;

  currentSessionIndex = index;
  const session = sessions[index];

  // Update UI
  document.querySelectorAll('.session-item').forEach((el, i) => {
    el.classList.toggle('active', i === index);
  });

  // Clear and load messages
  clearMessagesUI();
  session.messages.forEach(msg => {
    displayMessage(msg.from, msg.content, msg.timestamp, false, msg.id);
  });

  if (session.messages.length > 0) {
    removeWelcomeMessage();
  }

  // Update header
  document.querySelector('.chat-header h1').textContent = session.name;
  scrollToBottom();

  // Save current session ID
  currentSessionId = session.id;

  if (window.innerWidth <= 768) {
    sessionSidebar.classList.remove('open');
  }
}

function deleteSession(index, event) {
  event.stopPropagation();

  if (sessions.length <= 1) {
    showToast(i18n.t('session.cannotDeleteLast'), 'error');
    return;
  }

  const deletedSession = sessions.splice(index, 1)[0];
  saveSessions();

  if (currentSessionIndex >= sessions.length) {
    currentSessionIndex = sessions.length - 1;
  }

  renderSessionList();
  switchToSession(currentSessionIndex);
  showToast(i18n.t('session.deleted'), 'success');
}

function renameSession(index, event) {
  event.stopPropagation();

  const session = sessions[index];
  const newName = prompt(i18n.t('session.rename'), session.name);

  if (newName && newName.trim()) {
    session.name = newName.trim();
    saveSessions();
    renderSessionList();

    if (currentSessionIndex === index) {
      document.querySelector('.chat-header h1').textContent = session.name;
    }
  }
}

function saveSessions() {
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.warn('Failed to save sessions:', e);
  }
}

function loadSessions() {
  try {
    const stored = localStorage.getItem(SESSIONS_KEY);
    sessions = stored ? JSON.parse(stored) : [];

    if (sessions.length === 0) {
      createNewSession();
    } else {
      renderSessionList();
      switchToSession(0);
    }
  } catch (e) {
    console.warn('Failed to load sessions:', e);
    sessions = [];
    createNewSession();
  }
}

function renderSessionList() {
  sessionList.innerHTML = '';

  sessions.forEach((session, index) => {
    const item = document.createElement('div');
    item.className = `session-item ${index === currentSessionIndex ? 'active' : ''}`;
    item.innerHTML = `
      <div class="session-info">
        <span class="session-name">${escapeHtml(session.name)}</span>
        <span class="session-time">${formatSessionTime(session.lastActivity)}</span>
      </div>
      <div class="session-actions">
        <button class="session-action-btn rename-btn" data-index="${index}" title="${i18n.t('session.rename')}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
        ${sessions.length > 1 ? `
          <button class="session-action-btn delete-btn" data-index="${index}" title="${i18n.t('session.delete')}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        ` : ''}
      </div>
    `;

    item.addEventListener('click', () => switchToSession(index));

    const renameBtn = item.querySelector('.rename-btn');
    const deleteBtn = item.querySelector('.delete-btn');

    if (renameBtn) {
      renameBtn.addEventListener('click', (e) => renameSession(index, e));
    }
    if (deleteBtn) {
      deleteBtn.addEventListener('click', (e) => deleteSession(index, e));
    }

    sessionList.appendChild(item);
  });
}

function formatSessionTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return i18n.currentLang === 'zh-CN' ? '刚刚' : 'Just now';
  if (diffMins < 60) return `${diffMins}${i18n.currentLang === 'zh-CN' ? '分钟前' : 'm ago'}`;
  if (diffHours < 24) return `${diffHours}${i18n.currentLang === 'zh-CN' ? '小时前' : 'h ago'}`;
  if (diffDays < 7) return `${diffDays}${i18n.currentLang === 'zh-CN' ? '天前' : 'd ago'}`;

  return date.toLocaleDateString();
}

function updateCurrentSessionActivity() {
  if (currentSessionIndex >= 0 && sessions[currentSessionIndex]) {
    sessions[currentSessionIndex].lastActivity = new Date().toISOString();
    saveSessions();
    renderSessionList();
  }
}

// ==================== Code Syntax Highlighting ====================

function highlightCode() {
  document.querySelectorAll('pre code').forEach((block) => {
    if (!block.dataset.highlighted) {
      hljs.highlightElement(block);
      block.dataset.highlighted = 'true';
    }
  });
}

// ==================== Message History ====================

function saveMessageToHistory(message) {
  if (currentSessionIndex >= 0 && sessions[currentSessionIndex]) {
    const msgWithStatus = {
      ...message,
      id: message.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'sent'
    };
    sessions[currentSessionIndex].messages.push(msgWithStatus);

    if (sessions[currentSessionIndex].messages.length > MAX_STORED_MESSAGES) {
      sessions[currentSessionIndex].messages.splice(
        0,
        sessions[currentSessionIndex].messages.length - MAX_STORED_MESSAGES
      );
    }

    saveSessions();
    updateCurrentSessionActivity();
  }
}

function getChatHistory() {
  if (currentSessionIndex >= 0 && sessions[currentSessionIndex]) {
    return sessions[currentSessionIndex].messages;
  }
  return [];
}

function clearChatHistory() {
  if (currentSessionIndex >= 0 && sessions[currentSessionIndex]) {
    sessions[currentSessionIndex].messages = [];
    saveSessions();
  }

  clearMessagesUI();
  showWelcomeMessage();
}

function clearMessagesUI() {
  const messages = messagesContainer.querySelectorAll('.message, .typing-indicator');
  messages.forEach(m => m.remove());
}

function loadChatHistory() {
  const history = getChatHistory();
  history.forEach(msg => {
    displayMessage(msg.from, msg.content, msg.timestamp, false, msg.id);
  });

  if (history.length > 0) {
    removeWelcomeMessage();
  }

  highlightCode();
  scrollToBottom();
}

function exportChatHistory() {
  const history = getChatHistory();
  if (history.length === 0) {
    showToast(i18n.t('messages.noMessages'), 'error');
    return;
  }

  const session = sessions[currentSessionIndex];
  let markdown = `# ${session.name}\n`;
  markdown += `# ${new Date().toISOString()}\n\n`;

  history.forEach(msg => {
    const role = msg.from === 'user' ? (i18n.currentLang === 'zh-CN' ? '你' : 'You') : assistantName;
    const time = formatTime(msg.timestamp);
    markdown += `## [${time}] ${role}\n${msg.content}\n\n`;
  });

  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${session.name.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().slice(0, 10)}.md`;
  a.click();
  URL.revokeObjectURL(url);
  showToast(i18n.t('messages.exported'), 'success');
}

// ==================== Message Operations ====================

function showMessageMenu(messageEl, content, from, msgId) {
  const existingMenu = document.querySelector('.message-menu');
  if (existingMenu) existingMenu.remove();

  const menu = document.createElement('div');
  menu.className = 'message-menu';
  menu.innerHTML = `
    <button data-action="copy">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
      ${i18n.t('messages.copy')}
    </button>
    ${from === 'user' ? `
      <button data-action="edit">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
        ${i18n.t('messages.edit')}
      </button>
    ` : `
      <button data-action="copy-code">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        Copy Code
      </button>
    `}
    <button data-action="delete">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      </svg>
      ${i18n.t('messages.delete')}
    </button>
  `;

  const rect = messageEl.getBoundingClientRect();
  menu.style.position = 'fixed';
  menu.style.top = `${rect.bottom + 5}px`;
  menu.style.right = `${window.innerWidth - rect.right}px`;

  document.body.appendChild(menu);

  menu.addEventListener('click', (e) => {
    const action = e.target.closest('button')?.dataset.action;
    if (!action) return;

    switch (action) {
      case 'copy':
        navigator.clipboard.writeText(content).then(() => {
          showToast(i18n.t('messages.copied'), 'success');
        });
        break;
      case 'copy-code':
        const code = messageEl.querySelector('code')?.textContent || content;
        navigator.clipboard.writeText(code).then(() => {
          showToast(i18n.t('messages.copied'), 'success');
        });
        break;
      case 'edit':
        messageInput.value = content;
        messageInput.focus();
        messageInput.setSelectionRange(content.length, content.length);
        break;
      case 'delete':
        if (confirm(i18n.t('messages.confirmDelete'))) {
          messageEl.remove();
          const history = getChatHistory();
          const idx = history.findIndex(m => m.id === msgId);
          if (idx >= 0) {
            sessions[currentSessionIndex].messages.splice(idx, 1);
            saveSessions();
          }
          showToast(i18n.t('messages.deleted'), 'success');
        }
        break;
    }

    menu.remove();
  });

  setTimeout(() => {
    document.addEventListener('click', function closeMenu(e) {
      if (!menu.contains(e.target)) {
        menu.remove();
        document.removeEventListener('click', closeMenu);
      }
    });
  }, 0);
}

function showToast(message, type = 'info') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${message}</span>
    <button class="toast-close">&times;</button>
  `;

  document.body.appendChild(toast);

  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  });

  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function showWelcomeMessage() {
  if (messagesContainer.querySelector('.welcome-message')) return;

  const welcome = document.createElement('div');
  welcome.className = 'welcome-message';
  welcome.innerHTML = `
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
    <p data-i18n="chat.welcome" data-i18n-vars='{"name": assistantName}'>Connected to <strong>${assistantName}</strong></p>
    <p data-i18n="chat.welcomeSubtitle">${i18n.t('chat.welcomeSubtitle')}</p>
  `;
  messagesContainer.appendChild(welcome);
}

// ==================== Connection Status Visualization ====================

function updateConnectionStatus(status, detail = '') {
  statusDot.className = 'status-dot';

  switch (status) {
    case 'connected':
      statusDot.classList.add('connected');
      statusText.textContent = i18n.t('chat.online');
      statusDetail.textContent = `· ${latency}ms`;
      connectionQuality?.classList.add('good');
      connectionQuality?.classList.remove('poor', 'medium');
      break;
    case 'disconnected':
      statusDot.classList.add('disconnected');
      statusText.textContent = i18n.t('chat.offline');
      statusDetail.textContent = detail || i18n.t('chat.connectionError');
      connectionQuality?.classList.remove('good', 'medium');
      connectionQuality?.classList.add('poor');
      break;
    case 'reconnecting':
      statusDot.classList.add('connecting');
      statusText.textContent = i18n.t('chat.reconnecting');
      statusDetail.textContent = `(${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`;
      connectionQuality?.classList.remove('good', 'poor');
      break;
    case 'failed':
      statusDot.classList.add('error');
      statusText.textContent = i18n.t('chat.connectionFailed');
      statusDetail.textContent = detail || '';
      connectionQuality?.classList.add('poor');
      break;
    default:
      statusText.textContent = i18n.t('auth.connecting');
      statusDetail.textContent = '';
  }
}

function updateLatency() {
  const now = Date.now();
  latency = now - lastPingTime;
  lastPingTime = now;

  if (isConnected) {
    statusDetail.textContent = `· ${latency}ms`;

    if (latency < 100) {
      connectionQuality?.classList.add('good');
      connectionQuality?.classList.remove('poor', 'medium');
    } else if (latency < 300) {
      connectionQuality?.classList.add('medium');
      connectionQuality?.classList.remove('good', 'poor');
    } else {
      connectionQuality?.classList.add('poor');
      connectionQuality?.classList.remove('good', 'medium');
    }
  }
}

// ==================== Theme Management ====================

const Theme = {
  STORAGE_KEY: 'nanoclaw_theme',

  init() {
    // Load saved theme or detect from system preference
    const savedTheme = localStorage.getItem(this.STORAGE_KEY);
    if (savedTheme) {
      this.set(savedTheme);
    } else {
      // Detect system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.set(prefersDark ? 'dark' : 'light');
    }

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(this.STORAGE_KEY)) {
        this.set(e.matches ? 'dark' : 'light');
      }
    });

    // Setup toggle button
    themeToggle?.addEventListener('click', () => this.toggle());
  },

  set(theme) {
    document.body.dataset.theme = theme;
    localStorage.setItem(this.STORAGE_KEY, theme);
    this.updateIcon(theme);
    this.updateHighlightJSTheme(theme);
  },

  toggle() {
    const currentTheme = document.body.dataset.theme || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    this.set(newTheme);
  },

  get() {
    return document.body.dataset.theme || 'dark';
  },

  updateIcon(theme) {
    const sunIcon = themeToggle?.querySelector('.theme-icon-sun');
    const moonIcon = themeToggle?.querySelector('.theme-icon-moon');

    if (theme === 'dark') {
      sunIcon?.classList.remove('hidden');
      moonIcon?.classList.add('hidden');
    } else {
      sunIcon?.classList.add('hidden');
      moonIcon?.classList.remove('hidden');
    }
  },

  updateHighlightJSTheme(theme) {
    const hljsTheme = document.getElementById('hljs-theme');
    if (hljsTheme) {
      hljsTheme.href = theme === 'dark'
        ? 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css'
        : 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css';
    }
  }
};

// ==================== Search ====================

const Search = {
  init() {
    searchToggleBtn?.addEventListener('click', () => this.toggle());
    searchClose?.addEventListener('click', () => this.close());
    searchInput?.addEventListener('input', (e) => this.performSearch(e.target.value));
    searchInput?.addEventListener('keydown', (e) => this.handleKeydown(e));

    // Keyboard shortcut: Ctrl+K
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.toggle();
      }
    });
  },

  toggle() {
    searchBar.classList.toggle('hidden');
    if (!searchBar.classList.contains('hidden')) {
      searchInput.focus();
    }
  },

  close() {
    searchBar.classList.add('hidden');
    searchInput.value = '';
    searchResults.innerHTML = '';
    searchResultsList = [];
  },

  performSearch(query) {
    if (!query.trim()) {
      searchResults.innerHTML = '';
      searchResultsList = [];
      return;
    }

    const allMessages = this.getAllMessages();
    searchResultsList = this.fuzzySearch(query, allMessages);
    this.renderResults();
  },

  getAllMessages() {
    const messages = [];
    sessions.forEach(session => {
      session.messages.forEach(msg => {
        messages.push({
          ...msg,
          sessionId: session.id,
          sessionName: session.name
        });
      });
    });
    return messages;
  },

  fuzzySearch(query, messages) {
    const lowerQuery = query.toLowerCase();
    return messages
      .map(msg => ({
        ...msg,
        score: this.calculateScore(lowerQuery, msg.content)
      }))
      .filter(msg => msg.score > 0)
      .sort((a, b) => b.score - a.score);
  },

  calculateScore(query, text) {
    const lowerText = text.toLowerCase();
    let score = 0;

    // Exact match gets highest score
    if (lowerText.includes(query)) {
      score += 100;
    }

    // Word boundary matches
    const words = query.split(/\s+/);
    words.forEach(word => {
      const regex = new RegExp(`\\b${word}`, 'i');
      if (regex.test(lowerText)) {
        score += 20;
      }
    });

    // Character proximity bonus
    let lastIndex = -1;
    let consecutive = 0;
    for (const char of query) {
      const index = lowerText.indexOf(char, lastIndex + 1);
      if (index !== -1) {
        consecutive++;
        if (consecutive > 1) {
          score += consecutive;
        }
        lastIndex = index;
      } else {
        consecutive = 0;
      }
    }

    return score;
  },

  renderResults() {
    if (searchResultsList.length === 0) {
      searchResults.innerHTML = `<div class="search-no-results">${i18n.t('search.noResults')}</div>`;
      return;
    }

    searchResults.innerHTML = `<div class="search-info">${i18n.t('search.results', { count: searchResultsList.length })}</div>`;

    searchResultsList.slice(0, 50).forEach((msg, index) => {
      const resultItem = document.createElement('div');
      resultItem.className = `search-result-item ${index === currentSearchIndex ? 'active' : ''}`;
      resultItem.innerHTML = `
        <div class="result-session">${escapeHtml(msg.sessionName)}</div>
        <div class="result-content">${this.highlightMatch(msg.content, searchInput.value)}</div>
        <div class="result-time">${formatTime(msg.timestamp)}</div>
      `;
      resultItem.addEventListener('click', () => this.jumpTo(msg, index));
      searchResults.appendChild(resultItem);
    });

    if (searchResultsList.length > 50) {
      const moreInfo = document.createElement('div');
      moreInfo.className = 'search-more-info';
      moreInfo.textContent = `+${searchResultsList.length - 50} more results`;
      searchResults.appendChild(moreInfo);
    }
  },

  highlightMatch(text, query) {
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    return escapeHtml(text).replace(regex, '<mark>$1</mark>');
  },

  handleKeydown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.navigate(1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.navigate(-1);
    } else if (e.key === 'Enter' && searchResultsList.length > 0) {
      e.preventDefault();
      const index = Math.min(currentSearchIndex, searchResultsList.length - 1);
      this.jumpTo(searchResultsList[index], index);
    } else if (e.key === 'Escape') {
      this.close();
    }
  },

  navigate(direction) {
    const maxIndex = Math.min(searchResultsList.length - 1, 49);
    currentSearchIndex = Math.max(0, Math.min(maxIndex, currentSearchIndex + direction));

    document.querySelectorAll('.search-result-item').forEach((item, index) => {
      item.classList.toggle('active', index === currentSearchIndex);
    });

    // Scroll active result into view
    const activeItem = searchResults.querySelector('.search-result-item.active');
    if (activeItem) {
      activeItem.scrollIntoView({ block: 'nearest' });
    }
  },

  jumpTo(msg, index) {
    // Find and switch to the session
    const sessionIndex = sessions.findIndex(s => s.id === msg.sessionId);
    if (sessionIndex !== -1) {
      switchToSession(sessionIndex);

      // Find and highlight the message
      setTimeout(() => {
        const messageEls = document.querySelectorAll('.message');
        messageEls.forEach(el => {
          el.classList.remove('search-highlight');
        });

        // Find the message by content and timestamp
        const targetMsg = Array.from(messageEls).find(el => {
          const content = el.querySelector('.message-bubble')?.textContent;
          return content === msg.content;
        });

        if (targetMsg) {
          targetMsg.classList.add('search-highlight');
          targetMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });

          // Remove highlight after a few seconds
          setTimeout(() => {
            targetMsg.classList.remove('search-highlight');
          }, 3000);
        }
      }, 100);
    }

    this.close();
  }
};

// ==================== File Upload ====================

const FileUpload = {
  init() {
    attachBtn?.addEventListener('click', () => this.openDropZone());
    fileDropClose?.addEventListener('click', () => this.closeDropZone());
    fileInput?.addEventListener('change', (e) => this.handleFileSelect(e));

    // Drag and drop on the drop zone
    fileDropZone?.addEventListener('dragover', (e) => {
      e.preventDefault();
      fileDropZone.classList.add('drag-over');
    });

    fileDropZone?.addEventListener('dragleave', (e) => {
      e.preventDefault();
      fileDropZone.classList.remove('drag-over');
    });

    fileDropZone?.addEventListener('drop', (e) => {
      e.preventDefault();
      fileDropZone.classList.remove('drag-over');
      this.handleFiles(e.dataTransfer.files);
    });

    // Click to open file dialog
    fileDropZone?.addEventListener('click', (e) => {
      if (e.target === fileDropZone || e.target.closest('.file-drop-content')) {
        fileInput?.click();
      }
    });

    // Keyboard shortcut: Ctrl+U
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault();
        this.openDropZone();
      }
    });
  },

  openDropZone() {
    fileDropZone.classList.remove('hidden');
  },

  closeDropZone() {
    fileDropZone.classList.add('hidden');
  },

  handleFileSelect(e) {
    this.handleFiles(e.target.files);
    e.target.value = ''; // Reset input
  },

  handleFiles(files) {
    Array.from(files).forEach(file => this.uploadFile(file));
  },

  validateFile(file) {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      showToast(i18n.t('upload.tooLarge'), 'error');
      return false;
    }

    // Check file type (basic check)
    const isValidType = SUPPORTED_FILE_TYPES.includes(file.type) ||
                        file.name.match(/\.(js|ts|py|json|md|txt|pdf|png|jpg|jpeg|gif|webp|csv)$/i);

    if (!isValidType) {
      showToast(i18n.t('upload.invalidType'), 'error');
      return false;
    }

    return true;
  },

  async uploadFile(file) {
    if (!this.validateFile(file)) return;
    if (!isConnected) {
      showToast(i18n.t('errors.notAuthenticated'), 'error');
      return;
    }

    showToast(i18n.t('upload.uploading'), 'info');

    try {
      const base64 = await this.readFileAsBase64(file);

      // Create a file message
      const fileMessage = {
        type: 'file',
        name: file.name,
        size: file.size,
        mimeType: file.type,
        data: base64
      };

      // Send via WebSocket
      sendWsMessage({
        type: 'message',
        content: JSON.stringify(fileMessage),
        fileType: file.name.split('.').pop(),
        fileName: file.name,
        fileSize: file.size
      });

      // Display locally
      const msgId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.displayFileMessage('user', file, base64, msgId);

      this.closeDropZone();
      showToast(i18n.t('upload.success'), 'success');
    } catch (error) {
      console.error('Upload error:', error);
      showToast(i18n.t('upload.error', { error: error.message }), 'error');
    }
  },

  readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Remove data URL prefix
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  displayFileMessage(from, file, base64, msgId) {
    removeWelcomeMessage();

    const messageEl = document.createElement('div');
    messageEl.className = `message ${from}`;
    if (msgId) {
      messageEl.dataset.msgId = msgId;
    }

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble file-bubble';

    if (file.type.startsWith('image/')) {
      bubble.innerHTML = `
        <div class="file-attachment">
          <img src="data:${file.type};base64,${base64}" alt="${escapeHtml(file.name)}" class="attached-image">
          <div class="file-name">${escapeHtml(file.name)}</div>
        </div>
      `;
    } else {
      const icon = this.getFileIcon(file.type);
      bubble.innerHTML = `
        <div class="file-attachment">
          <div class="file-icon">${icon}</div>
          <div class="file-info">
            <div class="file-name">${escapeHtml(file.name)}</div>
            <div class="file-size">${this.formatFileSize(file.size)}</div>
          </div>
        </div>
      `;
    }

    const messageFooter = document.createElement('div');
    messageFooter.className = 'message-footer';

    const timeEl = document.createElement('span');
    timeEl.className = 'message-time';
    timeEl.textContent = formatTime(new Date().toISOString());

    const statusEl = document.createElement('span');
    statusEl.className = 'message-status status-sending';
    if (msgId) {
      statusEl.setAttribute('data-msg-id', msgId);
      statusEl.innerHTML = getStatusIcon('sending');
      statusEl.title = i18n.t('status.sending');
    }

    messageFooter.appendChild(timeEl);
    if (msgId) {
      messageFooter.appendChild(statusEl);
    }

    const menuBtn = document.createElement('button');
    menuBtn.className = 'message-menu-btn';
    menuBtn.innerHTML = '⋮';
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showMessageMenu(messageEl, `[File: ${file.name}]`, from, msgId || '');
    });

    messageEl.appendChild(bubble);
    messageEl.appendChild(messageFooter);
    messageEl.appendChild(menuBtn);
    messagesContainer.appendChild(messageEl);

    saveMessageToHistory({
      from,
      content: `[File: ${file.name}]`,
      timestamp: new Date().toISOString(),
      id: msgId,
      file: { name: file.name, size: file.size, type: file.type }
    });

    scrollToBottom();
  },

  getFileIcon(mimeType) {
    if (mimeType.includes('pdf')) {
      return `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <text x="7" y="18" font-size="8" fill="currentColor">PDF</text>
      </svg>`;
    } else if (mimeType.includes('javascript') || mimeType.includes('json')) {
      return `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="16 18 22 12 16 6"></polyline>
        <polyline points="8 6 2 12 8 18"></polyline>
      </svg>`;
    } else if (mimeType.includes('python')) {
      return `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
      </svg>`;
    } else {
      return `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
      </svg>`;
    }
  },

  formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
};

// ==================== Statistics ====================

const Statistics = {
  init() {
    statsBtn?.addEventListener('click', () => this.show());
    statsOverlay?.addEventListener('click', () => this.close());
    statsClose?.addEventListener('click', () => this.close());

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !statsModal.classList.contains('hidden')) {
        this.close();
      }
    });
  },

  show() {
    const stats = this.calculate();
    this.render(stats);
    statsModal.classList.remove('hidden');
  },

  close() {
    statsModal.classList.add('hidden');
  },

  calculate() {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    let totalMessages = 0;
    let userMessages = 0;
    let assistantMessages = 0;
    const dailyActivity = {};

    // Initialize daily activity
    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo);
      date.setDate(date.getDate() + i);
      const key = date.toISOString().split('T')[0];
      dailyActivity[key] = { user: 0, assistant: 0 };
    }

    sessions.forEach(session => {
      session.messages.forEach(msg => {
        totalMessages++;
        if (msg.from === 'user') {
          userMessages++;
        } else {
          assistantMessages++;
        }

        // Track daily activity
        const msgDate = new Date(msg.timestamp).toISOString().split('T')[0];
        if (dailyActivity[msgDate]) {
          if (msg.from === 'user') {
            dailyActivity[msgDate].user++;
          } else {
            dailyActivity[msgDate].assistant++;
          }
        }
      });
    });

    // Calculate response times (rough estimate)
    let totalResponseTime = 0;
    let responseCount = 0;

    sessions.forEach(session => {
      const messages = session.messages;
      for (let i = 1; i < messages.length; i++) {
        if (messages[i - 1].from === 'user' && messages[i].from === 'assistant') {
          const time1 = new Date(messages[i - 1].timestamp).getTime();
          const time2 = new Date(messages[i].timestamp).getTime();
          totalResponseTime += (time2 - time1);
          responseCount++;
        }
      }
    });

    const avgResponseTime = responseCount > 0
      ? Math.round(totalResponseTime / responseCount / 1000)
      : 0;

    return {
      totalMessages,
      userMessages,
      assistantMessages,
      totalSessions: sessions.length,
      activeSession: sessions[currentSessionIndex]?.name || i18n.t('stats.noData'),
      avgResponseTime,
      dailyActivity
    };
  },

  render(stats) {
    statsBody.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${stats.totalMessages}</div>
          <div class="stat-label">${i18n.t('stats.totalMessages')}</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.userMessages}</div>
          <div class="stat-label">${i18n.t('stats.userMessages')}</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.assistantMessages}</div>
          <div class="stat-label">${i18n.t('stats.assistantMessages')}</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.totalSessions}</div>
          <div class="stat-label">${i18n.t('stats.totalSessions')}</div>
        </div>
      </div>

      <div class="stat-row">
        <div class="stat-info">
          <div class="stat-info-label">${i18n.t('stats.activeSession')}</div>
          <div class="stat-info-value">${escapeHtml(stats.activeSession)}</div>
        </div>
        <div class="stat-info">
          <div class="stat-info-label">${i18n.t('stats.avgResponseTime')}</div>
          <div class="stat-info-value">${stats.avgResponseTime > 0 ? stats.avgResponseTime + 's' : i18n.t('stats.noData')}</div>
        </div>
      </div>

      <div class="stats-chart-container">
        <h3>${i18n.t('stats.activityChart')}</h3>
        <div class="stats-chart">
          ${this.renderActivityChart(stats.dailyActivity)}
        </div>
        <div class="chart-legend">
          <div class="legend-item">
            <span class="legend-color user"></span>
            <span>${i18n.t('stats.userMessages')}</span>
          </div>
          <div class="legend-item">
            <span class="legend-color assistant"></span>
            <span>${i18n.t('stats.assistantMessages')}</span>
          </div>
        </div>
      </div>
    `;
  },

  renderActivityChart(dailyActivity) {
    const entries = Object.entries(dailyActivity);
    const maxValue = Math.max(
      ...entries.map(([, data]) => Math.max(data.user, data.assistant)),
      1
    );

    return entries.map(([date, data]) => {
      const userHeight = (data.user / maxValue) * 100;
      const assistantHeight = (data.assistant / maxValue) * 100;
      const displayDate = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });

      return `
        <div class="chart-bar-container">
          <div class="chart-bars">
            <div class="chart-bar user" style="height: ${userHeight}%" title="${data.user} user messages"></div>
            <div class="chart-bar assistant" style="height: ${assistantHeight}%" title="${data.assistant} assistant messages"></div>
          </div>
          <div class="chart-label">${displayDate}</div>
        </div>
      `;
    }).join('');
  }
};

// ==================== Initialize ====================

async function init() {
  // Load i18n translations
  await i18n.loadTranslations('en');
  await i18n.loadTranslations('zh-CN');
  await i18n.setLanguage(i18n.currentLang);

  // Initialize theme
  Theme.init();

  // Check for stored auth token
  const hasStoredToken = localStorage.getItem('nanoclaw_auth_token');
  if (hasStoredToken) {
    authTokenInput.value = hasStoredToken;
    tokenInputContainer.classList.add('hidden');
  }

  // Event listeners
  authForm.addEventListener('submit', handleAuth);
  messageForm.addEventListener('submit', handleMessage);

  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleMessage(e);
    }
  });

  // Session management
  newChatBtn?.addEventListener('click', createNewSession);

  toggleSidebarBtn?.addEventListener('click', () => {
    sessionSidebar.classList.toggle('open');
  });

  // Language selection on auth screen
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const lang = btn.dataset.lang;
      await i18n.setLanguage(lang);
    });
  });

  // Language toggle in header
  langToggle?.addEventListener('click', async () => {
    const newLang = i18n.currentLang === 'en' ? 'zh-CN' : 'en';
    await i18n.setLanguage(newLang);
  });

  // Initialize new features
  Search.init();
  FileUpload.init();
  Statistics.init();

  // Close sidebar when clicking outside on mobile
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 &&
        sessionSidebar.classList.contains('open') &&
        !sessionSidebar.contains(e.target) &&
        !toggleSidebarBtn.contains(e.target)) {
      sessionSidebar.classList.remove('open');
    }
  });

  // Add header buttons
  setupHeaderButtons();
}

function updateHeaderButtons() {
  // Update button texts when language changes
  const exportBtn = document.getElementById('export-btn');
  const clearBtn = document.getElementById('clear-btn');
  if (exportBtn) {
    exportBtn.querySelector('span').textContent = i18n.t('chat.export');
  }
  if (clearBtn) {
    clearBtn.querySelector('span').textContent = i18n.t('chat.clear');
  }
}

function setupHeaderButtons() {
  const headerRight = document.querySelector('.header-right');

  // Clear existing dynamic buttons
  const existingBtns = headerRight.querySelectorAll('#export-btn, #clear-btn');
  existingBtns.forEach(btn => btn.remove());

  const exportBtn = document.createElement('button');
  exportBtn.className = 'header-btn';
  exportBtn.id = 'export-btn';
  exportBtn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7 10 12 15 17 10"></polyline>
      <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
    <span>${i18n.t('chat.export')}</span>
  `;
  exportBtn.addEventListener('click', exportChatHistory);

  const clearBtn = document.createElement('button');
  clearBtn.className = 'header-btn';
  clearBtn.id = 'clear-btn';
  clearBtn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
    <span>${i18n.t('chat.clear')}</span>
  `;
  clearBtn.addEventListener('click', () => {
    if (confirm(i18n.t('messages.confirmClear'))) {
      clearChatHistory();
      showToast(i18n.t('session.cleared'), 'success');
    }
  });

  headerRight.appendChild(exportBtn);
  headerRight.appendChild(clearBtn);
}

// ==================== WebSocket Connection ====================

function connectWebSocket(token) {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/ws`;

  updateConnectionStatus('connecting');

  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    reconnectAttempts = 0;
    lastPingTime = Date.now();
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    handleWsMessage(data);
  };

  ws.onclose = () => {
    isConnected = false;
    updateConnectionStatus('disconnected');

    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++;
      updateConnectionStatus('reconnecting');
      setTimeout(() => connectWebSocket(token), RECONNECT_DELAY);
    } else {
      updateConnectionStatus('failed');
      showAuthError(i18n.t('errors.connectionLost'));
    }
  };

  ws.onerror = () => {
    updateConnectionStatus('disconnected');
  };
}

// ==================== Handle WebSocket Messages ====================

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
      hideAgentTyping();
      displayMessage(data.from, data.content, data.timestamp, true);
      // Mark user message as read when assistant replies
      markUserMessagesAsRead();
      break;

    case 'typing':
      showAgentTyping();
      break;

    case 'pong':
      updateLatency();
      break;

    case 'receipt':
      if (data.messageId && data.status) {
        updateMessageStatus(data.messageId, data.status);
      }
      break;

    case 'error':
      const errorMsg = data.message || i18n.t('errors.unknownMessageType');
      showAuthError(errorMsg);
      break;
  }
}

// ==================== Mark messages as read ====================

function markUserMessagesAsRead() {
  // Mark all user messages as read when agent responds
  document.querySelectorAll('.message.user .message-status[data-msg-id]').forEach(statusEl => {
    const msgId = statusEl.getAttribute('data-msg-id');
    if (msgId && messageStatusMap.get(msgId)?.status !== 'read') {
      updateMessageStatus(msgId, 'read');
    }
  });
}

// ==================== Authentication ====================

function handleAuth(e) {
  e.preventDefault();

  const token = authTokenInput.value.trim();

  if (token) {
    localStorage.setItem('nanoclaw_auth_token', token);
  }

  clearAuthError();
  connectBtn.textContent = i18n.t('auth.connecting');
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

    authScreen.classList.add('hidden');
    chatScreen.classList.remove('hidden');

    messageInput.disabled = false;
    sendBtn.disabled = false;
    messageInput.focus();

    // Load sessions
    loadSessions();
  } else {
    showAuthError(data.error || i18n.t('auth.invalidToken'));
    connectBtn.textContent = i18n.t('auth.connectBtn');
    connectBtn.disabled = false;
    ws?.close();
  }
}

// ==================== Send Message ====================

function handleMessage(e) {
  e.preventDefault();

  const content = messageInput.value.trim();
  if (!content || !isConnected) return;

  const msgId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  displayMessage('user', content, new Date().toISOString(), true, msgId);
  messageInput.value = '';

  sendWsMessage({
    type: 'message',
    content,
    id: msgId,
  });

  showAgentTyping();
  scrollToBottom();
}

function sendWsMessage(data) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

// ==================== Display Messages ====================

function displayMessage(from, content, timestamp, save = true, msgId) {
  removeWelcomeMessage();

  const messageEl = document.createElement('div');
  messageEl.className = `message ${from}`;
  if (msgId) {
    messageEl.dataset.msgId = msgId;
  }

  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';

  if (from === 'assistant') {
    bubble.innerHTML = formatMessage(content);
  } else {
    bubble.textContent = content;
  }

  const messageFooter = document.createElement('div');
  messageFooter.className = 'message-footer';

  const timeEl = document.createElement('span');
  timeEl.className = 'message-time';
  timeEl.textContent = formatTime(timestamp);

  const statusEl = document.createElement('span');
  statusEl.className = 'message-status status-sending';

  // Add status indicator for user messages
  if (from === 'user' && msgId) {
    statusEl.setAttribute('data-msg-id', msgId);
    statusEl.innerHTML = getStatusIcon('sending');
    statusEl.title = i18n.t('status.sending');
  }

  messageFooter.appendChild(timeEl);
  if (from === 'user' && msgId) {
    messageFooter.appendChild(statusEl);
  }

  const menuBtn = document.createElement('button');
  menuBtn.className = 'message-menu-btn';
  menuBtn.innerHTML = '⋮';
  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showMessageMenu(messageEl, content, from, msgId || '');
  });

  messageEl.appendChild(bubble);
  messageEl.appendChild(messageFooter);
  messageEl.appendChild(menuBtn);
  messagesContainer.appendChild(messageEl);

  if (save) {
    saveMessageToHistory({ from, content, timestamp, id: msgId });
  }

  // Highlight code blocks after adding to DOM
  if (from === 'assistant') {
    requestAnimationFrame(() => {
      highlightCode();
      scrollToBottom();
    });
  } else {
    scrollToBottom();
  }
}

function formatMessage(content) {
  // Escape HTML first
  let formatted = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Code blocks with syntax highlighting
  formatted = formatted.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    const language = lang || 'plaintext';
    return `<pre><code class="language-${language}">${escapeHtml(code)}</code></pre>`;
  });

  // Inline code
  formatted = formatted.replace(/`([^`\n]+)`/g, '<code>$1</code>');

  // Bold
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Italic
  formatted = formatted.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Strikethrough
  formatted = formatted.replace(/~~([^~]+)~~/g, '<del>$1</del>');

  // Links
  formatted = formatted.replace(/(\[([^\]]+)\]\(([)]+)\))/g, '<a href="$3" target="_blank" rel="noopener">$2</a>');
  formatted = formatted.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');

  // Line breaks and paragraphs
  const paragraphs = formatted.split('\n\n');
  formatted = paragraphs.map(para => {
    if (para.startsWith('<pre>')) return para;
    return `<p>${para.replace(/\n/g, '<br>')}</p>`;
  }).join('');

  return formatted;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
}

// ==================== Typing Indicator ====================

function showTypingIndicator() {
  // Old typing indicator (for user messages)
}

function removeTypingIndicator() {
  const indicator = document.getElementById('typing-indicator');
  if (indicator) {
    indicator.remove();
  }
}

// ==================== UI Helpers ====================

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

// ==================== Keep-alive with latency tracking ====================

setInterval(() => {
  if (isConnected) {
    lastPingTime = Date.now();
    sendWsMessage({ type: 'ping' });
  }
}, 30000);

// ==================== Start ====================
init();
