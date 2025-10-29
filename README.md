# 🎭 Playwright Automation Framework

A comprehensive, showcase-ready Playwright automation framework designed to demonstrate advanced testing capabilities, best practices, and modern web automation techniques.

## 🌟 Features

- **Generic Page Object Model** - Reusable base classes and page objects
- **Multi-Browser Support** - Chrome, Firefox, Safari, and mobile browsers
- **API Testing Integration** - Built-in API helper utilities
- **Advanced Test Data Management** - Dynamic data generation, validation, and cleanup
- **Password Encryption System** - Secure password handling and encryption utilities
- **Gmail API Integration** - Email automation, link clicking, and tab switching
- **Performance Testing & Monitoring** - Core Web Vitals, network analysis, memory tracking
- **Cross-Platform Testing** - Desktop, tablet, and mobile viewports
- **Comprehensive Reporting** - HTML, JSON, and JUnit reports
- **CI/CD Ready** - GitHub Actions, Docker, Kubernetes, Helm charts
- **Environment Configuration** - Flexible environment-specific settings
- **CLI Tools** - Command-line utilities for data management and setup

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd playwright-automation-framework

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Configuration

1. **Update Base URL**: Edit `playwright.config.js` and set your application URL:
```javascript
use: {
  baseURL: 'https://your-app.com', // Update this
}
```

2. **Environment Variables**: Create `.env` file:
```bash
BASE_URL=https://your-app.com
API_BASE_URL=https://api.your-app.com
ENVIRONMENT=staging
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npx playwright test tests/login.spec.js

# Run tests in headed mode
npx playwright test --headed

# Run tests in specific browser
npx playwright test --project=chromium

# Run tests with debug mode
npx playwright test --debug

# Run password encryption tests
npm run test:encryption

# Generate secure password
npm run generate-password

# Use password encryption utility
npm run encrypt

# Setup encrypted credentials
npm run setup:credentials

# Run performance tests
npm run test:performance

# Run data management tests
npm run test:data-management

# Setup Gmail API
npm run setup:google-api
```

## 📋 Available Scripts

### Test Execution
```bash
# Basic test execution
npm test                      # Run all tests
npm run test:headed          # Run tests in headed mode
npm run test:debug           # Run tests in debug mode
npm run test:ui              # Run tests with UI mode

# Browser-specific tests
npm run test:chrome          # Run tests in Chrome
npm run test:firefox         # Run tests in Firefox
npm run test:safari          # Run tests in Safari
npm run test:mobile          # Run tests on mobile devices

# Parallel execution
npm run test:parallel        # Run tests in parallel (4 workers)
npm run test:serial          # Run tests serially (1 worker)
npm run test:retry           # Run tests with retries

# Specific test suites
npm run test:encryption      # Password encryption tests
npm run test:performance     # Performance tests
npm run test:data-management # Data management tests
```

### Data Management
```bash
# Test data operations
npm run data:generate        # Generate test data
npm run data:cleanup         # Clean up test data
npm run data:validate        # Validate test data
npm run data:export          # Export test data
npm run data:import          # Import test data
npm run data:stats           # Show data statistics
npm run data:help            # Show data CLI help
```

### Security & Encryption
```bash
# Password management
npm run encrypt              # Encrypt a password
npm run generate-password    # Generate secure password
npm run setup:credentials    # Setup encrypted credentials
npm run test:encryption      # Test encryption functionality
```

### Gmail Integration
```bash
# Gmail API setup
npm run setup:google-api     # Interactive Gmail API setup
npm run setup:google-api:url # Generate OAuth URL
npm run setup:google-api:exchange # Exchange auth code for tokens
```

### Performance Testing
```bash
# Performance tests
npm run test:performance     # Run performance tests
npm run test:performance:headed # Run performance tests in headed mode
```

### CI/CD & Deployment
```bash
# Docker operations
npm run docker:build        # Build Docker image
npm run docker:run          # Run tests in Docker
npm run docker:compose:up   # Start with Docker Compose
npm run docker:compose:down # Stop Docker Compose

# Kubernetes deployment
npm run k8s:deploy          # Deploy to Kubernetes
npm run k8s:delete          # Delete from Kubernetes

# Helm operations
npm run helm:install        # Install with Helm
npm run helm:upgrade        # Upgrade Helm release
npm run helm:uninstall      # Uninstall Helm release

# Environment-specific deployment
npm run deploy:staging      # Deploy to staging
npm run deploy:production   # Deploy to production
npm run deploy:rollback     # Rollback deployment
```

