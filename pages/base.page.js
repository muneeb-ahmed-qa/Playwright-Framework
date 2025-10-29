const { expect } = require('@playwright/test');
const { PerformanceMonitor } = require('../utils/performanceMonitor');

/**
 * Base Page Object Class
 * Provides common functionality that can be extended by specific page classes
 */
class BasePage {
    constructor(page) {
        this.page = page;
        this.timeout = 30000;
    }

    /**
     * Navigate to a specific URL
     * @param {string} url - The URL to navigate to
     */
    async navigateTo(url) {
        await this.page.goto(url, { waitUntil: 'networkidle' });
    }

    /**
     * Wait for element to be visible
     * @param {Locator} locator - Playwright locator
     * @param {number} timeout - Timeout in milliseconds
     */
    async waitForElement(locator, timeout = this.timeout) {
        await locator.waitFor({ state: 'visible', timeout });
    }

    /**
     * Wait for element to be hidden
     * @param {Locator} locator - Playwright locator
     * @param {number} timeout - Timeout in milliseconds
     */
    async waitForElementToHide(locator, timeout = this.timeout) {
        await locator.waitFor({ state: 'hidden', timeout });
    }

    /**
     * Click on an element
     * @param {Locator} locator - Playwright locator
     * @param {Object} options - Click options
     */
    async click(locator, options = {}) {
        await this.waitForElement(locator);
        await locator.click(options);
    }

    /**
     * Fill input field
     * @param {Locator} locator - Playwright locator
     * @param {string} text - Text to fill
     * @param {Object} options - Fill options
     */
    async fill(locator, text, options = {}) {
        await this.waitForElement(locator);
        await locator.fill(text, options);
    }

    /**
     * Type text into an element
     * @param {Locator} locator - Playwright locator
     * @param {string} text - Text to type
     * @param {Object} options - Type options
     */
    async type(locator, text, options = {}) {
        await this.waitForElement(locator);
        await locator.type(text, options);
    }

    /**
     * Select option from dropdown
     * @param {Locator} locator - Playwright locator
     * @param {string|Array} values - Value(s) to select
     */
    async selectOption(locator, values) {
        await this.waitForElement(locator);
        await locator.selectOption(values);
    }

    /**
     * Get text content of an element
     * @param {Locator} locator - Playwright locator
     * @returns {Promise<string>} Text content
     */
    async getText(locator) {
        await this.waitForElement(locator);
        return await locator.textContent();
    }

    /**
     * Get input value
     * @param {Locator} locator - Playwright locator
     * @returns {Promise<string>} Input value
     */
    async getValue(locator) {
        await this.waitForElement(locator);
        return await locator.inputValue();
    }

    /**
     * Check if element is visible
     * @param {Locator} locator - Playwright locator
     * @returns {Promise<boolean>} True if visible
     */
    async isVisible(locator) {
        return await locator.isVisible();
    }

    /**
     * Check if element is enabled
     * @param {Locator} locator - Playwright locator
     * @returns {Promise<boolean>} True if enabled
     */
    async isEnabled(locator) {
        return await locator.isEnabled();
    }

