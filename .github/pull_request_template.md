## Description

Brief description of what this PR does and why.

Fixes # (issue)

## Type of Change

Please delete options that are not relevant.

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] This change requires a documentation update

## How Has This Been Tested?

Please describe the tests that you ran to verify your changes. Provide instructions so we can reproduce.

- [ ] Unit tests
- [ ] Integration tests
- [ ] Manual testing

**Test Configuration**:

- Node.js version:
- PostgreSQL version:
- OS:

## Changes Made

### API Changes

- [ ] New endpoints added
- [ ] Existing endpoints modified
- [ ] Request/response formats changed

### Database Changes

- [ ] New migrations added
- [ ] Schema changes made
- [ ] Data transformations required

### Code Changes

- [ ] New modules/services created
- [ ] Existing logic modified
- [ ] Dependencies added/updated

## Screenshots (if applicable)

Add screenshots for API documentation updates or any visual changes.

## Breaking Changes

List any breaking changes and how to migrate:

```
# Before
GET /api/old-endpoint

# After
GET /api/new-endpoint
```

## Checklist

Please review and check all applicable items:

### Code Quality

- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] My changes generate no new warnings or errors

### Testing

- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] New and existing integration tests pass locally with my changes

### Documentation

- [ ] I have made corresponding changes to the documentation
- [ ] I have updated the API documentation (Swagger/OpenAPI)
- [ ] I have updated the README if needed

### Database

- [ ] I have created appropriate database migrations
- [ ] I have tested migrations both up and down
- [ ] Database changes are backward compatible (or breaking change is noted)

### Dependencies

- [ ] I have not added unnecessary dependencies
- [ ] New dependencies are properly justified
- [ ] Package.json and yarn.lock are updated (if applicable)

## Additional Notes

Any additional information that reviewers should know:

- Performance implications
- Security considerations
- Deployment notes
- Follow-up tasks needed

## Related Issues/PRs

- Closes #[issue number]
- Related to #[issue number]
- Depends on #[PR number]
