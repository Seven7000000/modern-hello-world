# Project Best Practices

This document outlines the key conventions and best practices for this project.

## Code Organization

### Directory Structure

- `src/components/`: Reusable UI components
- `src/pages/`: Page components for routing
- `src/utils/`: Utility functions and helpers
- `src/hooks/`: Custom React hooks
- `src/services/`: API and service integrations
- `src/context/`: React context providers
- `src/styles/`: Global styles and themes

### Naming Conventions

- **Files**: Use kebab-case for filenames (`user-profile.tsx`)
- **Components**: Use PascalCase for component names (`UserProfile`)
- **Functions**: Use camelCase for function names (`getUserData`)
- **Constants**: Use UPPER_SNAKE_CASE for constants (`API_URL`)

## State Management

We use React Context API for state management with custom hooks for specific functionality:

```javascript
// Example custom hook
function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Authentication logic
  
  return { user, loading, login, logout };
}
```

## Error Handling

Use try/catch blocks for async operations and provide meaningful error messages:

```javascript
async function fetchData() {
  try {
    const response = await api.get('/endpoint');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch data:', error);
    throw new Error('Unable to load data. Please try again later.');
  }
}
```

## Testing

- Write unit tests for utility functions and custom hooks
- Write component tests for UI components
- Use React Testing Library for component testing
- Aim for at least 80% test coverage

## Performance

- Use React.memo for expensive components
- Use useCallback and useMemo for optimizing callbacks and computations
- Implement code splitting using React.lazy and Suspense
- Use pagination for large data sets 