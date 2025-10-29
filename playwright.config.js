const { defineConfig, devices } = require('@playwright/test');

/**
 * Playwright Configuration
 * Generic configuration for showcase automation framework
 */
module.exports = defineConfig({
  // Test directory
  testDir: './tests',
  
  // Global test timeout
  timeout: 30 * 1000,
  
  // Expect timeout
  expect: {
    timeout: 5 * 1000,
  },
  
  // Test execution configuration
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter configuration
  reporter: [
    ['html', { 
      outputFolder: 'playwright-report',
      open: 'never' 
    }],
    ['json', { 
      outputFile: 'test-results.json' 
    }],
    ['junit', { 
      outputFile: 'test-results.xml' 
    }],
    ['list']
  ],
  
  // Global test configuration
  use: {
    // Base URL for your application
    baseURL: process.env.BASE_URL || 'https://example.com',
    
    // Browser context options
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Viewport size
    viewport: { width: 1280, height: 720 },
    
    // User agent
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    
    // Ignore HTTPS errors
    ignoreHTTPSErrors: true,
    
    // Action timeout
    actionTimeout: 10 * 1000,
    
    // Navigation timeout
    navigationTimeout: 30 * 1000,
  },

  // Test projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile testing
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    // Tablet testing
    {
      name: 'iPad',
      use: { ...devices['iPad Pro'] },
    },
  ],

  // Web server configuration (for local development)
  webServer: process.env.START_SERVER ? {
    command: 'npm run start',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  } : undefined,

  // Global setup and teardown
  globalSetup: require.resolve('./utils/global-setup.js'),
  globalTeardown: require.resolve('./utils/global-teardown.js'),

  // Test output directory
  outputDir: 'test-results/',

  // Test match patterns
  testMatch: [
    '**/*.spec.js',
    '**/*.test.js'
  ],

  // Test ignore patterns
  testIgnore: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**'
  ],

  // Maximum failures before stopping
  maxFailures: process.env.CI ? 10 : undefined,

  // Preserve output directory
  preserveOutput: 'failures-only',

  // Update snapshots
  updateSnapshots: process.env.UPDATE_SNAPSHOTS === 'true' ? 'all' : 'none',

  // Test timeout
  testTimeout: 30 * 1000,

  // Global timeout
  globalTimeout: 60 * 60 * 1000, // 1 hour

  // Configuration for different environments
  ...(process.env.ENVIRONMENT === 'staging' && {
    use: {
      baseURL: 'https://staging.example.com',
    }
  }),

  ...(process.env.ENVIRONMENT === 'production' && {
    use: {
      baseURL: 'https://example.com',
    }
  }),
});