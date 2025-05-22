# Keyboard Navigation System Documentation

## Overview

The Avnu Marketplace Keyboard Navigation System provides comprehensive keyboard accessibility features to improve the user experience for keyboard-only users, screen reader users, and users with motor disabilities. The system includes server-side section mapping, focus state persistence, and customizable keyboard shortcuts.

## Features

### 1. Server-Side Section Mapping

The section mapping system provides a structured representation of navigable sections on each page:

- **Hierarchical Structure**: Pages are divided into logical sections (header, navigation, main content, etc.)
- **Selector-Based Mapping**: Each section is mapped to DOM selectors for client-side targeting
- **Priority-Based Navigation**: Sections have priority values to determine tab order
- **Route-Specific Sections**: Different routes can have different section mappings
- **Global Sections**: Some sections (header, footer) are available across all routes

### 2. Focus State Persistence

The focus state persistence system maintains the user's position between sessions:

- **Cross-Session Persistence**: Focus state is saved and restored across page loads and sessions
- **Route-Specific Focus**: Different routes can have different saved focus states
- **Element-Level Precision**: Focus can be saved at the section or specific element level
- **Context Awareness**: Additional context can be stored with focus state (e.g., scroll position)
- **User-Specific Storage**: Focus states are stored per user and session

### 3. Keyboard Shortcut Configuration

The keyboard shortcut system allows for customizable navigation:

- **User-Defined Shortcuts**: Users can create and customize their own keyboard shortcuts
- **Global Shortcuts**: Some shortcuts work across the entire application
- **Route-Specific Shortcuts**: Some shortcuts are specific to certain routes
- **Modifier Key Support**: Supports Alt, Ctrl, Shift, and Meta key combinations
- **Conflict Detection**: Prevents conflicting shortcut definitions

## Architecture

The keyboard navigation system is built as a modular component within the Accessibility module:

```
accessibility/
├── keyboard-navigation/
│   ├── entities/
│   │   ├── navigation-section.entity.ts
│   │   ├── focus-state.entity.ts
│   │   └── keyboard-shortcut.entity.ts
│   ├── services/
│   │   ├── keyboard-navigation.service.ts
│   │   ├── section-mapping.service.ts
│   │   ├── focus-state.service.ts
│   │   └── keyboard-shortcut.service.ts
│   ├── controllers/
│   │   └── keyboard-navigation.controller.ts
│   ├── resolvers/
│   │   └── keyboard-navigation.resolver.ts
│   └── keyboard-navigation.module.ts
└── accessibility.module.ts
```

## API Reference

### GraphQL API

#### Queries

```graphql
# Get navigation sections for a route
query NavigationSections($route: String!) {
  navigationSections(route: $route) {
    id
    name
    route
    selector
    childSelectors
    priority
    description
    ariaLabel
    parentSectionId
    isActive
  }
}

# Get keyboard shortcuts for a user
query KeyboardShortcuts($userId: String!, $route: String) {
  keyboardShortcuts(userId: $userId, route: $route) {
    id
    name
    description
    shortcutKey {
      key
      altKey
      ctrlKey
      shiftKey
      metaKey
    }
    action
    route
    sectionId
    isGlobal
    isActive
  }
}

# Get last focus state
query LastFocusState($userId: String!, $sessionId: String!, $route: String) {
  lastFocusState(userId: $userId, sessionId: $sessionId, route: $route) {
    id
    userId
    sessionId
    route
    sectionId
    elementId
    elementSelector
    context
    lastActive
    isActive
  }
}
```

#### Mutations

