# Handling Unused Variables in TypeScript

## Overview

This document outlines our approach to handling unused variables in the Avnu Marketplace codebase. Properly managing unused variables helps maintain code quality, prevent potential bugs, and keep the linting process clean.

## The Underscore Prefix Convention

We use the underscore prefix (`_`) convention to mark variables that are intentionally unused. This approach:

1. Makes it explicit that a variable is intentionally unused
2. Prevents ESLint warnings about unused variables
3. Maintains code readability and self-documentation

## ESLint Configuration

Our ESLint configuration is set up to recognize variables with an underscore prefix as intentionally unused:

```javascript
// .eslintrc.js
module.exports = {
  // ... other config
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', { 
      'argsIgnorePattern': '^_',
      'varsIgnorePattern': '^_',
      'caughtErrorsIgnorePattern': '^_'
    }],
    // ... other rules
  }
};
```

## When to Use the Underscore Prefix

### 1. Function Parameters

When a function parameter is required by a type definition or interface but not used in the implementation:

```typescript
// Before
function processUser(user: User, context: Context) {
  // Only uses user, not context
  return user.name;
}

// After
function processUser(user: User, _context: Context) {
  return user.name;
}
```

### 2. Imported Types and Values

When importing types or values that are needed for type checking but not directly referenced:

```typescript
// Before
import { User, Role, Permission } from './types';
// Only User is used in the code

// After - Option 1: Rename with underscore
import { User, Role as _Role, Permission as _Permission } from './types';

// After - Option 2: Comment out unused imports
import { User } from './types';
// Role and Permission types are imported but not used
```

### 3. Destructured Properties

When destructuring objects but not using all properties:

```typescript
// Before
const { name, age, address } = user;
// Only name and age are used

// After
const { name, age, _address } = user;
```

### 4. Catch Block Error Variables

When catching errors but not using the error variable:

```typescript
// Before
try {
  // Some code
} catch (error) {
  // Generic error handling without using error variable
  console.log('An error occurred');
}

// After
try {
  // Some code
} catch (_error) {
  console.log('An error occurred');
}
```

## Best Practices

1. **Be Consistent**: Always use the underscore prefix for unused variables throughout the codebase.

2. **Document Intent**: If keeping an unused import for future use, add a comment explaining why:

   ```typescript
   // Imported for future implementation of feature X
   import { FeatureService as _FeatureService } from './services';
   ```

3. **Review Regularly**: Periodically review unused variables to determine if they should be removed entirely.

4. **Avoid Excessive Imports**: Don't import what you don't need. If you're not using a module now and don't have immediate plans to use it, remove the import entirely.

## Example from Our Codebase

```typescript
// Before
import { Resolver, Query, Args, Int, ResolveField, Parent } from '@nestjs/graphql';
import { SearchOptionsInput, SortOption, FilterOption, RangeFilterOption } from '../dto/search-options.dto';

// After
import { Resolver, Query, Args, ResolveField, Parent } from '@nestjs/graphql';
// Int is imported but not used directly
import { 
  SearchOptionsInput,
  SortOption as _SortOption,
  FilterOption as _FilterOption,
  RangeFilterOption as _RangeFilterOption
} from '../dto/search-options.dto';
```

## Conclusion

Using the underscore prefix for unused variables is a simple but effective way to maintain code quality and clarity. It helps us distinguish between variables that are accidentally unused (potential bugs) and those that are intentionally unused (required by interfaces or kept for future use).
