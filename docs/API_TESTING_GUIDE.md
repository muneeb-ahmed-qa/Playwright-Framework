# API Testing Guide

This guide demonstrates how to use the API testing utilities in the Playwright automation framework.

## Overview

The `ApiHelper` class provides comprehensive API testing capabilities including:
- HTTP method support (GET, POST, PUT, DELETE, PATCH)
- Request/response interception
- Mock responses
- Load testing
- Response validation

## Basic Usage

### Setting Up API Helper

```javascript
const { ApiHelper } = require('../utils/apiHelper');

test('API test example', async ({ page }) => {
  const apiHelper = new ApiHelper(page);
  
  // Set base URL
  apiHelper.baseUrl = 'https://api.example.com';
  
  // Set authentication
  apiHelper.setAuthToken('your-jwt-token');
});
```

### Making API Requests

```javascript
// GET request
const response = await apiHelper.get('/api/users');
console.log(response.status); // 200
console.log(response.data); // Response body

// POST request
const userData = { name: 'John Doe', email: 'john@example.com' };
const createResponse = await apiHelper.post('/api/users', userData);

// PUT request
const updateData = { name: 'Jane Doe' };
const updateResponse = await apiHelper.put('/api/users/1', updateData);

// DELETE request
const deleteResponse = await apiHelper.delete('/api/users/1');
```

## Advanced Features

### Request/Response Interception

```javascript
// Wait for specific API response
const response = await apiHelper.waitForResponse(
  '**/api/users',
  (response) => {
    console.log('Response received:', response.status());
  }
);

// Intercept and modify requests
await apiHelper.interceptRequest('**/api/users', (request) => {
  return {
    headers: { ...request.headers(), 'X-Custom-Header': 'value' }
  };
});
```

### Mock Responses

```javascript
// Mock successful response
await apiHelper.mockResponse(
  '**/api/users',
  { users: [{ id: 1, name: 'Test User' }] },
  200
);

// Mock error response
await apiHelper.mockErrorResponse(
  '**/api/users',
  'User not found',
  404
);
```

### Response Validation

```javascript
// Define expected response schema
const schema = {
  status: 200,
  requiredFields: ['users', 'total'],
  dataType: 'object'
};

// Validate response
const isValid = apiHelper.validateResponse(response, schema);
expect(isValid).toBe(true);
```

## Load Testing

```javascript
// Perform load test
const loadTestResults = await apiHelper.loadTest(
  '/api/users',
  100, // 100 requests
  10   // 10 concurrent requests
);

console.log('Load test results:', loadTestResults);
```

## Test Scenarios

### Authentication Testing

```javascript
test('should handle authentication', async ({ page }) => {
  const apiHelper = new ApiHelper(page);
  
  // Test without token
  const unauthorizedResponse = await apiHelper.get('/api/protected');
  expect(unauthorizedResponse.status).toBe(401);
  
  // Test with valid token
  apiHelper.setAuthToken('valid-token');
  const authorizedResponse = await apiHelper.get('/api/protected');
  expect(authorizedResponse.status).toBe(200);
});
```

### CRUD Operations Testing

```javascript
test('should perform CRUD operations', async ({ page }) => {
  const apiHelper = new ApiHelper(page);
  
  // Create
  const userData = { name: 'John Doe', email: 'john@example.com' };
  const createResponse = await apiHelper.post('/api/users', userData);
  expect(createResponse.status).toBe(201);
  
  const userId = createResponse.data.id;
  
  // Read
  const getResponse = await apiHelper.get(`/api/users/${userId}`);
  expect(getResponse.status).toBe(200);
  expect(getResponse.data.name).toBe('John Doe');
  
  // Update
  const updateData = { name: 'Jane Doe' };
  const updateResponse = await apiHelper.put(`/api/users/${userId}`, updateData);
  expect(updateResponse.status).toBe(200);
  
  // Delete
  const deleteResponse = await apiHelper.delete(`/api/users/${userId}`);
  expect(deleteResponse.status).toBe(204);
});
```

### Error Handling Testing

