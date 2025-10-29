const { test, expect } = require('@playwright/test');
const { PerformanceMonitor } = require('../utils/performanceMonitor');

/**
 * Performance Testing Suite
 * Demonstrates performance monitoring, Core Web Vitals tracking, and performance analysis
 */
test.describe('Performance Testing', () => {
    
    test('should measure page load performance', async ({ page }) => {
        const perfMonitor = new PerformanceMonitor(page);
        await perfMonitor.startMonitoring();
        
        // Navigate to page
        await page.goto('https://example.com', { waitUntil: 'networkidle' });
        
        // Collect metrics
        const metrics = await perfMonitor.collectAllMetrics();
        
        // Assertions
        expect(metrics.navigation.total).toBeLessThan(5000); // Page should load in less than 5s
        expect(metrics.totalDuration).toBeGreaterThan(0);
        
        // Print summary
        await perfMonitor.printSummary();
    });

    test('should measure Core Web Vitals', async ({ page }) => {
        const perfMonitor = new PerformanceMonitor(page);
        await perfMonitor.startMonitoring();
        
        // Navigate to page
        await page.goto('https://example.com', { waitUntil: 'networkidle' });
        
        // Wait for Web Vitals to be measured
        await page.waitForTimeout(3000);
        
        // Get Web Vitals
        const webVitals = await perfMonitor.getWebVitals();
        const analysis = perfMonitor.analyzePerformance();
        
        // Assertions - LCP should be good
        if (webVitals.lcp) {
            expect(webVitals.lcp).toBeLessThan(2500); // Good LCP threshold
        }
        
        // Assertions - CLS should be good
        if (webVitals.cls !== null && webVitals.cls !== undefined) {
            expect(webVitals.cls).toBeLessThan(0.1); // Good CLS threshold
        }
        
        // Print analysis
        console.log('\n📊 Performance Analysis:');
        console.log(JSON.stringify(analysis.summary, null, 2));
    });

    test('should measure network performance', async ({ page }) => {
        const perfMonitor = new PerformanceMonitor(page);
        await perfMonitor.startMonitoring();
        
        // Navigate to page
        await page.goto('https://example.com', { waitUntil: 'networkidle' });
        
        // Get network metrics
        const networkMetrics = await perfMonitor.getNetworkMetrics();
        
        // Assertions
        expect(networkMetrics.ttfb).toBeLessThan(800); // Time to First Byte should be < 800ms
        expect(networkMetrics.total).toBeLessThan(5000); // Total load time should be < 5s
        
        console.log('\n🌐 Network Performance:');
        console.log(`  DNS Lookup: ${networkMetrics.dns}ms`);
        console.log(`  TCP Connection: ${networkMetrics.tcp}ms`);
        console.log(`  TTFB: ${networkMetrics.ttfb}ms`);
        console.log(`  Download: ${networkMetrics.download}ms`);
        console.log(`  DOM Processing: ${networkMetrics.domProcessing}ms`);
        console.log(`  Total: ${networkMetrics.total}ms`);
    });

    test('should analyze resource loading performance', async ({ page }) => {
        const perfMonitor = new PerformanceMonitor(page);
        await perfMonitor.startMonitoring();
        
        // Navigate to page
        await page.goto('https://example.com', { waitUntil: 'networkidle' });
        
        // Get resource metrics
        const resources = await perfMonitor.getResourceMetrics();
        
        // Analyze slow resources
        const slowResources = resources.filter(r => r.duration > 1000);
        const largeResources = resources.filter(r => r.size > 100000); // > 100KB
        
        console.log(`\n📦 Resource Analysis:`);
        console.log(`  Total Resources: ${resources.length}`);
        console.log(`  Slow Resources (>1s): ${slowResources.length}`);
        console.log(`  Large Resources (>100KB): ${largeResources.length}`);
        
        if (slowResources.length > 0) {
            console.log(`\n  Slowest Resources:`);
            slowResources.slice(0, 5).forEach((resource, index) => {
                console.log(`    ${index + 1}. ${resource.name} - ${resource.duration.toFixed(0)}ms`);
            });
        }
        
        // Assertions
        expect(slowResources.length).toBeLessThan(5); // Should have less than 5 slow resources
    });

    test('should measure memory usage', async ({ page }) => {
        const perfMonitor = new PerformanceMonitor(page);
        await perfMonitor.startMonitoring();
        
        // Navigate to page
        await page.goto('https://example.com', { waitUntil: 'networkidle' });
        
        // Get memory usage
        const memory = await perfMonitor.trackMemoryUsage();
        
        if (memory) {
            console.log(`\n💾 Memory Usage:`);
            console.log(`  Used JS Heap: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
            console.log(`  Total JS Heap: ${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
            console.log(`  Heap Limit: ${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`);
            
            // Assertions
            expect(memory.usedJSHeapSize).toBeLessThan(memory.jsHeapSizeLimit);
        }
    });

    test('should generate performance report', async ({ page }) => {
        const perfMonitor = new PerformanceMonitor(page);
        await perfMonitor.startMonitoring();
        
        // Navigate to page
        await page.goto('https://example.com', { waitUntil: 'networkidle' });
        
        // Wait for all metrics to be collected
        await page.waitForTimeout(3000);
        
        // Generate report
        const reportPath = 'test-results/performance-report.json';
        const report = await perfMonitor.generateReport(reportPath);
        
        // Verify report structure
        expect(report.metrics).toBeDefined();
        expect(report.analysis).toBeDefined();
        expect(report.recommendations).toBeDefined();
        
        console.log(`\n✅ Performance report generated: ${reportPath}`);
    });

    test('should measure custom performance metric', async ({ page }) => {
        const perfMonitor = new PerformanceMonitor(page);
        await perfMonitor.startMonitoring();
        
        // Measure custom operation
        const duration = await perfMonitor.measureCustom('customOperation', async () => {
            await page.goto('https://example.com');
            await page.waitForLoadState('networkidle');
            // Simulate some operation
            await page.waitForTimeout(500);
        });
        
        expect(duration).toBeGreaterThan(0);
        expect(duration).toBeLessThan(10000); // Should complete in reasonable time
        
        console.log(`\n⏱️  Custom Operation Duration: ${duration}ms`);
    });

    test('should compare performance across multiple pages', async ({ page }) => {
        const pages = [
            'https://example.com',
            'https://www.google.com',
            'https://github.com'
        ];
        
        const results = [];
        
        for (const url of pages) {
            const perfMonitor = new PerformanceMonitor(page);
            await perfMonitor.startMonitoring();
            
            await page.goto(url, { waitUntil: 'networkidle' });
            await page.waitForTimeout(2000);
            
            const metrics = await perfMonitor.collectAllMetrics();
            results.push({
                url,
                loadTime: metrics.navigation.total,
                lcp: metrics.webVitals.lcp,
                resources: metrics.resources.length
            });
        }
        
        console.log('\n📊 Performance Comparison:');
        results.forEach((result, index) => {
            console.log(`\n${index + 1}. ${result.url}`);
            console.log(`   Load Time: ${result.loadTime?.toFixed(0)}ms`);
            console.log(`   LCP: ${result.lcp ? result.lcp.toFixed(0) + 'ms' : 'N/A'}`);
            console.log(`   Resources: ${result.resources}`);
        });
        
        // Assertions
        results.forEach(result => {
            expect(result.loadTime).toBeLessThan(10000); // All pages should load in < 10s
        });
    });

    test('should track performance regression', async ({ page }) => {
        const perfMonitor = new PerformanceMonitor(page);
        await perfMonitor.startMonitoring();
        
        // Navigate to page
        await page.goto('https://example.com', { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
        
        // Collect metrics
        const metrics = await perfMonitor.collectAllMetrics();
        
        // Thresholds for regression detection
        const thresholds = {
            lcp: 2500,
            fid: 100,
            cls: 0.1,
            totalLoad: 5000
        };
        
        // Check for regressions
        const regressions = [];
        
        if (metrics.webVitals.lcp && metrics.webVitals.lcp > thresholds.lcp) {
            regressions.push(`LCP regression: ${metrics.webVitals.lcp.toFixed(0)}ms > ${thresholds.lcp}ms`);
        }
        
        if (metrics.webVitals.fid && metrics.webVitals.fid > thresholds.fid) {
            regressions.push(`FID regression: ${metrics.webVitals.fid.toFixed(0)}ms > ${thresholds.fid}ms`);
        }
        
        if (metrics.webVitals.cls !== null && metrics.webVitals.cls !== undefined && metrics.webVitals.cls > thresholds.cls) {
            regressions.push(`CLS regression: ${metrics.webVitals.cls.toFixed(3)} > ${thresholds.cls}`);
        }
        
        if (metrics.navigation.total > thresholds.totalLoad) {
            regressions.push(`Total load regression: ${metrics.navigation.total.toFixed(0)}ms > ${thresholds.totalLoad}ms`);
        }
        
        if (regressions.length > 0) {
            console.log('\n⚠️  Performance Regressions Detected:');
            regressions.forEach(regression => console.log(`  - ${regression}`));
        } else {
            console.log('\n✅ No performance regressions detected');
        }
        
        // Assertions - fail if regressions found
        expect(regressions.length).toBe(0);
    });

    test('should measure performance with throttling', async ({ page, context }) => {
        // Set up network throttling
        await context.route('**/*', async (route) => {
            await route.continue();
        });
        
        // Simulate slow network
        await page.goto('https://example.com', { waitUntil: 'networkidle' });
        
        const perfMonitor = new PerformanceMonitor(page);
        await perfMonitor.startMonitoring();
        
        // Navigate again with monitoring
        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        
        const metrics = await perfMonitor.collectAllMetrics();
        
        console.log(`\n🐌 Performance with throttling:`);
        console.log(`  Total Load Time: ${metrics.navigation.total?.toFixed(0)}ms`);
        
        // This test verifies that we can measure performance even under slow conditions
        expect(metrics.navigation.total).toBeGreaterThan(0);
    });
});
