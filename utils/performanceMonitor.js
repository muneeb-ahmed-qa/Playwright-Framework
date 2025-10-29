const fs = require('fs');
const path = require('path');

/**
 * Performance Monitoring Utility
 * Tracks and reports performance metrics including Core Web Vitals, network performance, and resource loading
 */
class PerformanceMonitor {
    constructor(page) {
        this.page = page;
        this.metrics = {
            navigation: {},
            webVitals: {},
            network: {},
            resources: [],
            memory: {},
            custom: {}
        };
        this.startTime = null;
        this.endTime = null;
    }

    /**
     * Start performance monitoring
     */
    async startMonitoring() {
        this.startTime = Date.now();
        
        // Track Core Web Vitals
        await this.trackWebVitals();
        
        // Track network performance
        await this.trackNetworkPerformance();
        
        // Track memory usage
        await this.trackMemoryUsage();
        
        console.log('Performance monitoring started');
    }

    /**
     * Track Core Web Vitals (LCP, FID, CLS)
     */
    async trackWebVitals() {
        await this.page.addInitScript(() => {
            // Largest Contentful Paint (LCP)
            if ('PerformanceObserver' in window) {
                try {
                    const lcpObserver = new PerformanceObserver((list) => {
                        const entries = list.getEntries();
                        const lastEntry = entries[entries.length - 1];
                        window.__lcp = lastEntry.renderTime || lastEntry.loadTime;
                    });
                    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

                    // First Input Delay (FID)
                    const fidObserver = new PerformanceObserver((list) => {
                        const entries = list.getEntries();
                        entries.forEach((entry) => {
                            window.__fid = entry.processingStart - entry.startTime;
                        });
                    });
                    fidObserver.observe({ entryTypes: ['first-input'] });

                    // Cumulative Layout Shift (CLS)
                    let clsValue = 0;
                    const clsObserver = new PerformanceObserver((list) => {
                        const entries = list.getEntries();
                        entries.forEach((entry) => {
                            if (!entry.hadRecentInput) {
                                clsValue += entry.value;
                            }
                        });
                        window.__cls = clsValue;
                    });
                    clsObserver.observe({ entryTypes: ['layout-shift'] });

                    // First Contentful Paint (FCP)
                    const fcpObserver = new PerformanceObserver((list) => {
                        const entries = list.getEntries();
                        entries.forEach((entry) => {
                            window.__fcp = entry.renderTime || entry.loadTime;
                        });
                    });
                    fcpObserver.observe({ entryTypes: ['paint'] });

                    // Time to Interactive (TTI)
                    const ttiObserver = new PerformanceObserver((list) => {
                        const entries = list.getEntries();
                        entries.forEach((entry) => {
                            if (entry.name === 'domInteractive') {
                                window.__tti = entry.startTime;
                            }
                        });
                    });
                    ttiObserver.observe({ entryTypes: ['measure'] });
                } catch (e) {
                    console.error('Error tracking Web Vitals:', e);
                }
            }
        });
    }

    /**
     * Get Core Web Vitals metrics
     */
    async getWebVitals() {
        try {
            await this.page.evaluate(() => {
                return {
                    lcp: window.__lcp || null,
                    fid: window.__fid || null,
                    cls: window.__cls || null,
                    fcp: window.__fcp || null,
                    tti: window.__tti || null
                };
            });

            // Wait for metrics to be available
            await this.page.waitForTimeout(2000);

            // Get final values
            const finalWebVitals = await this.page.evaluate(() => {
                return {
                    lcp: window.__lcp || null,
                    fid: window.__fid || null,
                    cls: window.__cls || null,
                    fcp: window.__fcp || null,
                    tti: window.__tti || null
                };
            });

            this.metrics.webVitals = finalWebVitals;
            return finalWebVitals;
        } catch (error) {
            console.error('Error getting Web Vitals:', error.message);
            return {};
        }
    }

