# 🧪 Testing Guide

## Overview

This document outlines the testing strategy and setup for the SplitBill application. We use Jest for unit, integration, and component testing.

---

## 📊 Test Structure

```
__tests__/
├── lib/
│   ├── validations/
│   │   ├── auth.test.ts
│   │   └── group.test.ts
│   ├── security/
│   │   ├── sanitize.test.ts
│   │   └── csrf.test.ts
│   └── utils/
│       ├── api-error.test.ts
│       └── cn.test.ts
├── components/
│   └── ui/
│       ├── Button.test.tsx
│       ├── Input.test.tsx
│       └── Card.test.tsx
└── api/
    └── auth/
        └── register.test.ts
```

---

## 🚀 Getting Started

### Installation

```bash
# Install test dependencies
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @types/jest

# Or use the pre-configured setup
npm install
```

### Configuration Files

- **jest.config.js** - Jest configuration
- **jest.setup.js** - Test environment setup and mocks

---

## 🏃 Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage report
```bash
npm run test:coverage
```

### Run tests in CI mode (for CI/CD pipelines)
```bash
npm run test:ci
```

---

## 📝 Writing Tests

### Unit Tests - Validation Schemas

Test Zod schemas to ensure proper input validation:

```typescript
import { describe, it, expect } from '@jest/globals';
import { registerSchema } from '@/lib/validations/auth';

describe('registerSchema', () => {
  it('should validate correct registration data', () => {
    const validData = {
      email: 'test@example.com',
      password: 'Test123!',
      name: 'Test User',
    };

    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const invalidData = {
      email: 'invalid',
      password: 'Test123!',
      name: 'Test User',
    };

    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
```

### Unit Tests - Utility Functions

Test helper functions and utilities:

```typescript
import { describe, it, expect } from '@jest/globals';
import { sanitizeInput } from '@/lib/security/sanitize';

describe('sanitizeInput', () => {
  it('should remove HTML tags', () => {
    const dirty = '<script>alert("XSS")</script>Hello';
    const clean = sanitizeInput(dirty);

    expect(clean).not.toContain('<script>');
    expect(clean).toContain('Hello');
  });
});
```

### Component Tests

Test React components:

```typescript
import { describe, it, expect, jest } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button Component', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>);

    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Integration Tests - API Endpoints

Test API routes and handlers:

```typescript
import { describe, it, expect, jest } from '@jest/globals';
import { POST } from '@/app/api/auth/register/route';
import { NextRequest } from 'next/server';

describe('POST /api/auth/register', () => {
  it('should register a new user successfully', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'Test123!',
        name: 'Test User',
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.user.email).toBe('test@example.com');
  });
});
```

---

## 🛡️ Security Tests

### Sanitization Tests

Ensure XSS protection:

```typescript
describe('sanitizeInput', () => {
  it('should remove HTML tags', () => {
    const dirty = '<img src=x onerror="alert(1)">';
    const clean = sanitizeInput(dirty);

    expect(clean).not.toContain('onerror');
  });

  it('should escape special characters', () => {
    const dirty = '<div>&amp;</div>';
    const clean = sanitizeInput(dirty);

    expect(clean).toContain('&amp;');
  });
});
```

### CSRF Tests

Test CSRF token generation:

```typescript
describe('generateCsrfToken', () => {
  it('should generate unique tokens', () => {
    const token1 = generateCsrfToken();
    const token2 = generateCsrfToken();

    expect(token1).not.toBe(token2);
  });

  it('should generate 64-character hex string', () => {
    const token = generateCsrfToken();

    expect(token.length).toBe(64);
    expect(/^[0-9a-f]+$/.test(token)).toBe(true);
  });
});
```

---

## 📊 Coverage Thresholds

The project has the following coverage requirements:

```javascript
coverageThreshold: {
  global: {
    branches: 50,     // 50% of branches covered
    functions: 50,    // 50% of functions covered
    lines: 50,        // 50% of lines covered
    statements: 50,   // 50% of statements covered
  }
}
```

To view coverage report:

```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

---

## 🔧 Mocking

### Mock Next.js Router

```typescript
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    };
  },
}));
```

### Mock NextAuth

```typescript
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated',
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));
```

### Mock Database (Prisma)

```typescript
jest.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));
```

---

## 🔄 Continuous Integration

### GitHub Actions

Tests run automatically on:
- Push to `develop` or `main` branches
- Pull requests to `develop` or `main` branches

### Test Job

```yaml
test:
  name: Run Tests
  runs-on: ubuntu-latest
  needs: lint

  steps:
    - name: Run tests with coverage
      run: npm run test:ci

    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v4
```

---

## 📋 Test Checklist

- ✅ Auth validation schemas
- ✅ Group validation schemas
- ✅ Input sanitization (XSS)
- ✅ CSRF token generation
- ✅ Button component
- ✅ Input component
- ✅ Card component
- ✅ API endpoints (register, groups, expenses)
- ✅ Security validations
- ✅ Error handling

---

## 🐛 Debugging Tests

### Run single test file
```bash
npm test -- __tests__/lib/validations/auth.test.ts
```

### Run tests matching pattern
```bash
npm test -- --testNamePattern="should validate"
```

### Debug with Node Inspector
```bash
node --inspect-brk node_modules/jest/bin/jest.js --runInBand
```

### Verbose output
```bash
npm test -- --verbose
```

---

## 📚 Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## 🤝 Contributing

When adding new features:

1. Write tests for new code
2. Ensure coverage thresholds are met
3. Run `npm run test:coverage` before committing
4. Update this document if adding new test patterns

---

## 📞 Support

For testing issues or questions, please refer to the testing guidelines or create an issue in the repository.
