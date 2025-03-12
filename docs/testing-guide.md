# Testing Guide for Eco-Dex Microservices

## Overview
This guide outlines the testing standards and practices for all microservices in the Eco-Dex platform.

## Test Coverage Requirements
- Minimum 80% code coverage for all services
- Unit tests for all business logic
- Integration tests for API endpoints
- E2E tests for critical user flows

## Testing Stack
- Jest as the testing framework
- Supertest for API testing
- Mock Service Worker for mocking external services
- Database mocking using test containers

## Test Structure
```
service/
  ├── src/
  └── tests/
      ├── unit/
      ├── integration/
      └── e2e/
```

## Writing Tests

### Unit Tests
```typescript
describe('UserService', () => {
  it('should create a new user', async () => {
    // Test implementation
  });
});
```

### Integration Tests
```typescript
describe('User API', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/users')
      .send(userData);
    expect(response.status).toBe(201);
  });
});
```

### E2E Tests
```typescript
describe('User Registration Flow', () => {
  it('should complete registration process', async () => {
    // Test implementation
  });
});
```

## Mocking Guidelines
- Use Jest mock functions for unit tests
- Use MSW for external API mocking
- Use test containers for database testing

## Running Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- path/to/test
```

## CI/CD Integration
- Tests must pass before merging PRs
- Coverage reports are generated in CI pipeline
- Failed tests block deployments

## Best Practices
1. Follow AAA pattern (Arrange-Act-Assert)
2. Keep tests focused and atomic
3. Use meaningful test descriptions
4. Maintain test data fixtures
5. Clean up test data after each test

## Service-Specific Testing Requirements

### User Service
- Auth flow testing
- Permission validation
- Profile management

### Product Service
- Catalog operations
- Search functionality
- Category management

### Cart Service
- Cart operations
- Price calculations
- Inventory checks

### Order Service
- Order creation
- Status transitions
- Payment integration

### Payment Service
- Payment processing
- Refund handling
- Payment method management

### Notification Service
- Event handling
- Template rendering
- Delivery status tracking