### Development & Maintenance
```bash
# Code quality
npm run lint                # Run ESLint
npm run lint:fix            # Fix ESLint issues

# Browser management
npm run install:browsers    # Install Playwright browsers
npm run install:deps        # Install browsers with dependencies

# Reporting
npm run test:show-report    # Show test report
npm run test:show-trace     # Show test trace
npm run test:update-snapshots # Update visual snapshots

# Code generation
npm run test:codegen        # Generate test code
```

## 🏗️ Architecture

The framework follows a **layered, modular architecture** designed for enterprise-grade testing capabilities. For detailed architecture documentation, see [ARCHITECTURE.md](docs/ARCHITECTURE.md).

### Key Architectural Principles
- **Separation of Concerns**: Clear layer boundaries and responsibilities
- **Dependency Injection**: Loose coupling between components  
- **Configuration-Driven**: Environment-specific behavior
- **Security-First**: Encrypted credentials and secure practices
- **Performance-Optimized**: Built-in monitoring and optimization
- **Cloud-Native**: Containerized and orchestrated deployment

## 📁 Project Structure

```
playwright-automation-framework/
├── pages/                     # Page Object Classes
│   ├── base.page.js          # Base page with performance monitoring & tab switching
│   ├── login.page.js         # Login page with encrypted credentials
│   ├── dashboard.page.js     # Dashboard page object
│   └── form.page.js          # Generic form page with validation
├── tests/                     # Test Files
│   ├── login.spec.js         # Login functionality tests
│   ├── dashboard.spec.js     # Dashboard tests
│   ├── form.spec.js          # Form handling tests
│   ├── gmail.spec.js         # Gmail API integration tests
│   ├── performance.spec.js   # Performance testing
│   ├── testDataManagement.spec.js # Data management tests
│   └── passwordEncryption.spec.js # Encryption tests
├── utils/                     # Utility Classes
│   ├── testDataManager.js    # Advanced test data management
│   ├── testDataGenerator.js  # Dynamic test data generation
│   ├── apiHelper.js          # API testing utilities
│   ├── gmailApiService.js    # Gmail API integration
│   ├── gmailPlaywrightService.js # Gmail + Playwright hybrid
│   ├── performanceMonitor.js # Performance monitoring
│   ├── passwordEncryption.js # Password encryption utilities
│   ├── envConfig.js          # Environment configuration
│   ├── global-setup.js       # Global test setup
│   └── global-teardown.js    # Global test teardown
├── scripts/                   # CLI Tools
│   ├── encryptPassword.js    # Password encryption CLI
│   ├── setupEncryptedCredentials.js # Credential setup
│   ├── setupGoogleApi.js     # Gmail API setup
│   ├── testDataCli.js        # Data management CLI
│   └── deploy.sh             # Deployment script
├── test-data/                 # Test Data Directory
│   ├── json/                 # JSON test data
│   ├── csv/                  # CSV test data
│   └── config/               # Environment configs
├── fixtures/                  # Test Fixtures
│   ├── performanceFixture.js # Performance test data
│   └── dataDrivenFixture.js  # Data-driven test fixtures
├── docs/                      # Documentation
│   ├── ARCHITECTURE.md       # Framework architecture
│   ├── BEST_PRACTICES.md     # Testing best practices
│   ├── API_TESTING_GUIDE.md  # API testing guide
│   └── CI_CD_SETUP.md        # CI/CD setup guide
├── .github/                   # GitHub Actions
│   └── workflows/            # CI/CD workflows
├── k8s/                       # Kubernetes manifests
├── helm/                      # Helm charts
├── .env.example              # Environment template
├── .env                      # Environment variables
├── playwright.config.js       # Playwright configuration
├── package.json              # Dependencies and scripts
└── README.md                 # This file
```

## 🎯 Page Object Model

### Base Page Class

The `BasePage` class provides common functionality that can be extended by specific page classes:

```javascript
const { BasePage } = require('./pages/base.page');

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
```

### Key Features of Base Page

