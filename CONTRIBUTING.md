# Contributing to Tinycardo API

We love your input! We want to make contributing to Tinycardo API as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- Docker
- Yarn package manager
- Git

### Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:

   ```bash
   git clone https://github.com/marques-kevin/api.tinycardo.com.git
   cd api.tinycardo.com
   ```

3. **Add upstream remote**:

   ```bash
   git remote add upstream https://github.com/originalowner/api.tinycardo.com.git
   ```

4. **Install dependencies**:

   ```bash
   yarn install
   ```

5. **Set up environment**:

   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

6. **Set up database**:

   ```bash
   createdb tinycardo_dev
   createdb tinycardo_test
   yarn migration:run
   ```

7. **Verify setup**:
   ```bash
   yarn test
   yarn start
   ```

## 🏗️ Development Workflow

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```bash
feat(cards): add bulk card import functionality
fix(auth): resolve JWT token expiration handling
docs: update API authentication guide
test(decks): add integration tests for deck sharing
```

### Code Style Guidelines

We use automated tools to maintain code quality:

- **ESLint**: Linting and code quality rules
- **Prettier**: Code formatting
- **TypeScript**: Type safety and documentation

**Before committing, always run:**

```bash
yarn lint          # Check and fix linting issues
yarn format        # Format code
yarn typecheck     # Verify TypeScript types
yarn test          # Run all tests
```

### API Design Guidelines

1. **RESTful Principles**
   - Use appropriate HTTP methods (GET, POST, PUT, DELETE)
   - Use meaningful resource names in URLs
   - Return consistent status codes

2. **Error Handling**
   - Use appropriate HTTP status codes
   - Provide clear, actionable error messages
   - Include error codes for programmatic handling

3. **Validation**
   - Validate all input using DTOs and class-validator
   - Provide meaningful validation error messages
   - Sanitize input data

4. **Documentation**
   - Add Swagger decorators to all endpoints
   - Include request/response examples
   - Document error responses

### Database Guidelines

1. **Migrations**
   - Always create migrations for schema changes
   - Test migrations both up and down
   - Use descriptive migration names

2. **Entities**
   - Follow naming conventions (PascalCase for classes, snake_case for columns)
   - Add proper indexes for performance
   - Use appropriate data types

## 🧪 Testing

### Test Categories

1. **Unit Tests** (`*.unit.spec.ts`)
   - Test individual functions/methods
   - Mock external dependencies
   - Fast execution

2. **Integration Tests** (`*.int.spec.ts`)
   - Test API endpoints end-to-end
   - Use test database
   - Real database interactions

### Writing Tests

- **Test file location**: Place tests next to the code they test
- **Test naming**: Use descriptive test names
- **Test structure**: Follow AAA pattern (Arrange, Act, Assert)
- **Coverage**: Aim for high test coverage, especially for critical paths

**Example test structure:**

```typescript
describe('DeckController', () => {
  describe('createDeck', () => {
    it('should create a new deck with valid data', async () => {
      // Arrange
      const createDeckDto = { title: 'Test Deck' };

      // Act
      const result = await controller.createDeck(createDeckDto, user);

      // Assert
      expect(result.title).toBe('Test Deck');
      expect(result.userId).toBe(user.id);
    });
  });
});
```

### Running Tests

```bash
# Run all tests
yarn test

# Run specific test file
yarn test deck.controller.spec.ts

# Run tests in watch mode
yarn test:unit:watch

# Run tests with coverage
yarn test --coverage
```

## 📝 Pull Request Process

### Before Submitting

1. **Update your branch** with the latest changes:

   ```bash
   git checkout main
   git pull upstream main
   git checkout your-feature-branch
   git rebase main
   ```

2. **Run the checklist**:
   - [ ] Tests pass (`yarn test`)
   - [ ] Code is formatted (`yarn format`)
   - [ ] No linting errors (`yarn lint`)
   - [ ] TypeScript compiles (`yarn typecheck`)
   - [ ] Database migrations work (if applicable)
   - [ ] Documentation updated (if applicable)

### Creating a Pull Request

1. **Push your branch** to your fork:

   ```bash
   git push origin your-feature-branch
   ```

2. **Open a Pull Request** on GitHub with:
   - Clear title summarizing the change
   - Detailed description of what changed and why
   - Reference any related issues
   - Migration notes (if database changes)

### Pull Request Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## How to Test

1. Steps to test the changes
2. Expected behavior

## Checklist

- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes
- [ ] Database migrations included (if needed)
```

### Review Process

1. **Automated checks** must pass (CI/CD pipeline)
2. **At least one reviewer** must approve
3. **All conversations** must be resolved
4. **Merge conflicts** must be resolved

## 🐛 Bug Reports

When filing a bug report, include:

1. **Environment details** (Node.js version, OS, database version)
2. **Steps to reproduce** the bug
3. **Expected behavior** vs **actual behavior**
4. **Error messages** or logs
5. **Screenshots** (if applicable)

Use our [bug report template](https://github.com/marques-kevin/api.tinycardo.com/issues/new?template=bug_report.md).

## 💡 Feature Requests

For feature requests, include:

1. **Problem description** - What problem does this solve?
2. **Proposed solution** - How should it work?
3. **Alternative solutions** - What other approaches did you consider?
4. **Use cases** - Who would benefit from this feature?

Use our [feature request template](https://github.com/marques-kevin/api.tinycardo.com/issues/new?template=feature_request.md).

## 🏷️ Issue Labels

We use labels to organize issues:

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `documentation` - Documentation improvements
- `question` - Further information is requested
- `wontfix` - This will not be worked on

## 💬 Community Guidelines

Please follow our [Code of Conduct](CODE_OF_CONDUCT.md) in all interactions.

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and community discussions
- **Pull Request Reviews**: Code-specific discussions

### Getting Help

- Check existing [issues](https://github.com/marques-kevin/api.tinycardo.com/issues) and [discussions](https://github.com/marques-kevin/api.tinycardo.com/discussions)
- Read the [documentation](README.md)
- Ask in [GitHub Discussions](https://github.com/marques-kevin/api.tinycardo.com/discussions)

## 🎉 Recognition

Contributors are recognized in:

- [Contributors section](https://github.com/marques-kevin/api.tinycardo.com/graphs/contributors) on GitHub
- Release notes for significant contributions
- Special recognition in README for major features

## 📞 Questions?

Don't hesitate to ask questions! We're here to help:

- Open a [Discussion](https://github.com/marques-kevin/api.tinycardo.com/discussions)
- Comment on relevant issues
- Reach out to maintainers

Thank you for contributing to Tinycardo API! 🙏
