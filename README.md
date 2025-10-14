# Tinycardo API 🎯

> A modern, scalable REST API for flashcard learning and spaced repetition, built with NestJS and TypeScript.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.0+-red)](https://nestjs.com/)

## 📖 About

Tinycardo API powers intelligent flashcard learning experiences with spaced repetition algorithms. Built for developers who want to integrate flashcard functionality into their applications, or for students and educators who need a robust backend for learning management systems.

### ✨ Features

- 🃏 **Deck & Card Management** - Create, organize, and manage flashcard collections
- 🧠 **Spaced Repetition** - Intelligent scheduling based on learning algorithms
- 🔐 **Authentication & Authorization** - Secure JWT-based user management
- 📊 **Learning Analytics** - Track progress, streaks, and performance metrics
- 🗃️ **PostgreSQL Integration** - Reliable data persistence with TypeORM
- 📚 **Interactive API Documentation** - Auto-generated Swagger/OpenAPI docs
- 🧪 **Comprehensive Testing** - Unit and integration test coverage
- 🚀 **Production Ready** - Docker support and deployment configuration

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0.0 or higher
- **PostgreSQL** 12 or higher
- **Yarn** package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/marques-kevin/api.tinycardo.com.git
   cd api.tinycardo.com
   ```

2. **Install dependencies**

   ```bash
   yarn install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:

   ```env
   NODE_ENV=development
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_NAME=tinycardo
   DATABASE_USERNAME=your_username
   DATABASE_PASSWORD=your_password
   JWT_SECRET=your-super-secret-jwt-key
   ```

4. **Set up the database**

   ```bash
   # Create database
   createdb tinycardo

   # Run migrations
   yarn migration:run
   ```

5. **Start the development server**
   ```bash
   yarn start
   ```

The API will be available at `http://localhost:3000`

## 📚 API Documentation

Interactive API documentation is available when the server is running:

- **Swagger UI**: `http://localhost:3000/api`
- **OpenAPI JSON**: `http://localhost:3000/api-json`

## 🧪 Testing

We maintain high test coverage with both unit and integration tests:

```bash
# Run all tests
yarn test

# Run unit tests only
yarn test:unit

# Run integration tests only
yarn test:int

# Run tests in watch mode
yarn test:unit:watch
```

## 🏗️ Project Structure

```
src/
├── config/              # Configuration files
├── migrations/          # Database migrations
├── modules/
│   ├── authentication/ # Auth logic & JWT handling
│   ├── cards/          # Card CRUD operations
│   ├── decks/          # Deck management
│   ├── history/        # Learning progress tracking
│   └── sessions/       # User session management
└── tests/              # Test utilities
```

## 🛠️ Development

### Available Scripts

| Script                  | Description                              |
| ----------------------- | ---------------------------------------- |
| `yarn start`            | Start development server with watch mode |
| `yarn build`            | Build for production                     |
| `yarn lint`             | Run ESLint with auto-fix                 |
| `yarn format`           | Format code with Prettier                |
| `yarn typecheck`        | Run TypeScript type checking             |
| `yarn migration:create` | Create new migration                     |
| `yarn migration:run`    | Run pending migrations                   |

### Code Style

This project uses:

- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety

Pre-commit hooks ensure code quality. Run `yarn lint` and `yarn format` before committing.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:

- Setting up the development environment
- Code style guidelines
- Pull request process
- Issue reporting

### Quick Contribution Steps

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Run tests: `yarn test`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📋 Roadmap

### Current Status ✅

- [x] Deck CRUD operations
- [x] Card management
- [x] User authentication
- [x] Basic history tracking

### Upcoming Features 🚧

- [ ] Advanced spaced repetition algorithms
- [ ] Streak tracking and achievements
- [ ] Deck sharing and collaboration
- [ ] Mobile app API endpoints
- [ ] Advanced analytics dashboard
- [ ] Import/export functionality

## 🐛 Bug Reports & Feature Requests

Found a bug? Have an idea? We'd love to hear from you!

- **Bug Reports**: [Open an issue](https://github.com/marques-kevin/api.tinycardo.com/issues/new?template=bug_report.md)
- **Feature Requests**: [Request a feature](https://github.com/marques-kevin/api.tinycardo.com/issues/new?template=feature_request.md)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [NestJS](https://nestjs.com/) - A progressive Node.js framework
- Database management with [TypeORM](https://typeorm.io/)
- Documentation powered by [Swagger/OpenAPI](https://swagger.io/)

## 📞 Support

- 📖 **Documentation**: [API Docs](http://localhost:3000/api)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/marques-kevin/api.tinycardo.com/discussions)
- 🐛 **Issues**: [Bug Tracker](https://github.com/marques-kevin/api.tinycardo.com/issues)

---

<p align="center">
  <strong>Made with ❤️ for the learning community</strong>
</p>