- **Element Interactions**: Click, fill, type, select
- **Assertions**: Visibility, text, value, state checks
- **Waits**: Element visibility, page load, network requests
- **Screenshots**: Automatic and manual screenshot capture
- **Storage Management**: Local storage, session storage, cookies
- **JavaScript Execution**: Run custom scripts in page context

## 🔐 Password Encryption

The framework includes comprehensive password encryption utilities for secure test data handling:

### Basic Usage

```javascript
const { PasswordEncryptionHelper } = require('./utils/passwordEncryption');

test('should handle encrypted credentials', async ({ page }) => {
  const passwordHelper = new PasswordEncryptionHelper();
  
  // Encrypt test credentials
  const credentials = {
    username: 'test@example.com',
    password: 'SecurePassword123!'
  };
  
  const encryptedCredentials = passwordHelper.encryptCredentials(credentials);
  
  // Use encrypted credentials in test
  await loginPage.login(encryptedCredentials.username, encryptedCredentials.password);
});
```

### CLI Usage

```bash
# Encrypt a password
npm run encrypt encrypt "mypassword"

# Decrypt a password
npm run encrypt decrypt "encrypted-password"

# Generate secure password
npm run generate-password

# Hash a password
npm run encrypt hash "mypassword"
```

### Advanced Features

- **AES-256-CBC Encryption** - Industry-standard encryption
- **Password Policy Validation** - Customizable password rules
- **Secure Token Generation** - Time-based secure tokens
- **Test Data Encryption** - Encrypt sensitive test data
- **API Key Management** - Secure API key handling

## 📧 Gmail Integration

The framework includes comprehensive Gmail integration using Google Gmail API on the backend combined with Playwright for link clicking and verification. This approach provides:

- **Fast email operations** via Gmail API
- **Reliable link clicking** via Playwright
- **Secure token management** with encryption
- **Comprehensive email management** capabilities

### Setup

Set up Google API credentials:

```bash
# Install Google API dependency
npm install googleapis

# Set up Google API credentials
npm run setup:google-api
```

This will guide you through:
1. Creating Google Cloud Console project
2. Enabling Gmail API
3. Creating OAuth2 credentials
4. Authorizing the application
5. Storing encrypted tokens

Or manually add to `.env`:
```bash
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth2callback
ENCRYPTED_GOOGLE_ACCESS_TOKEN=encrypted-access-token
ENCRYPTED_GOOGLE_REFRESH_TOKEN=encrypted-refresh-token
```

### Basic Usage

```javascript
const { GmailPlaywrightService } = require('./utils/gmailPlaywrightService');

test('should find email and click link using Gmail API', async ({ page }) => {
  const gmailService = new GmailPlaywrightService(page);
  await gmailService.initialize();
  
  // Find email using Gmail API (faster, more reliable)
  const email = await gmailService.findEmailBySubject('Confirm Your Account');
  
  // Click link and verify text on new tab
  const textFound = await gmailService.clickEmailLinkAndVerify(
    email,
    'Confirm',
    'Account Confirmed',
    { waitForNewTab: true }
  );
  
  expect(textFound).toBe(true);
});
```

### Advanced Features

- **Fast Email Search**: Find emails by subject, sender, or custom queries using Gmail API
- **Email Management**: Archive, delete, or mark emails as read via API
- **Wait for Email**: Poll Gmail API for new emails
- **Link Extraction**: Extract links from email body automatically
- **Secure Token Management**: Encrypted access and refresh tokens
- **Link Clicking**: Click links in emails and handle new tabs
- **Tab Switching**: Switch between tabs by URL, title, or index
- **Text Verification**: Verify text on newly opened pages
- **Visual Verification**: Take screenshots and verify page elements

### Convenience Methods

```javascript
// Find email and click link in one method
const textFound = await gmailService.openEmailAndClickLink(
  'Verify Your Email',
  'Verify',
  'Email Verified Successfully',
  { waitForNewTab: true }
);

// Wait for email to arrive using API
const email = await gmailService.waitForEmail('Verification Code', {
  timeout: 60000,
  from: 'noreply@example.com'
});

// Click link and verify text
const verified = await gmailService.clickEmailLinkAndVerify(
  email,
  'Verify',
  'Verification Successful'
);
```

### Tab Switching Utilities

