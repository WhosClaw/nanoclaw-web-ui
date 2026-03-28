# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- `Dockerfile`: multi-stage build using `node:20-alpine` for lean production images
- `docker-compose.yml` for straightforward local and production deployments
- `.dockerignore` to exclude `node_modules/`, `dist/`, `.git/`, and secrets from build context
- `.env.example` documenting all supported environment variables with defaults
- `HEALTHCHECK` in both Dockerfile and docker-compose using `/api/health`
- Container runs as non-root user (`appuser`) for improved security
- `/api/health` response now includes a `version` field read from `package.json`
- Version displayed in the UI (service info panel and settings) is now populated dynamically from the API

### Fixed
- Docker section in README now includes the required `WEB_UI_HOST=0.0.0.0` environment
  variable, which was previously missing and would cause containers to refuse all connections
- Settings panel displayed hardcoded version `1.1.0` instead of the actual running version

## [1.2.2] - 2026-03-11

### Security
- Changed default host binding from `0.0.0.0` to `localhost` to prevent unintended exposure
  on all network interfaces when authentication is not configured
- Added `WEB_UI_HOST` environment variable to allow explicit override (set to `0.0.0.0` with
  `WEB_UI_AUTH_TOKEN` when external access is required)

## [1.2.1] - 2026-03-03

### Added
- Version compatibility table (Web UI ↔ NanoClaw) in README
- Link to Chinese README (`README_zh-hans.md`)

### Changed
- User message text color changed to white on blue background for improved readability
- Attachment button icon simplified to `+` (plus sign)
- Attachment button reduced to 32×32px for a cleaner appearance

## [1.2.0] - 2026-03-03

### Added
- Settings modal with language and theme switching
- GitHub repository link in sidebar
- Logo displayed in auth screen top-left corner
- Logo and app name moved to sidebar top
- Screenshot added to `docs/`
- `CONTRIBUTING.md` development and contribution guide
- Chinese README (`README_zh-hans.md`)

### Changed
- README streamlined significantly (339 → 170 lines)
- GitHub links updated to correct URLs

### Fixed
- Null reference error with `assistantNameEl`
- Text color in light mode for settings menu
- i18n rendering with HTML content

## [1.1.0] - 2026-03-02

### 🎉 Feature Release - Production Ready

This release transforms NanoClaw Web UI into a feature-complete, production-ready chat interface with 95% functionality coverage.

### Added

#### Session Management
- Multi-session support with create, switch, rename, and delete operations
- Persistent session storage using LocalStorage (up to 500 messages per session)
- Session sidebar with visual activity indicators
- Session time formatting (Just now, X mins/hours/days ago)

#### Code Syntax Highlighting
- Integration with highlight.js (GitHub Dark theme)
- Support for 180+ programming languages
- Automatic code block detection and formatting
- Dedicated "Copy Code" button for code messages

#### Connection Status Visualization
- Real-time latency display (ms)
- Connection quality indicator (Excellent/Good/Fair/Poor)
- Visual status animations (connecting, connected, error states)
- Auto-reconnect with progress indicator

#### Typing Indicators
- Agent typing status display with animated dots
- Automatic timeout after 30 seconds
- Smooth scroll to show typing indicator

#### Message Read Receipts
- Five status states: sending → sent → delivered → read → failed
- Visual icons and status text for each state
- Pulse animation for read receipts
- Per-message status tracking

#### Internationalization (i18n)
- Complete English and Simplified Chinese translations
- Language selector on auth screen and toggle in header
- Persistent language preference
- Dynamic UI text updates without page reload

#### Message Search
- Global fuzzy search across all sessions
- Intelligent scoring algorithm (exact match > word boundary > character proximity)
- Keyboard navigation (↑↓ arrows, Enter to jump)
- Search result highlighting with visual feedback
- Keyboard shortcut: `Ctrl+K` / `Cmd+K`

#### File Upload
- Drag-and-drop file upload zone
- Support for images (JPEG, PNG, GIF, WebP), PDF, and code files
- File validation (10MB max, type checking)
- Inline image preview
- Base64 encoding for WebSocket transmission
- Keyboard shortcut: `Ctrl+U` / `Cmd+U`

#### Dark/Light Theme Toggle
- One-click theme switching
- Persistent theme storage in LocalStorage
- Automatic highlight.js theme synchronization
- System theme detection as fallback
- Sun/moon icon indicators
- Keyboard shortcut: `Ctrl+T` / `Cmd+T`

#### Usage Statistics
- Message counts by type (user/assistant)
- 7-day activity bar chart
- Average response time calculation
- Session count and current session info
- Visual chart with legend

#### Message Operations
- Copy message content to clipboard
- Edit user messages (populates input field)
- Delete messages with confirmation
- Export chat history to Markdown
- Clear session messages

#### Keyboard Shortcuts
- `Ctrl+K` - Open search bar
- `Ctrl+U` - Open file upload
- `Ctrl+T` - Toggle theme
- `Shift+Enter` - New line in input

### Changed
- Enhanced message formatting with improved markdown support
- Improved mobile responsiveness for all new features
- Optimized LocalStorage management with message limits
- Enhanced error handling and user feedback

### Fixed
- Message duplication issue (removed server-side echo)
- Session state persistence across page refreshes

### Performance
- Efficient search algorithm handling 500+ messages
- Lazy-loaded syntax highlighting
- Optimized DOM manipulation for large chat histories

### Documentation
- Updated README with all new features
- Complete API documentation
- Keyboard shortcuts reference

## [1.0.0] - 2026-03-02

### Added
- Initial release of NanoClaw Web UI
- Real-time WebSocket communication
- Optional token-based authentication
- Mobile-responsive dark theme UI
- Markdown support for bot responses
- Auto-reconnect on connection loss
- Health check and session info API endpoints
- Broadcast and direct messaging APIs

## [1.0.0] - 2026-03-02

### Added
- Initial stable release
- Express.js HTTP server with static file serving
- WebSocket server for real-time bidirectional communication
- Session management with authentication support
- RESTful API endpoints for health, session info, broadcast, and direct messaging
- Responsive web UI with dark theme
- Vanilla JavaScript frontend (no framework dependencies)
- TypeScript support with full type definitions
- Comprehensive documentation and examples

### Security
- Token-based authentication option
- Custom authentication callback support
- WebSocket connection validation

### Documentation
- Full README with API documentation
- Integration examples
- Contributing guidelines
- MIT License
