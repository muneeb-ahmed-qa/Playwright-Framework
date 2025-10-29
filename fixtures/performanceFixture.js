const playwrightTest = require('@playwright/test');
const baseTest = playwrightTest.test;
const { PerformanceMonitor } = require('../utils/performanceMonitor');

/**
 * Performance Test Fixture
 * Extends Playwright test with performance monitoring capabilities
 */
const performanceTest = baseTest.extend({
    performanceMonitor: async ({ page }, use) => {
        const perfMonitor = new PerformanceMonitor(page);
        await perfMonitor.startMonitoring();
        await use(perfMonitor);
    },
});

module.exports = { performanceTest };