```javascript
// Switch to tab by index
await gmailService.switchToTab(1);

// Switch to tab by URL pattern
await gmailService.switchToTabByUrl('example.com/confirm');

// Get all tabs
const tabs = await gmailService.getAllTabs();

// Close specific tab
await gmailService.closeTab(1);

// Close all tabs except current
await gmailService.closeOtherTabs();
```

### Running Tests

```bash
# Run Gmail integration tests
npm run test:gmail

# Set up Google API credentials
npm run setup:google-api
```

## ⚡ Performance Testing & Monitoring

The framework includes comprehensive performance testing and monitoring capabilities to track Core Web Vitals, network performance, resource loading, and memory usage.

### Features

- **Core Web Vitals Tracking**: LCP, FID, CLS, FCP, TTI
- **Network Performance**: DNS, TCP, TTFB, download times
- **Resource Analysis**: Track resource loading times and sizes
- **Memory Monitoring**: JavaScript heap usage tracking
- **Performance Regression Detection**: Automatic threshold checking
- **Custom Metrics**: Measure any custom operation performance
- **Performance Reports**: Generate detailed JSON reports

### Basic Usage

```javascript
const { test } = require('@playwright/test');
const { PerformanceMonitor } = require('./utils/performanceMonitor');

test('should measure page performance', async ({ page }) => {
  const perfMonitor = new PerformanceMonitor(page);
  await perfMonitor.startMonitoring();
  
  // Navigate to page
  await page.goto('https://example.com', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  // Collect all metrics
  const metrics = await perfMonitor.collectAllMetrics();
  
  // Assert performance thresholds
  expect(metrics.webVitals.lcp).toBeLessThan(2500); // LCP should be < 2.5s
  expect(metrics.webVitals.cls).toBeLessThan(0.1);   // CLS should be < 0.1
  expect(metrics.navigation.total).toBeLessThan(5000); // Total load < 5s
  
  // Print performance summary
  await perfMonitor.printSummary();
});
```

### Using with Page Objects

```javascript
const { DashboardPage } = require('./pages/dashboard.page');

test('should measure dashboard performance', async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  
  // Navigate and measure performance in one call
  const metrics = await dashboardPage.navigateAndMeasurePerformance('https://example.com');
  
  // Assert performance thresholds
  await dashboardPage.assertPerformance({
    lcp: 2500,
    fid: 100,
    cls: 0.1,
    totalLoad: 5000,
    ttfb: 800
  });
});
```

### Using Performance Fixture

```javascript
const { performanceTest } = require('./fixtures/performanceFixture');

performanceTest('should measure performance with fixture', async ({ page, performanceMonitor }) => {
  await page.goto('https://example.com');
  await page.waitForTimeout(3000);
  
  const metrics = await performanceMonitor.collectAllMetrics();
  const analysis = performanceMonitor.analyzePerformance(metrics);
  
  // Check for performance issues
  expect(analysis.recommendations.length).toBe(0);
});
```

### Core Web Vitals

```javascript
// Track Core Web Vitals
const webVitals = await perfMonitor.getWebVitals();

// LCP (Largest Contentful Paint) - Should be < 2500ms
console.log(`LCP: ${webVitals.lcp}ms`);

// FID (First Input Delay) - Should be < 100ms
console.log(`FID: ${webVitals.fid}ms`);

// CLS (Cumulative Layout Shift) - Should be < 0.1
console.log(`CLS: ${webVitals.cls}`);

// FCP (First Contentful Paint) - Should be < 1800ms
console.log(`FCP: ${webVitals.fcp}ms`);

// TTI (Time to Interactive) - Should be < 3800ms
console.log(`TTI: ${webVitals.tti}ms`);
```

### Network Performance

```javascript
const networkMetrics = await perfMonitor.getNetworkMetrics();

console.log(`DNS Lookup: ${networkMetrics.dns}ms`);
console.log(`TCP Connection: ${networkMetrics.tcp}ms`);
console.log(`TTFB: ${networkMetrics.ttfb}ms`);
console.log(`Download: ${networkMetrics.download}ms`);
console.log(`Total Load: ${networkMetrics.total}ms`);
```

### Resource Analysis