    /**
     * Track network performance
     */
    async trackNetworkPerformance() {
        // Enable network tracking
        this.page.on('request', (request) => {
            request._startTime = Date.now();
        });

        this.page.on('response', (response) => {
            const request = response.request();
            if (request._startTime) {
                const duration = Date.now() - request._startTime;
                this.metrics.network[request.url()] = {
                    url: request.url(),
                    status: response.status(),
                    duration: duration,
                    method: request.method(),
                    resourceType: request.resourceType()
                };
            }
        });
    }

    /**
     * Get network performance metrics
     */
    async getNetworkMetrics() {
        const navigationTiming = await this.page.evaluate(() => {
            const perfData = window.performance.timing;
            
            return {
                dns: perfData.domainLookupEnd - perfData.domainLookupStart,
                tcp: perfData.connectEnd - perfData.connectStart,
                ssl: perfData.secureConnectionStart > 0 
                    ? perfData.connectEnd - perfData.secureConnectionStart 
                    : 0,
                ttfb: perfData.responseStart - perfData.requestStart,
                download: perfData.responseEnd - perfData.responseStart,
                domProcessing: perfData.domComplete - perfData.domLoading,
                domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                load: perfData.loadEventEnd - perfData.loadEventStart,
                total: perfData.loadEventEnd - perfData.navigationStart
            };
        });

        this.metrics.network.timing = navigationTiming;
        return navigationTiming;
    }

    /**
     * Get resource loading performance
     */
    async getResourceMetrics() {
        const resources = await this.page.evaluate(() => {
            const resourceEntries = performance.getEntriesByType('resource');
            return resourceEntries.map((entry) => ({
                name: entry.name,
                type: entry.initiatorType,
                duration: entry.duration,
                size: entry.transferSize || 0,
                decodedSize: entry.decodedBodySize || 0,
                encodedSize: entry.encodedBodySize || 0,
                startTime: entry.startTime,
                responseEnd: entry.responseEnd,
                responseStart: entry.responseStart,
                requestStart: entry.requestStart
            }));
        });

        this.metrics.resources = resources;
        return resources;
    }

    /**
     * Track memory usage
     */
    async trackMemoryUsage() {
        if (this.page.evaluate(() => 'memory' in performance)) {
            const memory = await this.page.evaluate(() => {
                if (performance.memory) {
                    return {
                        usedJSHeapSize: performance.memory.usedJSHeapSize,
                        totalJSHeapSize: performance.memory.totalJSHeapSize,
                        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
                    };
                }
                return null;
            });

            this.metrics.memory = memory;
            return memory;
        }
        return null;
    }

    /**
     * Get navigation timing
     */
    async getNavigationTiming() {
        const navigation = await this.page.evaluate(() => {
            const perfData = window.performance.timing;
            
            return {
                redirect: perfData.redirectEnd - perfData.redirectStart,
                dns: perfData.domainLookupEnd - perfData.domainLookupStart,
                tcp: perfData.connectEnd - perfData.connectStart,
                request: perfData.responseStart - perfData.requestStart,
                response: perfData.responseEnd - perfData.responseStart,
                dom: perfData.domComplete - perfData.domLoading,
                load: perfData.loadEventEnd - perfData.loadEventStart,
                total: perfData.loadEventEnd - perfData.navigationStart
            };
        });

        this.metrics.navigation = navigation;
        return navigation;
    }

    /**
     * Measure custom performance metric
     * @param {string} name - Metric name
     * @param {Function} fn - Function to measure
     */
    async measureCustom(name, fn) {
        const startTime = Date.now();
        try {
            await fn();
            const duration = Date.now() - startTime;
            this.metrics.custom[name] = duration;
            return duration;
        } catch (error) {
            console.error(`Error measuring custom metric ${name}:`, error.message);
            throw error;
        }
    }

    /**
     * Collect all performance metrics
     */
    async collectAllMetrics() {
        this.endTime = Date.now();
        
        const metrics = {
            webVitals: await this.getWebVitals(),
            network: await this.getNetworkMetrics(),
            resources: await this.getResourceMetrics(),
            navigation: await this.getNavigationTiming(),
            memory: await this.trackMemoryUsage(),
            custom: this.metrics.custom,
            totalDuration: this.endTime - this.startTime,
            timestamp: new Date().toISOString()
        };

        this.metrics = { ...this.metrics, ...metrics };
        return metrics;
    }

