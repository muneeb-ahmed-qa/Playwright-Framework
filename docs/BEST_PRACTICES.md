# Best Practices Guide

This guide outlines the best practices for using the Playwright automation framework effectively.

## Table of Contents

1. [Page Object Model](#page-object-model)
2. [Test Organization](#test-organization)
3. [Data Management](#data-management)
4. [Error Handling](#error-handling)
5. [Performance Optimization](#performance-optimization)
6. [Maintenance](#maintenance)
7. [CI/CD Integration](#cicd-integration)
8. [Debugging](#debugging)

## Page Object Model

### 1. Single Responsibility Principle

Each page object should represent a single page or component:

```javascript
// ✅ Good: Focused page object
class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.usernameField = page.locator('#username');
    this.passwordField = page.locator('#password');
    this.loginButton = page.locator('button[type="submit"]');
  }
  
  async login(username, password) {
    await this.fill(this.usernameField, username);
    await this.fill(this.passwordField, password);
    await this.click(this.loginButton);
  }
}

// ❌ Bad: Generic page object with everything
class AllPages extends BasePage {
  // Don't put all page elements in one class
}
```

### 2. Use Meaningful Selectors

```javascript
// ✅ Good: Specific, stable selectors
this.submitButton = page.locator('button[type="submit"]');
this.errorMessage = page.locator('.error-message[data-testid="login-error"]');

// ❌ Bad: Fragile selectors
this.submitButton = page.locator('button:nth-child(3)');
this.errorMessage = page.locator('div > span > p');
```

### 3. Encapsulate Page Logic

```javascript
// ✅ Good: Encapsulate complex interactions
async loginWithRememberMe(username, password) {
  await this.fill(this.usernameField, username);
  await this.fill(this.passwordField, password);
  await this.setCheckbox(this.rememberMeCheckbox, true);
  await this.click(this.loginButton);
}

// ❌ Bad: Expose internal implementation
async login(username, password, rememberMe) {
  await this.usernameField.fill(username);
  await this.passwordField.fill(password);
  if (rememberMe) {
    await this.rememberMeCheckbox.check();
  }
  await this.loginButton.click();
}
```

## Test Organization

### 1. Group Related Tests

```javascript
// ✅ Good: Logical grouping
test.describe('User Authentication', () => {
  test.describe('Login', () => {
    test('should login with valid credentials', async () => {
      // Test implementation
    });
    
    test('should show error with invalid credentials', async () => {
      // Test implementation
    });
  });
  
  test.describe('Logout', () => {
    test('should logout successfully', async () => {
      // Test implementation
    });
  });
});
```

### 2. Use Descriptive Test Names

```javascript
// ✅ Good: Descriptive test names
test('should display error message when user enters invalid email format', async () => {
  // Test implementation
});

// ❌ Bad: Vague test names
test('should work', async () => {
  // Test implementation
});
```

### 3. Keep Tests Independent

```javascript
// ✅ Good: Independent tests
test('should login successfully', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navigateToLogin();
  await loginPage.login('user@example.com', 'password123');
  await loginPage.expectRedirectAfterLogin(/dashboard/);
});

test('should logout successfully', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navigateToLogin();
  await loginPage.login('user@example.com', 'password123');
  await loginPage.logout();
  await loginPage.expectRedirectAfterLogout(/login/);
});

// ❌ Bad: Dependent tests
let loggedInUser;

test('should login successfully', async ({ page }) => {
  // Login and store user
  loggedInUser = await loginUser(page);
});

test('should access user profile', async ({ page }) => {
  // Depends on previous test
  await page.goto(`/profile/${loggedInUser.id}`);
});
```

## Data Management

### 1. Use Test Data Generator

```javascript
// ✅ Good: Dynamic test data
const { TestDataGenerator } = require('../utils/testDataGenerator');

test('should create user with generated data', async ({ page }) => {
  const dataGenerator = new TestDataGenerator();
  const userData = dataGenerator.generateUserData({
    role: 'admin',
    department: 'Engineering'
  });
  
  await formPage.fillForm(userData);
});

// ❌ Bad: Hardcoded test data
test('should create user', async ({ page }) => {
  const userData = {
    name: 'John Doe',
    email: 'john@example.com'
  };
  
  await formPage.fillForm(userData);
});
```

### 2. Use Fixtures for Static Data

```javascript
// ✅ Good: Use fixtures for static data
const testData = require('../fixtures/testData.json');

test('should login with admin user', async ({ page }) => {
  const adminUser = testData.users.admin;
  await loginPage.login(adminUser.username, adminUser.password);
});

// ❌ Bad: Hardcoded static data
test('should login with admin user', async ({ page }) => {
  await loginPage.login('admin@example.com', 'admin123');
});
```

### 3. Clean Up Test Data

```javascript
// ✅ Good: Clean up after tests
test.afterEach(async ({ page }) => {
  // Clean up test data
  await apiHelper.delete('/api/test-users');
});

// ❌ Bad: Leave test data behind
test('should create user', async ({ page }) => {
  // Creates user but doesn't clean up
});
```

## Error Handling

### 1. Use Proper Assertions

```javascript
// ✅ Good: Specific assertions
await expect(page.locator('.error-message')).toContainText('Invalid email format');
await expect(page.locator('#username')).toHaveValue('test@example.com');

// ❌ Bad: Generic assertions
await expect(page.locator('.error-message')).toBeVisible();
await expect(page.locator('#username')).toBeVisible();
```

### 2. Handle Async Operations

```javascript
// ✅ Good: Wait for async operations
await page.waitForResponse('**/api/users');
await page.waitForLoadState('networkidle');

// ❌ Bad: Assume immediate completion
await page.click('#submit-button');
// Missing wait for response
```

### 3. Use Retry Logic

```javascript
// ✅ Good: Retry flaky operations
async function waitForElementWithRetry(locator, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await locator.waitFor({ state: 'visible', timeout: 5000 });
      return;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await page.waitForTimeout(1000);
    }
  }
}
```

## Performance Optimization

### 1. Use Parallel Execution

```javascript
// ✅ Good: Parallel test execution
test.describe.configure({ mode: 'parallel' });

test.describe('Independent Tests', () => {
  test('test 1', async () => { /* ... */ });
  test('test 2', async () => { /* ... */ });
  test('test 3', async () => { /* ... */ });
});
```

### 2. Optimize Selectors

```javascript
// ✅ Good: Efficient selectors
this.submitButton = page.locator('button[type="submit"]');
this.errorMessage = page.locator('[data-testid="error-message"]');

// ❌ Bad: Inefficient selectors
this.submitButton = page.locator('div > form > div > button:nth-child(3)');
this.errorMessage = page.locator('body > div > div > div > span > p');
```

### 3. Use Page Object Caching

```javascript
// ✅ Good: Cache page objects
class TestHelper {
  constructor(page) {
    this.page = page;
    this._loginPage = null;
  }
  
  get loginPage() {
    if (!this._loginPage) {
      this._loginPage = new LoginPage(this.page);
    }
    return this._loginPage;
  }
}
```

## Maintenance

### 1. Regular Refactoring

```javascript
// ✅ Good: Regular refactoring
// Extract common functionality
async function fillFormWithData(formPage, data) {
  for (const [field, value] of Object.entries(data)) {
    await formPage.fillField(field, value);
  }
}

// ❌ Bad: Copy-paste code
test('should fill form 1', async () => {
  await formPage.fillField('name', 'John');
  await formPage.fillField('email', 'john@example.com');
  // ... repeated code
});
```

### 2. Use Constants

```javascript
// ✅ Good: Use constants
const SELECTORS = {
  USERNAME_FIELD: '#username',
  PASSWORD_FIELD: '#password',
  LOGIN_BUTTON: 'button[type="submit"]'
};

class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.usernameField = page.locator(SELECTORS.USERNAME_FIELD);
    this.passwordField = page.locator(SELECTORS.PASSWORD_FIELD);
    this.loginButton = page.locator(SELECTORS.LOGIN_BUTTON);
  }
}
```

### 3. Document Complex Logic

```javascript
// ✅ Good: Document complex logic
/**
 * Handles multi-step form submission with validation
 * @param {Object} formData - Form data object
 * @param {Object} options - Submission options
 * @returns {Promise<Object>} Submission result
 */
async function submitMultiStepForm(formData, options = {}) {
  // Implementation with clear comments
  // Step 1: Validate required fields
  // Step 2: Submit form
  // Step 3: Handle response
}
```

## CI/CD Integration

### 1. Environment Configuration

```javascript
// ✅ Good: Environment-specific configuration
const config = {
  baseURL: process.env.BASE_URL || 'https://example.com',
  apiURL: process.env.API_URL || 'https://api.example.com',
  timeout: process.env.TIMEOUT || 30000
};
```

### 2. Test Reporting

```javascript
// ✅ Good: Comprehensive reporting
reporter: [
  ['html', { outputFolder: 'playwright-report' }],
  ['json', { outputFile: 'test-results.json' }],
  ['junit', { outputFile: 'test-results.xml' }]
];
```

### 3. Parallel Execution

```javascript
// ✅ Good: Optimize for CI
module.exports = defineConfig({
  workers: process.env.CI ? 2 : undefined,
  retries: process.env.CI ? 2 : 0,
  timeout: process.env.CI ? 60000 : 30000
});
```

## Debugging

### 1. Use Debug Mode

```bash
# Debug specific test
npx playwright test tests/login.spec.js --debug

# Debug with specific browser
npx playwright test --debug --project=chromium
```

### 2. Add Logging

```javascript
// ✅ Good: Add meaningful logging
test('should login successfully', async ({ page }) => {
  console.log('Starting login test');
  
  const loginPage = new LoginPage(page);
  await loginPage.navigateToLogin();
  console.log('Navigated to login page');
  
  await loginPage.login('user@example.com', 'password123');
  console.log('Submitted login form');
  
  await loginPage.expectRedirectAfterLogin(/dashboard/);
  console.log('Login successful');
});
```

### 3. Use Screenshots and Videos

```javascript
// ✅ Good: Capture evidence
test('should handle error gracefully', async ({ page }) => {
  try {
    await loginPage.login('invalid@example.com', 'wrongpassword');
  } catch (error) {
    await page.screenshot({ path: 'error-screenshot.png' });
    throw error;
  }
});
```

## Common Anti-Patterns to Avoid

### 1. Don't Use Thread.sleep()

```javascript
// ❌ Bad: Hard-coded waits
await page.waitForTimeout(5000);

// ✅ Good: Wait for specific conditions
await page.waitForResponse('**/api/users');
await page.waitForLoadState('networkidle');
```

### 2. Don't Ignore Errors

```javascript
// ❌ Bad: Ignore errors
try {
  await page.click('#button');
} catch (error) {
  // Ignore error
}

// ✅ Good: Handle errors appropriately
try {
  await page.click('#button');
} catch (error) {
  console.error('Failed to click button:', error);
  throw error;
}
```

### 3. Don't Use Brittle Selectors

```javascript
// ❌ Bad: Brittle selectors
this.button = page.locator('div:nth-child(3) > button:nth-child(2)');

// ✅ Good: Stable selectors
this.button = page.locator('button[data-testid="submit-button"]');
```

## Conclusion

Following these best practices will help you create maintainable, reliable, and efficient test automation. Remember to:

- Keep tests simple and focused
- Use meaningful names and documentation
- Handle errors gracefully
- Optimize for performance
- Regular refactoring and maintenance
- Proper CI/CD integration

For more specific examples and patterns, refer to the test files in the `tests/` directory and the API testing guide.