```javascript
const resources = await perfMonitor.getResourceMetrics();

// Find slow resources
const slowResources = resources.filter(r => r.duration > 1000);
console.log(`Slow resources: ${slowResources.length}`);

// Find large resources
const largeResources = resources.filter(r => r.size > 100000);
console.log(`Large resources (>100KB): ${largeResources.length}`);
```

### Performance Analysis & Recommendations

```javascript
const analysis = perfMonitor.analyzePerformance(metrics);

// Get performance scores
console.log(`LCP Score: ${analysis.scores.lcp}`); // 'good', 'needs-improvement', or 'poor'

// Get recommendations
analysis.recommendations.forEach(rec => {
  console.log(`[${rec.severity}] ${rec.message}`);
});
```

### Performance Regression Detection

```javascript
test('should detect performance regressions', async ({ page }) => {
  const perfMonitor = new PerformanceMonitor(page);
  await perfMonitor.startMonitoring();
  
  await page.goto('https://example.com');
  await page.waitForTimeout(3000);
  
  const metrics = await perfMonitor.collectAllMetrics();
  const analysis = perfMonitor.analyzePerformance(metrics);
  
  // Check for regressions
  const regressions = analysis.recommendations.filter(r => r.severity === 'high');
  expect(regressions.length).toBe(0);
});
```

### Custom Performance Metrics

```javascript
// Measure custom operation
const duration = await perfMonitor.measureCustom('customOperation', async () => {
  await page.click('#button');
  await page.waitForSelector('.result');
});

console.log(`Custom operation took: ${duration}ms`);
```

### Generate Performance Reports

```javascript
// Generate and save performance report
const report = await perfMonitor.generateReport('test-results/performance-report.json');

// Report includes:
// - All metrics (Web Vitals, network, resources, memory)
// - Performance analysis
// - Recommendations
// - Performance scores
```

### Running Performance Tests

```bash
# Run all performance tests
npm run test:performance

# Run performance tests in headed mode
npm run test:performance:headed

# Run specific performance test
npx playwright test tests/performance.spec.js
```

### Performance Thresholds

The framework uses industry-standard performance thresholds:

- **LCP**: < 2500ms (Good), < 4000ms (Needs Improvement)
- **FID**: < 100ms (Good), < 300ms (Needs Improvement)
- **CLS**: < 0.1 (Good), < 0.25 (Needs Improvement)
- **FCP**: < 1800ms (Good), < 3000ms (Needs Improvement)
- **TTI**: < 3800ms (Good), < 7300ms (Needs Improvement)

## 📊 Advanced Test Data Management

The framework includes a comprehensive test data management system for dynamic data generation, environment-specific configurations, and data-driven testing patterns.

### Features

- **Dynamic Data Generation**: Generate realistic test data using Faker.js
- **Environment-Specific Data**: Different data configurations per environment
- **Data-Driven Testing**: CSV and JSON data-driven test patterns
- **Data Validation**: Built-in validation schemas
- **Data Cleanup**: Automatic cleanup strategies
- **CLI Tools**: Command-line interface for data management
- **Data Export/Import**: Export and import test data in multiple formats

### Basic Usage

```javascript
const { TestDataManager } = require('./utils/testDataManager');

test('should test with generated data', async ({ page }) => {
  const dataManager = new TestDataManager();
  
  // Generate user data
  const user = dataManager.generateUser({
    role: 'admin',
    includeProfile: true,
    encryptedPassword: true
  });
  
  // Use generated data in test
  await page.fill('[name="email"]', user.email);
  await page.fill('[name="password"]', user.plainPassword);
  
  // Cleanup after test
  await dataManager.cleanup();
});
```

### Data Generation

```javascript
// Generate users
const users = dataManager.generateUsers(10, {
  role: 'user',
  includeProfile: true,
  includePreferences: true
});

// Generate products
const product = dataManager.generateProduct({
  category: 'electronics',
  priceRange: { min: 100, max: 500 },
  includeImages: true,
  includeReviews: true
});

// Generate orders
const order = dataManager.generateOrder({
  userId: user.id,
  productIds: [product.id],
  includeItems: true
});

// Generate API test data
const apiData = dataManager.generateApiData('/api/users', {
  method: 'POST',
  includeHeaders: true,
  includeAuth: true
});
```

### Data-Driven Testing with Fixtures

