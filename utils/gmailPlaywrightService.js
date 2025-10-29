const { GmailApiService } = require('./gmailApiService');
const { EnvConfig } = require('./envConfig');

/**
 * Gmail Playwright Service
 * Combines Gmail API for email operations with Playwright for link clicking and verification
 */
class GmailPlaywrightService {
    constructor(page) {
        this.page = page;
        this.gmailApi = new GmailApiService();
        this.envConfig = new EnvConfig();
    }

    /**
     * Initialize the service
     */
    async initialize() {
        await this.gmailApi.initialize();
    }

    /**
     * Find email by subject using Gmail API
     * @param {string} subject - Email subject to search for
     * @param {Object} options - Search options
     * @returns {Promise<Object>} Email object
     */
    async findEmailBySubject(subject, options = {}) {
        return await this.gmailApi.findEmailBySubject(subject, options);
    }

    /**
     * Find email by sender using Gmail API
     * @param {string} sender - Email sender address or name
     * @param {Object} options - Search options
     * @returns {Promise<Object>} Email object
     */
    async findEmailBySender(sender, options = {}) {
        return await this.gmailApi.findEmailBySender(sender, options);
    }

    /**
     * Wait for email to arrive using Gmail API
     * @param {string} subject - Email subject to wait for
     * @param {Object} options - Options
     * @returns {Promise<Object>} Email object
     */
    async waitForEmail(subject, options = {}) {
        return await this.gmailApi.waitForEmail(subject, options);
    }

    /**
     * Click link from email and verify text on new tab
     * @param {Object} email - Email object from Gmail API
     * @param {string} linkText - Link text or URL pattern to find
     * @param {string|RegExp} expectedText - Text to verify on new page
     * @param {Object} options - Options
     * @returns {Promise<boolean>} True if text is found
     */
    async clickEmailLinkAndVerify(email, linkText, expectedText, options = {}) {
        const {
            waitForNewTab = true,
            timeout = 30000,
            partialMatch = true
        } = options;

        try {
            // Find the link in the email body
            const links = email.links || [];
            let targetLink = null;

            if (linkText.startsWith('http')) {
                // Find by URL
                targetLink = links.find(link => link.url.includes(linkText));
            } else {
                // Find by text
                targetLink = links.find(link => 
                    partialMatch 
                        ? link.text.toLowerCase().includes(linkText.toLowerCase())
                        : link.text === linkText
                );
            }

            if (!targetLink) {
                throw new Error(`Link "${linkText}" not found in email`);
            }

            console.log(`Found link: ${targetLink.text} -> ${targetLink.url}`);

            // Click link and wait for new tab
            const newPage = await this.clickLinkAndWaitForNewTab(targetLink.url, {
                waitForNewTab,
                timeout
            });

            // Switch to new tab
            await this.switchToTabByUrl(newPage.url());

            // Verify text on new page
            const textFound = await this.verifyTextOnPage(expectedText);
            
            if (!textFound) {
                console.error(`Expected text "${expectedText}" not found on page`);
                console.log(`Page URL: ${this.page.url()}`);
            }

            return textFound;
        } catch (error) {
            console.error('Error clicking email link and verifying:', error.message);
            throw error;
        }
    }

    /**
     * Open email and click link in one method
     * @param {string} subject - Email subject
     * @param {string} linkText - Link text or URL to click
     * @param {string|RegExp} expectedText - Text to verify on new page
     * @param {Object} options - Options
     * @returns {Promise<boolean>} True if text is found
     */
    async openEmailAndClickLink(subject, linkText, expectedText, options = {}) {
        // Find email using Gmail API
        const email = await this.findEmailBySubject(subject, options);
        
        // Click link and verify
        return await this.clickEmailLinkAndVerify(email, linkText, expectedText, options);
    }

    /**
     * Click link and wait for new tab
     * @param {string} url - URL to navigate to
     * @param {Object} options - Options
     * @returns {Promise<Page>} New page/tab
     */
    async clickLinkAndWaitForNewTab(url, options = {}) {
        const {
            waitForNewTab = true,
            timeout = 30000
        } = options;

        if (waitForNewTab) {
            const [newPage] = await Promise.all([
                this.page.context().waitForEvent('page', { timeout }),
                this.page.goto(url)
            ]);
            await newPage.waitForLoadState('networkidle');
            return newPage;
        } else {
            await this.page.goto(url);
            await this.page.waitForLoadState('networkidle');
            return this.page;
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
            
            await this.sleep(500);
        }

        throw new Error(`Tab with URL pattern "${urlPattern}" not found`);
    }

    /**
     * Switch to tab by index
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
     * Mark email as read using Gmail API
     * @param {string} messageId - Gmail message ID
     */
    async markEmailAsRead(messageId) {
        await this.gmailApi.markAsRead(messageId);
    }

    /**
     * Delete email using Gmail API
     * @param {string} messageId - Gmail message ID
     */
    async deleteEmail(messageId) {
        await this.gmailApi.deleteEmail(messageId);
    }

    /**
     * Archive email using Gmail API
     * @param {string} messageId - Gmail message ID
     */
    async archiveEmail(messageId) {
        await this.gmailApi.archiveEmail(messageId);
    }

    /**
     * Get unread email count using Gmail API
     * @returns {Promise<number>} Number of unread emails
     */
    async getUnreadEmailCount() {
        return await this.gmailApi.getUnreadEmailCount();
    }

    /**
     * Sleep utility
     * @param {number} ms - Milliseconds to sleep
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = { GmailPlaywrightService };
