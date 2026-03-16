# Testing Guide for kinelo.fit

## Overview

kinelo.fit now has a comprehensive testing framework with:
- **Vitest** for unit and component testing
- **React Testing Library** for component testing
- **Node test module** for existing tests (still supported)
- **JSdom** for DOM simulation in tests

## Running Tests

```bash
# Run all tests (vitest + node tests)
npm test

# Run vitest only with watch mode
npm test -- --watch

# View test coverage
npm run test:coverage

# Open vitest UI for visual debugging
npm run test:ui

# Run only Node tests (original syntax)
npm run test:node
```

## Test Structure

```
tests/
├── setup.ts                    # Global setup, mocks, utilities
├── mocks/
│   ├── next-link.tsx          # Mock next/link components
│   └── next-navigation.ts     # Mock Next.js navigation hooks
├── components/
│   ├── SessionCard.test.tsx
│   ├── FilterBar.test.tsx
│   └── FavoriteButton.test.tsx
├── api/
│   ├── digest.test.ts
│   ├── favorites.test.ts
│   └── outbound.test.ts
└── lib/
    ├── catalog/filters.test.ts
    ├── catalog/readiness.test.ts
    └── freshness/adapters.test.ts
```

## Writing Tests

### Basic Component Test

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SessionCard } from '@/components/discovery/SessionCard';
import type { Session } from '@/lib/catalog/types';

describe('SessionCard', () => {
  it('should render session title', () => {
    const mockSession: Session = {
      id: 'test-1',
      title: { en: 'Test Class', it: 'Classe di Test' },
      // ... other required properties
    };

    render(
      <SessionCard
        session={mockSession}
        locale="en"
        scheduleLabel="Save"
      />
    );

    // Assert
    expect(screen.getByText('Test Class')).toBeInTheDocument();
  });
});
```

### API Route Test

```typescript
import { describe, it, expect } from 'vitest';
import { POST } from '@/app/api/digest/route';

describe('POST /api/digest', () => {
  it('should create subscription with valid data', async () => {
    const request = new Request('http://localhost/api/digest', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        locale: 'en',
        citySlug: 'palermo',
        preferences: ['yoga']
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
  });

  it('should reject invalid email', async () => {
    const request = new Request('http://localhost/api/digest', {
      method: 'POST',
      body: JSON.stringify({
        email: 'not-an-email',
        locale: 'en',
        citySlug: 'palermo'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });
});
```

### Using Test Utilities

Tests can use helper functions from `tests/setup.ts`:

```typescript
import { createMockSession, createMockVenue, createMockSessionUser } from '@/tests/setup';

describe('SessionCard', () => {
  it('should work with mock data', () => {
    const session = createMockSession({
      title: { en: 'Custom Title', it: 'Titolo Personalizzato' }
    });

    const venue = createMockVenue({
      name: 'Custom Studio'
    });

    const user = createMockSessionUser();

    // ... test with mocked objects
  });
});
```

## Current Test Coverage

| Category | Tests | Status |
|----------|-------|--------|
| Business Logic | 14 | ✅ Passing |
| Components | 10 | ⚠️ In Development |
| API Routes | 0 | ⏳ Planned |

### Existing Tests (Node test format)

- `filters.test.ts` - Session filtering logic
- `freshness.test.ts` - Source freshness tracking
- `freshness-adapters.test.ts` - HTML parsing adapters
- `readiness.test.ts` - City readiness checks
- `policy.test.ts`- Content policy validation

## Writing Tests: Next Steps

### Priority 1: Component Tests (Week 2)

Test these high-value components:

1. **FilterBar** (`components/discovery/FilterBar.tsx`)
   - Filter state management
   - Filter application and clearing
   - Locale switching

2. **ClassesResultsClient** (`components/discovery/ClassesResultsClient.tsx`)
   - View switching (list/map/calendar)
   - Pagination
   - Loading states

3. **FavoriteButton** (`components/state/FavoriteButton.tsx`)
   - Toggle favorite / unfavorite
   - Optimistic UI updates
   - Error handling

4. **SessionCard** (`components/discovery/SessionCard.tsx`)
   - Render with different locales
   - Display verification status
   - Show level/format badges

### Priority 2: API Route Tests (Week 3)

Test these API endpoints:

1. `/api/digest` - Digest subscriptions
2. `/api/state/favorites` - Favorite management
3. `/api/state/schedule` - Schedule saving
4. `/api/outbound` - Click tracking
5. `/api/auth/*` - Authentication

### Priority 3: Integration Tests (Week 4)

- User journey: Browse → Filter → Save Favorite → Digest
- Multi-user state synchronization
- Error scenarios and recovery

## Testing Best Practices

### ✅ DO

- Test user behavior, not implementation details
- Use semantic queries: `getByRole`, `getByLabelText`, `getByPlaceholderText`
- Keep tests focused and readable
- Use descriptive test names
- Group related tests in `describe` blocks
- Mock external dependencies (API calls, localStorage)
- Test error cases and edge conditions

### ❌ DON'T

- Test implementation details (internal state, private functions)
- Query by CSS class or test ID unless necessary
- Write tests that depend on other tests
- Skip tests instead of fixing them
- Test third-party library behavior
- Over-mock - test real component behavior when possible

## Debugging Tests

### Run Single Test File

```bash
npm test -- tests/components/SessionCard.test.tsx
```

### Run Tests Matching Pattern

```bash
npm test -- --grep "SessionCard"
```

### Debug with UI

```bash
npm run test:ui
```

Then open http://localhost:51204 and click tests to debug.

### Console Logging in Tests

```typescript
import { render, screen, debug } from '@testing-library/react';

// Print entire DOM
debug();

// Print specific element
debug(screen.getByText('Yoga'));

// Log to console normally
console.log('My debug info', variable);
```

## Coverage Goals

Phase 1 (Weeks 1-4):
- **Target**: 50% code coverage (critical paths)
- **Focus**: Business logic + high-risk components
- **Success**: Can deploy PRs without manual testing

Phase 2 (Months 2-3):
- **Target**: 75% code coverage
- **Focus**: API routes + state management + forms
- **Success**: Regression-free deployments

Phase 3 (Month 4+):
- **Target**: 85%+ code coverage
- **Focus**: Edge cases, error scenarios, accessibility

## Continuous Integration

Tests should run on every commit via CI/CD (GitHub Actions, etc.):

```yaml
# .github/workflows/test.yml
- name: Run tests
  run: npm test -- --run

- name: Upload coverage
  run: npm run test:coverage
```

## Troubleshooting

### "Cannot find module" errors

Make sure mocks are set up in `tests/setup.ts` and `vitest.config.ts` has correct path aliases.

### Component not rendering in test

Check if all required props are provided. Use `screen.debug()` to see what rendered.

### Tests passing locally but failing in CI

Ensure environment variables are mocked. Check timezone and date handling.

### Performance issues in tests

- Split large test files
- Use `vi.mock()` instead of real components
- Avoid slow operations in tests

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react/)
- [Common Testing Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