```javascript
const { dataDrivenTest } = require('./fixtures/dataDrivenFixture');

dataDrivenTest('should test with generated user', async ({ page, testUser }) => {
  await page.goto('/register');
  await page.fill('[name="email"]', testUser.email);
  await page.fill('[name="password"]', testUser.plainPassword);
  await page.click('[type="submit"]');
  
  // Test automatically uses generated user data
});
```

### CSV Data-Driven Testing

```javascript
const { csvTest } = require('./fixtures/dataDrivenFixture');

csvTest('should test login with CSV data', async ({ page, csvData }) => {
  for (const testCase of csvData) {
    await page.fill('[name="username"]', testCase.username);
    await page.fill('[name="password"]', testCase.password);
    await page.click('[type="submit"]');
    
    if (testCase.expectedResult === 'success') {
      await expect(page.locator('.dashboard')).toBeVisible();
    } else {
      await expect(page.locator('.error')).toBeVisible();
    }
  }
});
```

### JSON Data-Driven Testing

```javascript
const { jsonTest } = require('./fixtures/dataDrivenFixture');

jsonTest('should test API with JSON data', async ({ page, jsonData }) => {
  for (const scenario of jsonData.scenarios) {
    await page.goto('/api-test');
    await page.fill('[name="endpoint"]', scenario.endpoint);
    await page.fill('[name="data"]', JSON.stringify(scenario.data));
    await page.click('.submit');
    
    await expect(page.locator('.status')).toContainText(scenario.expectedStatus);
  }
});
```

### Data Validation

```javascript
const schema = {
  email: { required: true, type: 'string', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  username: { required: true, type: 'string', minLength: 3 },
  role: { required: true, type: 'string', enum: ['admin', 'user', 'guest'] }
};

const validation = dataManager.validateData(user, schema);
expect(validation.isValid).toBe(true);
```

### Environment-Specific Configuration

```javascript
// test-data/config/test.json
{
  "users": {
    "count": 10,
    "roles": ["admin", "user", "guest"],
    "domains": ["example.com", "test.com"]
  },
  "products": {
    "categories": ["electronics", "clothing", "books"],
    "priceRange": { "min": 10, "max": 1000 }
  }
}

// test-data/config/production.json
{
  "users": {
    "count": 5,
    "roles": ["admin", "user"],
    "domains": ["company.com"]
  },
  "products": {
    "categories": ["electronics", "clothing"],
    "priceRange": { "min": 50, "max": 500 }
  }
}
```

### Data Cleanup Strategies

```javascript
// Automatic cleanup
const dataManager = new TestDataManager({
  cleanupStrategy: 'auto'
});

// Manual cleanup
await dataManager.cleanup('database');
await dataManager.cleanup('api');
await dataManager.cleanup('file');
await dataManager.cleanup('all');

// Custom cleanup hooks
dataManager.registerCleanupHook(async () => {
  // Custom cleanup logic
  console.log('Custom cleanup executed');
});
```

### CLI Commands

```bash
# Generate test data
npm run data:generate users 10 --role admin --includeProfile
npm run data:generate products 5 --category electronics
npm run data:generate orders 3 --includeItems

# Cleanup data
npm run data:cleanup auto
npm run data:cleanup database

# Validate data
npm run data:validate test-data.json fixtures

# Export/Import data
npm run data:export users json users-export
npm run data:export users csv users-export
npm run data:import data.json

# Show statistics
npm run data:stats

# Get help
npm run data:help
```

### Data Management Features

- **Realistic Data**: Uses Faker.js for realistic test data generation
- **Encrypted Passwords**: Automatic password encryption for security
- **Data Relationships**: Generate related data (users with orders, products with reviews)
- **Custom Schemas**: Define validation schemas for data integrity
- **Multiple Formats**: Support for JSON, CSV data formats
- **Environment Awareness**: Different data configurations per environment
- **Cleanup Automation**: Automatic cleanup after tests
- **Statistics Tracking**: Track generated data statistics
- **CLI Interface**: Command-line tools for data management

### Running Data Management Tests

```bash
# Run data management tests
npm run test:data-management

# Generate sample data
npm run data:generate users 5
npm run data:generate products 10

# View data statistics
npm run data:stats
```

## 🚀 CI/CD Integration

The framework includes comprehensive CI/CD integration with GitHub Actions, Docker containerization, and Kubernetes deployment.

### Features