    /**
     * Analyze performance metrics and provide recommendations
     */
    analyzePerformance(metrics = null) {
        const m = metrics || this.metrics;
        const recommendations = [];
        const scores = {
            lcp: this.scoreLCP(m.webVitals?.lcp),
            fid: this.scoreFID(m.webVitals?.fid),
            cls: this.scoreCLS(m.webVitals?.cls),
            fcp: this.scoreFCP(m.webVitals?.fcp),
            tti: this.scoreTTI(m.webVitals?.tti),
            total: this.scoreTotalLoad(m.navigation?.total)
        };

        // LCP recommendations
        if (m.webVitals?.lcp && m.webVitals.lcp > 2500) {
            recommendations.push({
                metric: 'LCP',
                severity: 'high',
                message: `LCP is ${m.webVitals.lcp.toFixed(0)}ms (target: <2500ms). Optimize images, reduce server response time, or use CDN.`
            });
        }

        // FID recommendations
        if (m.webVitals?.fid && m.webVitals.fid > 100) {
            recommendations.push({
                metric: 'FID',
                severity: 'high',
                message: `FID is ${m.webVitals.fid.toFixed(0)}ms (target: <100ms). Reduce JavaScript execution time, optimize event handlers.`
            });
        }

        // CLS recommendations
        if (m.webVitals?.cls && m.webVitals.cls > 0.1) {
            recommendations.push({
                metric: 'CLS',
                severity: 'high',
                message: `CLS is ${m.webVitals.cls.toFixed(3)} (target: <0.1). Add size attributes to images, avoid inserting content above existing content.`
            });
        }

        // Resource loading recommendations
        const slowResources = m.resources?.filter(r => r.duration > 1000);
        if (slowResources && slowResources.length > 0) {
            recommendations.push({
                metric: 'Resources',
                severity: 'medium',
                message: `${slowResources.length} resources took longer than 1s to load. Consider lazy loading, code splitting, or CDN.`
            });
        }

        // Memory recommendations
        if (m.memory && m.memory.usedJSHeapSize > 50 * 1024 * 1024) {
            recommendations.push({
                metric: 'Memory',
                severity: 'medium',
                message: `High memory usage: ${(m.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB. Check for memory leaks or optimize JavaScript.`
            });
        }

        return {
            scores,
            recommendations,
            summary: this.generateSummary(m, scores)
        };
    }

    /**
     * Score LCP (Largest Contentful Paint)
     */
    scoreLCP(lcp) {
        if (!lcp) return null;
        if (lcp <= 2500) return 'good';
        if (lcp <= 4000) return 'needs-improvement';
        return 'poor';
    }

    /**
     * Score FID (First Input Delay)
     */
    scoreFID(fid) {
        if (!fid) return null;
        if (fid <= 100) return 'good';
        if (fid <= 300) return 'needs-improvement';
        return 'poor';
    }

    /**
     * Score CLS (Cumulative Layout Shift)
     */
    scoreCLS(cls) {
        if (cls === null || cls === undefined) return null;
        if (cls <= 0.1) return 'good';
        if (cls <= 0.25) return 'needs-improvement';
        return 'poor';
    }

    /**
     * Score FCP (First Contentful Paint)
     */
    scoreFCP(fcp) {
        if (!fcp) return null;
        if (fcp <= 1800) return 'good';
        if (fcp <= 3000) return 'needs-improvement';
        return 'poor';
    }

    /**
     * Score TTI (Time to Interactive)
     */
    scoreTTI(tti) {
        if (!tti) return null;
        if (tti <= 3800) return 'good';
        if (tti <= 7300) return 'needs-improvement';
        return 'poor';
    }

    /**
     * Score total load time
     */
    scoreTotalLoad(total) {
        if (!total) return null;
        if (total <= 3000) return 'good';
        if (total <= 5000) return 'needs-improvement';
        return 'poor';
    }