```javascript
test('should handle API errors', async ({ page }) => {
  const apiHelper = new ApiHelper(page);
  
  // Test 404 error
  const notFoundResponse = await apiHelper.get('/api/nonexistent');
  expect(notFoundResponse.status).toBe(404);
  
  // Test 500 error
  await apiHelper.mockErrorResponse('**/api/error', 'Internal Server Error', 500);
  const errorResponse = await apiHelper.get('/api/error');
  expect(errorResponse.status).toBe(500);
});
```

## Best Practices

### 1. Use Environment Variables

```javascript
// Set API base URL from environment
const apiHelper = new ApiHelper(page);
apiHelper.baseUrl = process.env.API_BASE_URL || 'https://api.example.com';
```

### 2. Organize API Tests

```javascript
test.describe('User API', () => {
  let apiHelper;
  
  test.beforeEach(async ({ page }) => {
    apiHelper = new ApiHelper(page);
    apiHelper.setAuthToken(process.env.API_TOKEN);
  });
  
  test.describe('GET /api/users', () => {
    test('should return list of users', async () => {
      // Test implementation
    });
  });
});
```

### 3. Use Test Data

```javascript
const testData = require('../fixtures/testData.json');

test('should create user with test data', async ({ page }) => {
  const apiHelper = new ApiHelper(page);
  const userData = testData.users.regular;
  
  const response = await apiHelper.post('/api/users', userData);
  expect(response.status).toBe(201);
});
```

### 4. Validate Response Structure

```javascript
test('should validate response structure', async ({ page }) => {
  const apiHelper = new ApiHelper(page);
  const response = await apiHelper.get('/api/users');
  
  // Validate response structure
  expect(response.data).toHaveProperty('users');
  expect(response.data).toHaveProperty('total');
  expect(Array.isArray(response.data.users)).toBe(true);
});
```

## Common Patterns

### Pagination Testing

```javascript
test('should handle pagination', async ({ page }) => {
  const apiHelper = new ApiHelper(page);
  
  // Test first page
  const page1 = await apiHelper.get('/api/users?page=1&limit=10');
  expect(page1.data.users).toHaveLength(10);
  
  // Test second page
  const page2 = await apiHelper.get('/api/users?page=2&limit=10');
  expect(page2.data.users).toHaveLength(10);
});
```

### Filtering and Sorting

```javascript
test('should handle filtering and sorting', async ({ page }) => {
  const apiHelper = new ApiHelper(page);
  
  // Test filtering
  const filtered = await apiHelper.get('/api/users?status=active');
  expect(filtered.data.users.every(user => user.status === 'active')).toBe(true);
  
  // Test sorting
  const sorted = await apiHelper.get('/api/users?sort=name&order=asc');
  const names = sorted.data.users.map(user => user.name);
  expect(names).toEqual([...names].sort());
});
```

### Rate Limiting Testing

```javascript
test('should handle rate limiting', async ({ page }) => {
  const apiHelper = new ApiHelper(page);
  
  // Make multiple requests quickly
  const requests = Array(10).fill().map(() => 
    apiHelper.get('/api/users')
  );
  
  const responses = await Promise.all(requests);
  
  // Check for rate limiting responses
  const rateLimited = responses.filter(r => r.status === 429);
  expect(rateLimited.length).toBeGreaterThan(0);
});
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your API supports CORS for browser requests
2. **Authentication**: Make sure tokens are properly set and valid
3. **Timeout Issues**: Increase timeout values for slow APIs
4. **Network Issues**: Use request interception for testing offline scenarios

### Debug Tips

```javascript
// Enable request/response logging
page.on('request', request => console.log('Request:', request.url()));
page.on('response', response => console.log('Response:', response.url(), response.status()));

// Use trace viewer for debugging
await page.context().tracing.start({ screenshots: true, snapshots: true });
// ... run tests ...
await page.context().tracing.stop({ path: 'trace.zip' });
```

This guide provides a comprehensive overview of API testing with the Playwright automation framework. For more examples and advanced patterns, refer to the test files in the `tests/` directory.