- **GitHub Actions Workflows**: CI, CD, and Security pipelines
- **Docker Multi-stage Builds**: Optimized for different environments
- **Kubernetes Deployment**: Production-ready manifests
- **Helm Charts**: Configurable deployment templates
- **Security Scanning**: Automated vulnerability detection
- **Multi-environment Support**: Staging and production configurations

### Quick Start

```bash
# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production

# Run with Docker
npm run docker:build
npm run docker:run

# Deploy to Kubernetes
npm run k8s:deploy

# Deploy with Helm
npm run helm:install
```

### CI/CD Pipeline

1. **Continuous Integration (CI)**:
   - Multi-browser testing (Chrome, Firefox, Safari)
   - Multi-Node.js version testing
   - Parallel test execution
   - Performance testing
   - Security scanning
   - Code quality checks

2. **Continuous Deployment (CD)**:
   - Automated Docker image building
   - Multi-environment deployment
   - Smoke testing
   - Rollback capabilities
   - Slack notifications

3. **Security Pipeline**:
   - Dependency vulnerability scanning
   - Code security analysis
   - Container security scanning
   - Secrets detection
   - License compliance

### Docker Support

```bash
# Build and run locally
docker build -t playwright-framework .
docker run -p 9323:9323 playwright-framework

# Use Docker Compose
docker-compose up -d
docker-compose logs -f playwright-tests
```

### Kubernetes Deployment

```bash
# Deploy to Kubernetes
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -n playwright-framework

# Access the application
kubectl port-forward service/playwright-framework-service 8080:80
```

### Helm Charts

```bash
# Install with Helm
helm install playwright-framework ./helm/playwright-framework \
  --values ./helm/values-staging.yaml

# Upgrade deployment
helm upgrade playwright-framework ./helm/playwright-framework

# Uninstall
helm uninstall playwright-framework
```

For detailed CI/CD setup instructions, see [CI/CD Setup Guide](docs/CI_CD_SETUP.md).

## 🧪 Test Examples

### Login Test Example

```javascript
const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/login.page');

test.describe('Login Functionality', () => {
  test('should login successfully with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    // Navigate to login page
    await loginPage.navigateToLogin('https://example.com');
    
    // Perform login
    await loginPage.login('test@example.com', 'password123');
    
    // Verify successful login
    await loginPage.expectRedirectAfterLogin(/dashboard/);
  });
});
```

### Form Test Example

```javascript
const { test } = require('@playwright/test');
const { FormPage } = require('../pages/form.page');

test('should submit contact form successfully', async ({ page }) => {
  const formPage = new FormPage(page);
  
  // Navigate to contact form
  await formPage.navigateToForm('https://example.com', '/contact');
  
  // Fill form with test data
  await formPage.fillForm({
    name: 'John Doe',
    email: 'john@example.com',
    message: 'Test message'
  });
  
  // Submit form
  await formPage.submitForm();
  
  // Verify success
  await formPage.expectVisible(formPage.successMessage);
});
```

### API Test Example

```javascript
const { test } = require('@playwright/test');
const { ApiHelper } = require('../utils/apiHelper');

test('should test API endpoints', async ({ page }) => {
  const apiHelper = new ApiHelper(page);
  
  // Set authentication
  apiHelper.setAuthToken('your-token-here');
  
  // Test GET request
  const response = await apiHelper.get('/api/users');
  expect(response.status).toBe(200);
  
  // Test POST request
  const userData = { name: 'John Doe', email: 'john@example.com' };
  const createResponse = await apiHelper.post('/api/users', userData);
  expect(createResponse.status).toBe(201);
});
```

## 📊 Data-Driven Testing

### Dynamic Test Data Generation

```javascript
const { TestDataGenerator } = require('../utils/testDataGenerator');

test('should test with generated data', async ({ page }) => {
  const dataGenerator = new TestDataGenerator();
  
  // Generate user data
  const userData = dataGenerator.generateUserData({
    role: 'admin',
    department: 'Engineering'
  });
  
  // Use generated data in test
  await formPage.fillForm(userData);
});
```

### Static Test Data

```javascript
const testData = require('../fixtures/testData.json');

test('should test with static data', async ({ page }) => {
  const user = testData.users.admin;
  await loginPage.login(user.username, user.password);
});
```

## 🔧 Configuration

