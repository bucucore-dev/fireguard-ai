# Contributing to FireGuard AI

Thank you for your interest in contributing to FireGuard AI! This document provides guidelines and instructions for contributing.

## 🤝 Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- Git
- Basic knowledge of TypeScript, React, and Next.js

### Setup Development Environment

```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/YOUR_USERNAME/FireGuardAI.git
cd FireGuardAI

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/FireGuardAI.git

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Initialize database
npm run db:push

# Start development server
npm run dev
```

## 📝 How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/yourusername/FireGuardAI/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, Node version, etc.)

### Suggesting Features

1. Check [Discussions](https://github.com/yourusername/FireGuardAI/discussions) for similar ideas
2. Create a new discussion with:
   - Clear description of the feature
   - Use cases and benefits
   - Possible implementation approach

### Pull Requests

1. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

2. **Make your changes**
   - Write clean, readable code
   - Follow existing code style
   - Add comments for complex logic
   - Update documentation if needed

3. **Test your changes**
   ```bash
   # Run linter
   npm run lint
   
   # Test build
   npm run build
   
   # Test with different databases
   # SQLite (default)
   npm run dev
   
   # PostgreSQL (if available)
   # Update .env and test
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```
   
   Use conventional commits:
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `style:` - Code style changes (formatting)
   - `refactor:` - Code refactoring
   - `test:` - Adding tests
   - `chore:` - Maintenance tasks

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   
   Then create a Pull Request on GitHub with:
   - Clear title and description
   - Reference related issues
   - Screenshots/videos if UI changes
   - Checklist of changes

## 🎨 Code Style

### TypeScript
- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid `any` type when possible

### React Components
- Use functional components with hooks
- Keep components small and focused
- Use proper prop types

### File Structure
```
src/
├── app/              # Next.js app router
│   ├── api/         # API routes
│   └── ...
├── components/       # React components
│   ├── ui/          # Reusable UI components
│   └── ...
├── lib/             # Utility functions
├── types/           # TypeScript types
└── stores/          # State management
```

### Naming Conventions
- Components: `PascalCase` (e.g., `DeviceCard.tsx`)
- Functions: `camelCase` (e.g., `fetchDevices`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `API_BASE_URL`)
- Files: `kebab-case` (e.g., `device-detail.tsx`)

## 🗄️ Database Changes

### Adding New Models

1. Update `prisma/schema.prisma`
2. Create migration:
   ```bash
   npm run db:migrate
   ```
3. Update TypeScript types in `src/types/index.ts`
4. Update API routes if needed

### Testing Database Changes

Test with both SQLite and PostgreSQL:

```bash
# SQLite
DATABASE_URL="file:./prisma/db/test.db" npm run db:push

# PostgreSQL
DATABASE_URL="postgresql://..." npm run db:migrate
```

## 🧪 Testing

Currently, we don't have automated tests, but you should:
- Manually test all affected features
- Test on different screen sizes
- Test with different databases
- Test ESP32 integration if applicable

## 📚 Documentation

When adding features:
- Update README.md if needed
- Update DEPLOYMENT.md for deployment changes
- Add inline code comments
- Update API documentation

## 🐛 Debugging

### Common Issues

**Database errors:**
```bash
# Reset database
npm run db:reset

# Regenerate Prisma client
npm run db:generate
```

**Build errors:**
```bash
# Clean build
rm -rf .next
npm run build
```

**Port conflicts:**
```bash
# Change port in package.json
"dev": "next dev -p 3001"
```

## 🔍 Review Process

1. Maintainers will review your PR
2. Address any requested changes
3. Once approved, your PR will be merged
4. Your contribution will be credited

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You!

Every contribution, no matter how small, is valuable and appreciated!

## 📧 Questions?

- Open a [Discussion](https://github.com/yourusername/FireGuardAI/discussions)
- Create an [Issue](https://github.com/yourusername/FireGuardAI/issues)
- Contact maintainers

---

Happy Contributing! 🎉