```graphql
# Save focus state
mutation SaveFocusState(
  $userId: String!
  $sessionId: String!
  $route: String!
  $sectionId: String!
  $elementId: String
  $elementSelector: String
  $context: String
) {
  saveFocusState(
    userId: $userId
    sessionId: $sessionId
    route: $route
    sectionId: $sectionId
    elementId: $elementId
    elementSelector: $elementSelector
    context: $context
  ) {
    id
    userId
    sessionId
    route
    sectionId
    elementId
    elementSelector
    context
    lastActive
    isActive
  }
}

# Clear focus states
mutation ClearFocusStates($userId: String!, $sessionId: String!) {
  clearFocusStates(userId: $userId, sessionId: $sessionId)
}

# Save user shortcut
mutation SaveUserShortcut(
  $userId: String!
  $name: String!
  $description: String!
  $key: String!
  $altKey: Boolean
  $ctrlKey: Boolean
  $shiftKey: Boolean
  $metaKey: Boolean
  $action: String
  $route: String
  $sectionId: String
) {
  saveUserShortcut(
    userId: $userId
    name: $name
    description: $description
    key: $key
    altKey: $altKey
    ctrlKey: $ctrlKey
    shiftKey: $shiftKey
    metaKey: $metaKey
    action: $action
    route: $route
    sectionId: $sectionId
  ) {
    id
    name
    description
    shortcutKey {
      key
      altKey
      ctrlKey
      shiftKey
      metaKey
    }
    action
    route
    sectionId
    userId
    isGlobal
    isActive
  }
}

# Reset user shortcuts
mutation ResetUserShortcuts($userId: String!) {
  resetUserShortcuts(userId: $userId)
}
```

### REST API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/accessibility/keyboard-navigation/sections?route=:route` | Get navigation sections for a route |
| GET | `/accessibility/keyboard-navigation/sections/:id` | Get a navigation section by ID |
| POST | `/accessibility/keyboard-navigation/sections` | Create a new navigation section |
| PUT | `/accessibility/keyboard-navigation/sections/:id` | Update a navigation section |
| DELETE | `/accessibility/keyboard-navigation/sections/:id` | Delete a navigation section |
| GET | `/accessibility/keyboard-navigation/shortcuts?userId=:userId&route=:route` | Get keyboard shortcuts for a user |
| GET | `/accessibility/keyboard-navigation/shortcuts/:id` | Get a keyboard shortcut by ID |
| POST | `/accessibility/keyboard-navigation/shortcuts` | Create a new keyboard shortcut |
| PUT | `/accessibility/keyboard-navigation/shortcuts/:id` | Update a keyboard shortcut |
| DELETE | `/accessibility/keyboard-navigation/shortcuts/:id` | Delete a keyboard shortcut |
| POST | `/accessibility/keyboard-navigation/shortcuts/user/:userId` | Save a user-specific keyboard shortcut |
| DELETE | `/accessibility/keyboard-navigation/shortcuts/user/:userId/reset` | Reset user keyboard shortcuts to default |
| GET | `/accessibility/keyboard-navigation/focus-state?userId=:userId&sessionId=:sessionId&route=:route` | Get focus state for a user |
| POST | `/accessibility/keyboard-navigation/focus-state` | Save focus state |
| DELETE | `/accessibility/keyboard-navigation/focus-state?userId=:userId&sessionId=:sessionId` | Clear focus states for a user |
| GET | `/accessibility/keyboard-navigation/navigation-state?route=:route&userId=:userId&sessionId=:sessionId` | Get complete navigation state for a route |
| POST | `/accessibility/keyboard-navigation/initialize` | Initialize the keyboard navigation system |

## Client-Side Integration

### Navigation State Initialization

```typescript
// Example client-side code for initializing navigation state
async function initializeKeyboardNavigation(route, userId, sessionId) {
  // Fetch navigation state from the server
  const response = await fetch(`/accessibility/keyboard-navigation/navigation-state?route=${route}&userId=${userId}&sessionId=${sessionId}`);
  const navigationState = await response.json();
  
  // Initialize keyboard navigation with the navigation state
  const { sections, shortcuts, currentFocus } = navigationState;
  
  // Set up keyboard event listeners
  setupKeyboardShortcuts(shortcuts);
  
  // Restore focus if available
  if (currentFocus) {
    restoreFocus(currentFocus);
  }
  
  return navigationState;
}
```

### Focus Management