    /**
     * Generate performance summary
     */
    generateSummary(metrics, scores) {
        const webVitals = metrics.webVitals || {};
        const navigation = metrics.navigation || {};
        
        return {
            pageLoadTime: navigation.total ? `${navigation.total.toFixed(0)}ms` : 'N/A',
            lcp: webVitals.lcp ? `${webVitals.lcp.toFixed(0)}ms (${scores.lcp})` : 'N/A',
            fid: webVitals.fid ? `${webVitals.fid.toFixed(0)}ms (${scores.fid})` : 'N/A',
            cls: webVitals.cls !== null && webVitals.cls !== undefined 
                ? `${webVitals.cls.toFixed(3)} (${scores.cls})` : 'N/A',
            fcp: webVitals.fcp ? `${webVitals.fcp.toFixed(0)}ms (${scores.fcp})` : 'N/A',
            tti: webVitals.tti ? `${webVitals.tti.toFixed(0)}ms (${scores.tti})` : 'N/A',
            resourcesLoaded: metrics.resources?.length || 0,
            totalResourcesSize: metrics.resources?.reduce((sum, r) => sum + (r.size || 0), 0) || 0
        };
    }

    /**
     * Generate performance report
     * @param {string} outputPath - Path to save report
     */
    async generateReport(outputPath = null) {
        const metrics = await this.collectAllMetrics();
        const analysis = this.analyzePerformance(metrics);
        
        const report = {
            timestamp: new Date().toISOString(),
            url: this.page.url(),
            metrics,
            analysis,
            recommendations: analysis.recommendations
        };

        if (outputPath) {
            const reportDir = path.dirname(outputPath);
            if (!fs.existsSync(reportDir)) {
                fs.mkdirSync(reportDir, { recursive: true });
            }
            fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
            console.log(`Performance report saved to: ${outputPath}`);
        }

        return report;
    }

    /**
     * Print performance summary to console
     */
    async printSummary() {
        const metrics = await this.collectAllMetrics();
        const analysis = this.analyzePerformance(metrics);
        
        console.log('\n📊 Performance Summary');
        console.log('====================');
        console.log(`Page URL: ${this.page.url()}`);
        console.log(`Total Load Time: ${metrics.totalDuration}ms`);
        console.log(`\n🎯 Core Web Vitals:`);
        console.log(`  LCP: ${metrics.webVitals.lcp ? metrics.webVitals.lcp.toFixed(0) + 'ms (' + analysis.scores.lcp + ')' : 'N/A'}`);
        console.log(`  FID: ${metrics.webVitals.fid ? metrics.webVitals.fid.toFixed(0) + 'ms (' + analysis.scores.fid + ')' : 'N/A'}`);
        console.log(`  CLS: ${metrics.webVitals.cls !== null && metrics.webVitals.cls !== undefined ? metrics.webVitals.cls.toFixed(3) + ' (' + analysis.scores.cls + ')' : 'N/A'}`);
        console.log(`  FCP: ${metrics.webVitals.fcp ? metrics.webVitals.fcp.toFixed(0) + 'ms (' + analysis.scores.fcp + ')' : 'N/A'}`);
        console.log(`  TTI: ${metrics.webVitals.tti ? metrics.webVitals.tti.toFixed(0) + 'ms (' + analysis.scores.tti + ')' : 'N/A'}`);
        
        if (metrics.resources && metrics.resources.length > 0) {
            console.log(`\n📦 Resources:`);
            console.log(`  Total Resources: ${metrics.resources.length}`);
            const totalSize = metrics.resources.reduce((sum, r) => sum + (r.size || 0), 0);
            console.log(`  Total Size: ${(totalSize / 1024).toFixed(2)}KB`);
        }

        if (analysis.recommendations.length > 0) {
            console.log(`\n💡 Recommendations:`);
            analysis.recommendations.forEach((rec, index) => {
                console.log(`  ${index + 1}. [${rec.severity.toUpperCase()}] ${rec.message}`);
            });
        }
        console.log('');
    }
}

module.exports = { PerformanceMonitor };