    /**
     * Wait for page to load completely
     */
    async waitForPageLoad() {
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Take screenshot
     * @param {string} name - Screenshot name
     * @param {Object} options - Screenshot options
     */
    async takeScreenshot(name, options = {}) {
        await this.page.screenshot({ 
            path: `screenshots/${name}.png`, 
            fullPage: true,
            ...options 
        });
    }

    /**
     * Scroll element into view
     * @param {Locator} locator - Playwright locator
     */
    async scrollIntoView(locator) {
        await locator.scrollIntoViewIfNeeded();
    }

    /**
     * Wait for specific time
     * @param {number} ms - Milliseconds to wait
     */
    async wait(ms) {
        await this.page.waitForTimeout(ms);
    }

    /**
     * Reload the page
     */
    async reload() {
        await this.page.reload({ waitUntil: 'networkidle' });
    }

    /**
     * Go back in browser history
     */
    async goBack() {
        await this.page.goBack({ waitUntil: 'networkidle' });
    }

    /**
     * Go forward in browser history
     */
    async goForward() {
        await this.page.goForward({ waitUntil: 'networkidle' });
    }

    /**
     * Assert element is visible
     * @param {Locator} locator - Playwright locator
     * @param {Object} options - Expect options
     */
    async expectVisible(locator, options = {}) {
        await expect(locator).toBeVisible(options);
    }

    /**
     * Assert element is hidden
     * @param {Locator} locator - Playwright locator
     * @param {Object} options - Expect options
     */
    async expectHidden(locator, options = {}) {
        await expect(locator).toBeHidden(options);
    }

    /**
     * Assert element contains text
     * @param {Locator} locator - Playwright locator
     * @param {string|RegExp} text - Expected text
     * @param {Object} options - Expect options
     */
    async expectText(locator, text, options = {}) {
        await expect(locator).toContainText(text, options);
    }

    /**
     * Assert element has specific value
     * @param {Locator} locator - Playwright locator
     * @param {string} value - Expected value
     * @param {Object} options - Expect options
     */
    async expectValue(locator, value, options = {}) {
        await expect(locator).toHaveValue(value, options);
    }

    /**
     * Assert element is enabled
     * @param {Locator} locator - Playwright locator
     * @param {Object} options - Expect options
     */
    async expectEnabled(locator, options = {}) {
        await expect(locator).toBeEnabled(options);
    }

    /**
     * Assert element is disabled
     * @param {Locator} locator - Playwright locator
     * @param {Object} options - Expect options
     */
    async expectDisabled(locator, options = {}) {
        await expect(locator).toBeDisabled(options);
    }

    /**
     * Assert element is checked
     * @param {Locator} locator - Playwright locator
     * @param {Object} options - Expect options
     */
    async expectChecked(locator, options = {}) {
        await expect(locator).toBeChecked(options);
    }

    /**
     * Assert element is unchecked
     * @param {Locator} locator - Playwright locator
     * @param {Object} options - Expect options
     */
    async expectUnchecked(locator, options = {}) {
        await expect(locator).not.toBeChecked(options);
    }

    /**
     * Assert URL contains specific text
     * @param {string|RegExp} url - Expected URL pattern
     * @param {Object} options - Expect options
     */
    async expectUrl(url, options = {}) {
        await expect(this.page).toHaveURL(url, options);
    }

    /**
     * Assert page title contains specific text
     * @param {string|RegExp} title - Expected title pattern
     * @param {Object} options - Expect options
     */
    async expectTitle(title, options = {}) {
        await expect(this.page).toHaveTitle(title, options);
    }

    /**
     * Wait for network request to complete
     * @param {string} url - URL pattern to wait for
     * @param {Function} handler - Response handler
     */
    async waitForResponse(url, handler) {
        const response = await this.page.waitForResponse(url);
        if (handler) {
            await handler(response);
        }
        return response;
    }

    /**
     * Wait for network request to be sent
     * @param {string} url - URL pattern to wait for
     * @param {Function} handler - Request handler
     */
    async waitForRequest(url, handler) {
        const request = await this.page.waitForRequest(url);
        if (handler) {
            await handler(request);
        }
        return request;
    }

    /**
     * Get all cookies
     * @returns {Promise<Array>} Array of cookies
     */
    async getCookies() {
        return await this.page.context().cookies();
    }

    /**
     * Set cookie
     * @param {Object} cookie - Cookie object
     */
    async setCookie(cookie) {
        await this.page.context().addCookies([cookie]);
    }

    /**
     * Clear all cookies
     */
    async clearCookies() {
        await this.page.context().clearCookies();
    }

    /**
     * Get local storage item
     * @param {string} key - Storage key
     * @returns {Promise<string>} Storage value
     */
    async getLocalStorage(key) {
        return await this.page.evaluate((k) => localStorage.getItem(k), key);
    }

    /**
     * Set local storage item
     * @param {string} key - Storage key
     * @param {string} value - Storage value
     */
    async setLocalStorage(key, value) {
        await this.page.evaluate(({ k, v }) => localStorage.setItem(k, v), { k: key, v: value });
    }

    /**
     * Clear local storage
     */
    async clearLocalStorage() {
        await this.page.evaluate(() => localStorage.clear());
    }

    /**
     * Get session storage item
     * @param {string} key - Storage key
     * @returns {Promise<string>} Storage value
     */
    async getSessionStorage(key) {
        return await this.page.evaluate((k) => sessionStorage.getItem(k), key);
    }

    /**
     * Set session storage item
     * @param {string} key - Storage key
     * @param {string} value - Storage value
     */
    async setSessionStorage(key, value) {
        await this.page.evaluate(({ k, v }) => sessionStorage.setItem(k, v), { k: key, v: value });
    }

    /**
     * Clear session storage
     */
    async clearSessionStorage() {
        await this.page.evaluate(() => sessionStorage.clear());
    }

    /**
     * Execute JavaScript in page context
     * @param {Function|string} script - JavaScript to execute
     * @param {...any} args - Arguments to pass to script
     * @returns {Promise<any>} Script result
     */
    async evaluate(script, ...args) {
        return await this.page.evaluate(script, ...args);
    }

    /**
     * Execute JavaScript in page context with element
     * @param {Locator} locator - Playwright locator
     * @param {Function} script - JavaScript to execute
     * @param {...any} args - Arguments to pass to script
     * @returns {Promise<any>} Script result
     */
    async evaluateOnElement(locator, script, ...args) {
        return await locator.evaluate(script, ...args);
    }

    /**
     * Wait for new tab/page to open
     * @param {Object} options - Options for waiting
     * @returns {Promise<Page>} New page/tab
     */
    async waitForNewTab(options = {}) {
        const {
            timeout = 30000,
            waitForLoad = true
        } = options;

        const context = this.page.context();
        const newPage = await context.waitForEvent('page', { timeout });
        
        if (waitForLoad) {
            await newPage.waitForLoadState('networkidle');
        }

        return newPage;
    }

    /**
     * Switch to a specific tab/page
     * @param {number} index - Tab index (0-based)
     * @returns {Promise<Page>} The page at the specified index
     */
    async switchToTab(index) {
        const pages = this.page.context().pages();
        if (index >= 0 && index < pages.length) {
            this.page = pages[index];
            await this.page.bringToFront();
            return this.page;
        }
        throw new Error(`Tab index ${index} is out of range. Available tabs: ${pages.length}`);
    }

    /**
     * Get all open tabs/pages
     * @returns {Promise<Page[]>} Array of all pages
     */
    async getAllTabs() {
        return this.page.context().pages();
    }

    /**
     * Get current tab count
     * @returns {Promise<number>} Number of open tabs
     */
    async getTabCount() {
        return this.page.context().pages().length;
    }

    /**
     * Close a specific tab
     * @param {number} index - Tab index to close (0-based)
     */
    async closeTab(index) {
        const pages = this.page.context().pages();
        if (index >= 0 && index < pages.length) {
            const tabToClose = pages[index];
            await tabToClose.close();
            
            // If closed tab was the current page, switch to first tab
            if (tabToClose === this.page && pages.length > 1) {
                this.page = pages[0];
                await this.page.bringToFront();
            }
        } else {
            throw new Error(`Tab index ${index} is out of range. Available tabs: ${pages.length}`);
        }
    }

    /**
     * Switch to tab by URL pattern
     * @param {string|RegExp} urlPattern - URL pattern to match
     * @param {Object} options - Options
     * @returns {Promise<Page>} Matching page
     */
    async switchToTabByUrl(urlPattern, options = {}) {
        const {
            timeout = 10000
        } = options;

        const startTime = Date.now();
        while (Date.now() - startTime < timeout) {
            const pages = this.page.context().pages();
            
            for (let i = 0; i < pages.length; i++) {
                const page = pages[i];
                const url = page.url();
                
                if (typeof urlPattern === 'string' && url.includes(urlPattern)) {
                    this.page = page;
                    await this.page.bringToFront();
                    return this.page;
                } else if (urlPattern instanceof RegExp && urlPattern.test(url)) {
                    this.page = page;
                    await this.page.bringToFront();
                    return this.page;
                }
            }
            
            await this.waitForTimeout(500);
        }

        throw new Error(`Tab with URL pattern "${urlPattern}" not found`);
    }

    /**
     * Switch to tab by title
     * @param {string|RegExp} titlePattern - Title pattern to match
     * @param {Object} options - Options
     * @returns {Promise<Page>} Matching page
     */
    async switchToTabByTitle(titlePattern, options = {}) {
        const {
            timeout = 10000
        } = options;

        const startTime = Date.now();
        while (Date.now() - startTime < timeout) {
            const pages = this.page.context().pages();
            
            for (let i = 0; i < pages.length; i++) {
                const page = pages[i];
                const title = await page.title();
                
                if (typeof titlePattern === 'string' && title.includes(titlePattern)) {
                    this.page = page;
                    await this.page.bringToFront();
                    return this.page;
                } else if (titlePattern instanceof RegExp && titlePattern.test(title)) {
                    this.page = page;
                    await this.page.bringToFront();
                    return this.page;
                }
            }
            
            await this.waitForTimeout(500);
        }

        throw new Error(`Tab with title pattern "${titlePattern}" not found`);
    }

    /**
     * Close all tabs except current
     */
    async closeOtherTabs() {
        const pages = this.page.context().pages();
        const currentPage = this.page;
        
        for (const page of pages) {
            if (page !== currentPage) {
                await page.close();
            }
        }
        
        await currentPage.bringToFront();
    }

    /**
     * Click link and wait for new tab
     * @param {Locator} linkLocator - Link locator
     * @param {Object} options - Options
     * @returns {Promise<Page>} New page/tab
     */
    async clickLinkAndWaitForNewTab(linkLocator, options = {}) {
        const {
            timeout = 30000,
            waitForLoad = true
        } = options;

        const [newPage] = await Promise.all([
            this.waitForNewTab({ timeout, waitForLoad }),
            this.click(linkLocator)
        ]);

        return newPage;
    }

    /**
     * Verify text on current page
     * @param {string|RegExp} expectedText - Text to verify
     * @param {Object} options - Options
     * @returns {Promise<boolean>} True if text is found
     */
    async verifyTextOnPage(expectedText, options = {}) {
        const {
            locator = null,
            timeout = 5000,
            caseSensitive = false
        } = options;

        try {
            if (locator) {
                const elementText = await locator.textContent({ timeout });
                if (typeof expectedText === 'string') {
                    return caseSensitive 
                        ? elementText.includes(expectedText)
                        : elementText.toLowerCase().includes(expectedText.toLowerCase());
                } else if (expectedText instanceof RegExp) {
                    return expectedText.test(elementText);
                }
            } else {
                const pageText = await this.page.textContent('body', { timeout });
                const pageContent = await this.page.content();
                
                if (typeof expectedText === 'string') {
                    const found = pageText.includes(expectedText) || pageContent.includes(expectedText);
                    if (!found) {
                        console.error(`Expected text "${expectedText}" not found on page`);
                        console.log(`Page URL: ${this.page.url()}`);
                    }
                    return found;
                } else if (expectedText instanceof RegExp) {
                    return expectedText.test(pageText) || expectedText.test(pageContent);
                }
            }
        } catch (error) {
            console.error('Error verifying text on page:', error.message);
            return false;
        }

        return false;
    }

    /**
     * Start performance monitoring
     * @returns {PerformanceMonitor} Performance monitor instance
     */
    startPerformanceMonitoring() {
        if (!this.performanceMonitor) {
            this.performanceMonitor = new PerformanceMonitor(this.page);
        }
        this.performanceMonitor.startMonitoring();
        return this.performanceMonitor;
    }

    /**
     * Get performance monitor instance
     * @returns {PerformanceMonitor} Performance monitor instance
     */
    getPerformanceMonitor() {
        if (!this.performanceMonitor) {
            this.performanceMonitor = new PerformanceMonitor(this.page);
        }
        return this.performanceMonitor;
    }

    /**
     * Navigate and measure performance
     * @param {string} url - URL to navigate to
     * @param {Object} options - Navigation options
     * @returns {Promise<Object>} Performance metrics
     */
    async navigateAndMeasurePerformance(url, _options = {}) {
        const perfMonitor = this.startPerformanceMonitoring();
        await this.navigateTo(url);
        await this.page.waitForTimeout(2000); // Wait for metrics
        const metrics = await perfMonitor.collectAllMetrics();
        return metrics;
    }

    /**
     * Assert performance metrics meet thresholds
     * @param {Object} thresholds - Performance thresholds
     * @param {Object} metrics - Performance metrics (optional, will collect if not provided)
     */
    async assertPerformance(thresholds, metrics = null) {
        const perfMonitor = this.getPerformanceMonitor();
        const m = metrics || await perfMonitor.collectAllMetrics();
        
        if (thresholds.lcp && m.webVitals?.lcp) {
            expect(m.webVitals.lcp).toBeLessThan(thresholds.lcp);
        }
        
        if (thresholds.fid && m.webVitals?.fid) {
            expect(m.webVitals.fid).toBeLessThan(thresholds.fid);
        }
        
        if (thresholds.cls !== undefined && m.webVitals?.cls !== null) {
            expect(m.webVitals.cls).toBeLessThan(thresholds.cls);
        }
        
        if (thresholds.totalLoad && m.navigation?.total) {
            expect(m.navigation.total).toBeLessThan(thresholds.totalLoad);
        }
        
        if (thresholds.ttfb && m.network?.timing?.ttfb) {
            expect(m.network.timing.ttfb).toBeLessThan(thresholds.ttfb);
        }
    }
}

module.exports = { BasePage };
