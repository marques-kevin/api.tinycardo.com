---
name: Bug report
about: Create a report to help us improve
title: '[BUG] '
labels: ['bug']
assignees: ''
---

**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:

1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Actual behavior**
A clear and concise description of what actually happened.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment (please complete the following information):**

- OS: [e.g. macOS, Ubuntu 20.04]
- Node.js Version: [e.g. 18.17.0]
- PostgreSQL Version: [e.g. 14.2]
- API Version: [e.g. 0.1.0]

**API Request Details (if applicable):**

```bash
# Example curl command or request details
curl -X POST http://localhost:3000/api/decks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title": "Test Deck"}'
```

**Error Messages/Logs**

```
Paste any error messages or relevant logs here
```

**Database Schema (if applicable)**
If this is related to database operations, please provide relevant table structure or migration details.

**Additional context**
Add any other context about the problem here. This might include:

- When did this start happening?
- Does it happen consistently or intermittently?
- Are there any workarounds you've found?
- Related issues or pull requests

**Possible Solution**
If you have ideas on how to fix this, please share them here.

---

**Checklist**

- [ ] I have searched for existing issues that might be related to this bug
- [ ] I have provided all the requested information above
- [ ] I have tested this with the latest version
- [ ] I have included relevant logs/error messages