```typescript
// Example client-side code for managing focus
function restoreFocus(focusState) {
  const { sectionId, elementId, elementSelector } = focusState;
  
  // Try to focus on the specific element if available
  if (elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.focus();
      return true;
    }
  }
  
  // Try to focus on the element using selector if available
  if (elementSelector) {
    const element = document.querySelector(elementSelector);
    if (element) {
      element.focus();
      return true;
    }
  }
  
  // Fall back to focusing on the section
  const section = document.querySelector(`[data-section-id="${sectionId}"]`);
  if (section) {
    const focusableElement = getFocusableElement(section);
    if (focusableElement) {
      focusableElement.focus();
      return true;
    }
  }
  
  return false;
}

// Save focus state when focus changes
function saveFocusState(element, userId, sessionId, route) {
  // Find the section containing the element
  const section = findSectionForElement(element);
  
  if (section) {
    const sectionId = section.dataset.sectionId;
    const focusState = {
      userId,
      sessionId,
      route,
      sectionId,
      elementId: element.id || null,
      elementSelector: getUniqueSelector(element),
      context: JSON.stringify({ scrollY: window.scrollY }),
      isActive: true
    };
    
    // Send focus state to the server
    fetch('/accessibility/keyboard-navigation/focus-state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(focusState)
    });
  }
}
```

### Keyboard Shortcut Handling

```typescript
// Example client-side code for handling keyboard shortcuts
function setupKeyboardShortcuts(shortcuts) {
  document.addEventListener('keydown', (event) => {
    // Check if the key combination matches any shortcuts
    const matchingShortcut = shortcuts.find(shortcut => {
      const key = shortcut.shortcutKey;
      return (
        key.key === event.key &&
        key.altKey === event.altKey &&
        key.ctrlKey === event.ctrlKey &&
        key.shiftKey === event.shiftKey &&
        key.metaKey === event.metaKey
      );
    });
    
    if (matchingShortcut) {
      event.preventDefault();
      executeShortcutAction(matchingShortcut);
    }
  });
}

function executeShortcutAction(shortcut) {
  const { action } = shortcut;
  
  // Parse the action
  if (action.startsWith('focusSection:')) {
    const sectionName = action.substring('focusSection:'.length);
    focusSectionByName(sectionName);
  } else if (action.startsWith('focusElement:')) {
    const elementId = action.substring('focusElement:'.length);
    document.getElementById(elementId)?.focus();
  } else if (action.startsWith('navigate:')) {
    const route = action.substring('navigate:'.length);
    window.location.href = route;
  }
}
```

## Default Configuration

### Default Navigation Sections

The system comes pre-configured with the following default navigation sections:

1. **Header** - Main header navigation (priority: 10)
2. **Main Navigation** - Main site navigation (priority: 20)
3. **Main Content** - Main content area (priority: 30)
4. **Product Grid** - Product listing grid (priority: 40, route: /products)
5. **Product Details** - Product details information (priority: 40, route: /products/:id)
6. **Footer** - Footer navigation and information (priority: 100)

### Default Keyboard Shortcuts

The system comes pre-configured with the following default keyboard shortcuts:

1. **Skip to Main Content** - Alt+M
2. **Skip to Navigation** - Alt+N
3. **Skip to Footer** - Alt+F
4. **Go to Home** - Alt+H
5. **Go to Products** - Alt+P
6. **Focus Search** - Alt+S

## Best Practices

1. **Consistent Section Structure**: Maintain a consistent section structure across pages to provide a predictable navigation experience.

2. **Logical Tab Order**: Ensure that the priority values of sections create a logical tab order that follows the visual flow of the page.

3. **Meaningful Section Names**: Use descriptive names for sections to help users understand where they are in the page.

4. **ARIA Integration**: Use ARIA landmarks and labels to enhance the accessibility of sections.

5. **Keyboard Shortcut Discoverability**: Provide a keyboard shortcut help page or modal to help users discover available shortcuts.

6. **Focus Indicators**: Ensure that focused elements have a visible focus indicator.

7. **Avoid Keyboard Traps**: Ensure that users can navigate out of any section using the keyboard.

8. **Test with Screen Readers**: Regularly test the keyboard navigation system with screen readers to ensure compatibility.

## Future Enhancements

1. **Advanced Focus Management**: Implement more sophisticated focus management for complex UI components like modals and dropdown menus.

2. **User Preference Profiles**: Allow users to save and load different keyboard shortcut profiles.

3. **Keyboard Navigation Tutorial**: Create an interactive tutorial to help users learn keyboard navigation.

4. **Voice Command Integration**: Integrate with voice command systems for hands-free navigation.

5. **Accessibility Analytics**: Track keyboard navigation usage to identify areas for improvement.

## Support

For questions or issues related to the Keyboard Navigation System, please contact the development team or file an issue in the project repository.
