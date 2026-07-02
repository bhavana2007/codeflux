# Testing Guide

This directory contains all tests for the DSA Platform Enhancements.

## Directory Structure

```
tests/
├── unit/              # Unit tests for components and services
│   ├── components/    # Component tests
│   └── services/      # Service/utility tests
├── properties/        # Property-based tests
├── integration/       # Integration tests
└── setup.js          # Test setup and configuration
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- path/to/test.test.js

# Run tests in watch mode
npm test -- --watch
```

## Testing Frameworks

- **Vitest**: Fast unit test framework
- **fast-check**: Property-based testing library
- **React Testing Library**: Component testing utilities
- **@testing-library/user-event**: User interaction simulation

## Writing Tests

### Unit Tests

```javascript
import { describe, it, expect } from 'vitest';

describe('MyComponent', () => {
  it('should render correctly', () => {
    // Test implementation
  });
});
```

### Property Tests

```javascript
import { describe, it } from 'vitest';
import fc from 'fast-check';

describe('MyService Properties', () => {
  it('should satisfy round-trip property', () => {
    fc.assert(
      fc.property(
        fc.string(),
        (input) => {
          const result = serialize(deserialize(input));
          return result === input;
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Component Tests

```javascript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('MyComponent', () => {
  it('should handle user interaction', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);
    
    await user.click(screen.getByRole('button'));
    
    expect(screen.getByText('Clicked')).toBeInTheDocument();
  });
});
```

## Coverage Goals

- **Unit Tests**: 80%+ line coverage for services and utilities
- **Property Tests**: All 64 correctness properties must have tests
- **Component Tests**: All interactive components must have tests
- **Integration Tests**: All critical user flows must have tests

## Best Practices

1. **Test Behavior, Not Implementation**: Focus on what the system does
2. **Arrange-Act-Assert**: Structure tests clearly
3. **Descriptive Names**: Use clear, specific test names
4. **Isolated Tests**: Each test should be independent
5. **Fast Tests**: Keep unit tests under 100ms each
6. **Realistic Data**: Use realistic test data
7. **Edge Cases**: Test boundary conditions
8. **Error Scenarios**: Test error handling
