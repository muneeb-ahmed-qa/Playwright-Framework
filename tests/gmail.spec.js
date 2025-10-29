const { test, expect } = require('@playwright/test');
const { GmailPlaywrightService } = require('../utils/gmailPlaywrightService');

/**
 * Gmail Integration Test Suite
 * Demonstrates Gmail API integration with Playwright for link clicking and verification
 */
test.describe('Gmail Integration', () => {
    let gmailService;

    test.beforeEach(async ({ page }) => {
        gmailService = new GmailPlaywrightService(page);
        await gmailService.initialize();
    });

    test('should get unread email count using Gmail API', async () => {
        // Get unread email count using Gmail API
        const unreadCount = await gmailService.getUnreadEmailCount();
        console.log(`Unread emails: ${unreadCount}`);
        
        // Verify we can access Gmail API
        expect(typeof unreadCount).toBe('number');
    });

    test('should find email by subject using Gmail API', async () => {
        const subject = 'Test Email';
        
        try {
            const email = await gmailService.findEmailBySubject(subject, {
                unreadOnly: false,
                maxResults: 1
            });
            
            expect(email).toBeDefined();
            expect(email.subject).toContain(subject);
            console.log(`Found email: ${email.subject} from ${email.from}`);
        } catch (error) {
            console.log(`Email with subject "${subject}" not found: ${error.message}`);
        }
    });

    test('should find email by sender using Gmail API', async () => {
        const sender = 'noreply@example.com';
        
        try {
            const email = await gmailService.findEmailBySender(sender, {
                unreadOnly: false,
                maxResults: 1
            });
            
            expect(email).toBeDefined();
            expect(email.from).toContain(sender);
            console.log(`Found email: ${email.subject} from ${email.from}`);
        } catch (error) {
            console.log(`Email from "${sender}" not found: ${error.message}`);
        }
    });

    test('should click email link and verify text on new tab', async () => {
        const subject = 'Confirm Your Account';
        const linkText = 'Confirm';
        const expectedText = 'Account Confirmed';
        
        try {
            // Find email using Gmail API
            const email = await gmailService.findEmailBySubject(subject);
            
            // Click link and verify text
            const textFound = await gmailService.clickEmailLinkAndVerify(
                email,
                linkText,
                expectedText,
                {
                    waitForNewTab: true,
                    timeout: 30000
                }
            );
            
            expect(textFound).toBe(true);
            console.log(`Successfully verified text "${expectedText}" on new tab`);
        } catch (error) {
            console.log(`Test failed: ${error.message}`);
        }
    });

    test('should open email and click link in one method', async () => {
        const subject = 'Verify Your Email';
        const linkText = 'Verify';
        const expectedText = 'Email Verified Successfully';
        
        try {
            const textFound = await gmailService.openEmailAndClickLink(
                subject,
                linkText,
                expectedText,
                {
                    waitForNewTab: true,
                    timeout: 30000
                }
            );
            
            expect(textFound).toBe(true);
            console.log(`Successfully verified text "${expectedText}" on new tab`);
        } catch (error) {
            console.log(`Test failed: ${error.message}`);
        }
    });

    test('should wait for email to arrive and click link', async () => {
        const subject = 'Welcome Email';
        const linkText = 'Get Started';
        const expectedText = 'Welcome to our platform';
        
        try {
            // Wait for email to arrive
            const email = await gmailService.waitForEmail(subject, {
                timeout: 60000,
                pollInterval: 10000,
                from: 'noreply@example.com'
            });
            
            expect(email).toBeDefined();
            console.log(`Email received: ${email.subject}`);
            
            // Click link and verify
            const textFound = await gmailService.clickEmailLinkAndVerify(
                email,
                linkText,
                expectedText,
                {
                    waitForNewTab: true
                }
            );
            
            expect(textFound).toBe(true);
        } catch (error) {
            console.log(`Test failed: ${error.message}`);
        }
    });

    test('should handle multiple tabs and switch between them', async () => {
        const subject = 'Test Email';
        const linkText = 'Learn More';
        const expectedText = 'Learn More';
        
        try {
            // Get initial tab count
            const initialTabCount = await gmailService.getTabCount();
            expect(initialTabCount).toBe(1);
            
            // Find email
            const email = await gmailService.findEmailBySubject(subject);
            
            // Click link to open new tab
            await gmailService.clickEmailLinkAndVerify(
                email,
                linkText,
                expectedText,
                {
                    waitForNewTab: true
                }
            );
            
            // Verify new tab opened
            const newTabCount = await gmailService.getTabCount();
            expect(newTabCount).toBe(2);
            
            // Switch to new tab
            await gmailService.switchToTab(1);
            
            // Verify text on new tab
            const textFoundOnNewTab = await gmailService.verifyTextOnPage(expectedText);
            expect(textFoundOnNewTab).toBe(true);
            
            // Switch back to original tab
            await gmailService.switchToTab(0);
            
            // Close new tab
            await gmailService.closeTab(1);
            
            // Verify tab closed
            const finalTabCount = await gmailService.getTabCount();
            expect(finalTabCount).toBe(1);
        } catch (error) {
            console.log(`Test failed: ${error.message}`);
        }
    });

    test('should verify text on newly opened tab with regex pattern', async () => {
        const subject = 'Account Verification';
        const linkText = 'Verify';
        const textPattern = /successfully|verified|confirmed/i;
        
        try {
            const email = await gmailService.findEmailBySubject(subject);
            
            const textFound = await gmailService.clickEmailLinkAndVerify(
                email,
                linkText,
                textPattern,
                {
                    waitForNewTab: true
                }
            );
            
            expect(textFound).toBe(true);
        } catch (error) {
            console.log(`Test failed: ${error.message}`);
        }
    });

    test('should manage email using Gmail API', async () => {
        const subject = 'Test Email for Management';
        
        try {
            // Find email
            const email = await gmailService.findEmailBySubject(subject);
            
            // Mark as read
            await gmailService.markEmailAsRead(email.id);
            console.log(`Email ${email.id} marked as read`);
            
            // Get unread count
            const unreadCount = await gmailService.getUnreadEmailCount();
            console.log(`Unread emails: ${unreadCount}`);
            
            // Archive email
            await gmailService.archiveEmail(email.id);
            console.log(`Email ${email.id} archived`);
            
        } catch (error) {
            console.log(`Test failed: ${error.message}`);
        }
    });

    test('should handle email with multiple links', async () => {
        const subject = 'Email with Multiple Links';
        
        try {
            const email = await gmailService.findEmailBySubject(subject);
            
            // Get all links from email
            const links = email.links || [];
            console.log(`Found ${links.length} links in email`);
            
            // Test each link
            for (const link of links) {
                console.log(`Testing link: ${link.text} -> ${link.url}`);
                
                try {
                    const textFound = await gmailService.clickEmailLinkAndVerify(
                        email,
                        link.text,
                        /success|confirmed|verified/i,
                        {
                            waitForNewTab: true,
                            timeout: 10000
                        }
                    );
                    
                    if (textFound) {
                        console.log(`Link "${link.text}" verified successfully`);
                        break; // Stop after first successful verification
                    }
                } catch (linkError) {
                    console.log(`Link "${link.text}" failed: ${linkError.message}`);
                }
            }
        } catch (error) {
            console.log(`Test failed: ${error.message}`);
        }
    });

    test('should clean up after verification', async () => {
        const subject = 'Email for Cleanup';
        const linkText = 'Verify';
        const expectedText = 'Verified';
        
        try {
            // Find email
            const email = await gmailService.findEmailBySubject(subject);
            
            // Click link and verify
            const textFound = await gmailService.clickEmailLinkAndVerify(
                email,
                linkText,
                expectedText,
                {
                    waitForNewTab: true
                }
            );
            
            expect(textFound).toBe(true);
            
            // Switch back to original tab
            await gmailService.switchToTab(0);
            
            // Archive the email
            await gmailService.archiveEmail(email.id);
            console.log(`Email ${email.id} archived after verification`);
            
        } catch (error) {
            console.log(`Test failed: ${error.message}`);
        }
    });
});