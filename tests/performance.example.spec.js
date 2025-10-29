const { performanceTest } = require('../fixtures/performanceFixture');
const { DashboardPage } = require('../pages/dashboard.page');

/**
 * Performance Test Example using Fixture
 * Demonstrates easy performance monitoring integration
 */
performanceTest.describe('Performance Testing with Fixture', () => {
    
    performanceTest('should measure dashboard performance', async ({ page, performanceMonitor }) => {
        const dashboardPage = new DashboardPage(page);
        
        // Navigate and measure performance
        await dashboardPage.navigateAndMeasurePerformance('https://example.com');
        
        // Wait for page to fully load
        await page.waitForTimeout(3000);
        
        // Collect all metrics (used for assertion)
        await performanceMonitor.collectAllMetrics();
        
        // Assert performance thresholds
        await dashboardPage.assertPerformance({
            lcp: 2500,
            fid: 100,
            cls: 0.1,
            totalLoad: 5000,
            ttfb: 800
        });
        
        // Print performance summary
        await performanceMonitor.printSummary();
    });

    performanceTest('should detect performance regressions', async ({ page, performanceMonitor }) => {
        // Navigate to page
        await page.goto('https://example.com', { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
        
        // Collect metrics
        const metrics = await performanceMonitor.collectAllMetrics();
        
        // Analyze performance
        const analysis = performanceMonitor.analyzePerformance(metrics);
        
        // Check for regressions
        if (analysis.recommendations.length > 0) {
            console.log('\n⚠️ Performance Issues Detected:');
            analysis.recommendations.forEach((rec, index) => {
                console.log(`${index + 1}. [${rec.severity.toUpperCase()}] ${rec.message}`);
            });
        }
        
        // Assert no critical issues
        const criticalIssues = analysis.recommendations.filter(r => r.severity === 'high');
        expect(criticalIssues.length).toBe(0);
    });
});