### Environment-Specific Configuration

```javascript
// playwright.config.js
module.exports = defineConfig({
  projects: [
    {
      name: 'staging',
      use: { baseURL: 'https://staging.example.com' }
    },
    {
      name: 'production',
      use: { baseURL: 'https://example.com' }
    }
  ]
});
```

### Custom Test Configuration

```javascript
// Custom test configuration
test.describe.configure({ mode: 'parallel' });
test.describe.configure({ retries: 2 });
test.describe.configure({ timeout: 60000 });
```

## 📈 Reporting

### HTML Report

```bash
# Generate HTML report
npx playwright show-report
```

### Custom Reporting

```javascript
// Custom reporter example
reporter: [
  ['html', { outputFolder: 'custom-report' }],
  ['json', { outputFile: 'results.json' }],
  ['./custom-reporter.js'] // Custom reporter
]
```

## 🚀 CI/CD Integration

### GitHub Actions Example

```yaml
name: Playwright Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

### Jenkins Pipeline Example

```groovy
pipeline {
  agent any
  stages {
    stage('Install Dependencies') {
      steps {
        sh 'npm ci'
        sh 'npx playwright install --with-deps'
      }
    }
    stage('Run Tests') {
      steps {
        sh 'npx playwright test'
      }
      post {
        always {
          publishHTML([
            allowMissing: false,
            alwaysLinkToLastBuild: true,
            keepAll: true,
            reportDir: 'playwright-report',
            reportFiles: 'index.html',
            reportName: 'Playwright Report'
          ])
        }
      }
    }
  }
}
```

## 🎨 Best Practices

### 1. Page Object Design

```javascript
// Good: Specific, focused page object
class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.usernameField = page.locator('#username');
    this.passwordField = page.locator('#password');
  }
  
  async login(username, password) {
    await this.fill(this.usernameField, username);
    await this.fill(this.passwordField, password);
    await this.click(this.loginButton);
  }
}

// Avoid: Generic, unfocused page object
class AllPages extends BasePage {
  // Don't put everything in one class
}
```

### 2. Test Organization

```javascript
// Good: Organized test structure
test.describe('User Authentication', () => {
  test.describe('Login', () => {
    test('should login with valid credentials', async () => {
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

### 3. Data Management

```javascript
// Good: Use test data generator
const dataGenerator = new TestDataGenerator();
const userData = dataGenerator.generateUserData();

// Avoid: Hardcoded test data
const userData = {
  name: 'John Doe',
  email: 'john@example.com'
};
```

### 4. Error Handling

```javascript
// Good: Proper error handling
test('should handle network errors gracefully', async ({ page }) => {
  await page.route('**/api/users', route => route.abort());
  
  await expect(async () => {
    await apiHelper.get('/api/users');
  }).rejects.toThrow('Request failed');
});
```

## 🔍 Debugging

### Debug Mode

```bash
# Run tests in debug mode
npx playwright test --debug

# Debug specific test
npx playwright test tests/login.spec.js --debug
```

### Screenshots and Videos

```javascript
// Automatic screenshots on failure
use: {
  screenshot: 'only-on-failure',
  video: 'retain-on-failure'
}

// Manual screenshots
await page.screenshot({ path: 'debug-screenshot.png' });
```

### Trace Viewer

```bash
# Open trace viewer
npx playwright show-trace trace.zip
```

## 📚 Advanced Features

### Parallel Testing

```javascript
// Run tests in parallel
test.describe.configure({ mode: 'parallel' });

// Run specific tests in parallel
test.describe('Parallel Tests', () => {
  test('test 1', async () => { /* ... */ });
  test('test 2', async () => { /* ... */ });
});
```

### Cross-Browser Testing

```javascript
// Test on multiple browsers
test('should work on all browsers', async ({ page, browserName }) => {
  // Test implementation
  console.log(`Running on ${browserName}`);
});
```

### Mobile Testing

```javascript
// Test on mobile devices
test('should work on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  // Mobile-specific test implementation
});
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Playwright](https://playwright.dev/) - The amazing testing framework
- [Microsoft](https://microsoft.com/) - For creating Playwright
- The open-source community for inspiration and best practices

## 📞 Support

For questions, issues, or contributions, please:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Contact the maintainers

---

**Happy Testing! 🎭✨**