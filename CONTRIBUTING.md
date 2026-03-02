# Contributing to NanoClaw Web UI

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/nanoclaw-web-ui.git
   cd nanoclaw-web-ui
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run in development mode**
   ```bash
   npm run dev
   ```

4. **Make your changes**

5. **Build and test**
   ```bash
   npm run build
   npm start
   ```

## Code Style

- Use TypeScript for all source files
- Follow existing code formatting (run `npm run format` before committing)
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

## Making Changes

1. Create a new branch for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit them:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

3. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Create a Pull Request on GitHub

## Commit Message Convention

We follow conventional commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:
```
feat: add file upload support
fix: prevent message duplication
docs: update API documentation
```

## Testing

Before submitting a PR, please:

1. Test the Web UI manually in multiple browsers
2. Test on mobile devices (responsive design)
3. Test WebSocket reconnection
4. Test with and without authentication
5. Verify no console errors

## Reporting Issues

When reporting issues, please include:

- **Description**: Clear description of the problem
- **Steps to reproduce**: How to recreate the issue
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Environment**: Browser, OS, Node version
- **Screenshots**: If applicable

## Feature Requests

We welcome feature requests! Please:

1. Check existing issues first
2. Describe the use case clearly
3. Explain why it would be useful
4. Consider if it fits the project scope

## Project Structure

```
nanoclaw-web-ui/
├── src/
│   └── index.ts          # Main server code
├── public/
│   ├── index.html        # Main HTML page
│   ├── css/
│   │   └── styles.css    # Styles
│   └── js/
│       └── app.js        # Frontend logic
├── docs/                 # Documentation
├── package.json
├── tsconfig.json
└── README.md
```

## Questions?

Feel free to open an issue with the `question` label.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
