# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1   | :x:                |

## Reporting a Vulnerability

We take the security of Tinycardo API seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### Please DO NOT report security vulnerabilities through public GitHub issues.

Instead, please report them via email to **security@tinycardo.com** (or your preferred contact method).

Please include the following information in your report:

- Type of issue (e.g. buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit the issue

This information will help us triage your report more quickly.

## Response Process

1. **Acknowledgment**: We'll acknowledge receipt of your report within 48 hours
2. **Investigation**: We'll investigate and validate the vulnerability
3. **Resolution**: We'll work on a fix and coordinate the release
4. **Disclosure**: We'll publicly disclose the vulnerability after a fix is released

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days of initial report
- **Resolution**: Timeline depends on severity and complexity

## Security Best Practices

### For Users

When deploying Tinycardo API:

1. **Environment Variables**: Never commit sensitive data like API keys, database passwords, or JWT secrets to version control
2. **HTTPS**: Always use HTTPS in production
3. **Database Security**: Use strong database credentials and restrict network access
4. **JWT Secrets**: Use cryptographically strong, unique JWT secrets
5. **Regular Updates**: Keep dependencies up to date

### For Developers

When contributing to Tinycardo API:

1. **Input Validation**: Always validate and sanitize user input
2. **SQL Injection**: Use parameterized queries and ORM features safely
3. **Authentication**: Implement proper authentication and authorization
4. **Error Handling**: Don't expose sensitive information in error messages
5. **Dependencies**: Regularly audit and update dependencies
6. **Logging**: Be careful not to log sensitive information

## Security Features

### Current Security Measures

- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive input validation using DTOs and class-validator
- **SQL Injection Protection**: Using TypeORM with parameterized queries
- **CORS Configuration**: Properly configured CORS policies
- **Rate Limiting**: API rate limiting to prevent abuse
- **Environment Configuration**: Secure handling of environment variables

### Planned Security Enhancements

- [ ] API key authentication for service-to-service communication
- [ ] Two-factor authentication (2FA) support
- [ ] Enhanced audit logging
- [ ] Automated security scanning in CI/CD pipeline
- [ ] Content Security Policy (CSP) headers

## Security Dependencies

We use several security-focused dependencies:

- `@nestjs/jwt` - JWT token handling
- `passport` & `passport-jwt` - Authentication middleware
- `class-validator` - Input validation
- `helmet` - Security headers (planned)
- `bcrypt` - Password hashing (planned)

## Vulnerability Disclosure Timeline

### Critical Vulnerabilities

- **Day 0**: Vulnerability reported
- **Day 1-2**: Initial assessment and acknowledgment
- **Day 3-14**: Investigation and fix development
- **Day 15**: Coordinated disclosure and patch release

### Non-Critical Vulnerabilities

- **Day 0**: Vulnerability reported
- **Day 1-3**: Initial assessment and acknowledgment
- **Day 7-30**: Investigation and fix development
- **Day 31**: Coordinated disclosure and patch release

## Security Hall of Fame

We recognize security researchers who responsibly disclose vulnerabilities:

<!-- Future security researchers will be listed here -->

## Security Contact

For security-related questions or concerns:

- **Email**: security@tinycardo.com
- **PGP Key**: [Link to PGP key if available]
- **Response Time**: Within 48 hours

## Legal

By reporting security vulnerabilities to us, you agree to:

1. Allow us reasonable time to fix the issue before any public disclosure
2. Make a good faith effort to avoid privacy violations, destruction of data, and interruption or degradation of our service
3. Not access or modify data that doesn't belong to you
4. Contact us immediately if you inadvertently access or modify data

We commit to:

1. Respond to your report within 48 hours
2. Work with you to understand and validate the vulnerability
3. Credit you appropriately for your discovery (if desired)
4. Not pursue legal action against researchers who follow this policy

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NestJS Security Best Practices](https://docs.nestjs.com/security/authentication)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)

---

Thank you for helping keep Tinycardo API and our users safe!
