// @ts-ignore - Module is installed and works at runtime
const { google } = require('googleapis');
const { EnvConfig } = require('./envConfig');

/**
 * Gmail API Service
 * Handles Gmail operations using Google APIs on the backend
 */
class GmailApiService {
    constructor() {
        this.envConfig = new EnvConfig();
        this.gmail = null;
        this.auth = null;
    }

    /**
     * Initialize Gmail API with OAuth2 authentication
     */
    async initialize() {
        try {
            // Get credentials from environment
            const credentials = this.getCredentials();
            
            // Create OAuth2 client
            this.auth = new google.auth.OAuth2(
                credentials.clientId,
                credentials.clientSecret,
                credentials.redirectUri
            );

            // Set credentials
            this.auth.setCredentials({
                access_token: credentials.accessToken,
                refresh_token: credentials.refreshToken
            });

            // Create Gmail API instance
            this.gmail = google.gmail({ version: 'v1', auth: this.auth });
            
            console.log('Gmail API initialized successfully');
        } catch (error) {
            console.error('Error initializing Gmail API:', error.message);
            throw error;
        }
    }

    /**
     * Get Gmail credentials from environment
     */
    getCredentials() {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/oauth2callback';
        
        let accessToken = process.env.GOOGLE_ACCESS_TOKEN;
        let refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

        // Decrypt tokens if they're encrypted
        if (process.env.ENCRYPTED_GOOGLE_ACCESS_TOKEN) {
            accessToken = this.envConfig.encryption.decrypt(process.env.ENCRYPTED_GOOGLE_ACCESS_TOKEN);
        }
        if (process.env.ENCRYPTED_GOOGLE_REFRESH_TOKEN) {
            refreshToken = this.envConfig.encryption.decrypt(process.env.ENCRYPTED_GOOGLE_REFRESH_TOKEN);
        }

        if (!clientId || !clientSecret || !accessToken || !refreshToken) {
            throw new Error('Google API credentials not found. Please set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_ACCESS_TOKEN, and GOOGLE_REFRESH_TOKEN in .env file');
        }

        return {
            clientId,
            clientSecret,
            redirectUri,
            accessToken,
            refreshToken
        };
    }

    /**
     * Search for emails
     * @param {string} query - Gmail search query
     * @param {Object} options - Search options
     * @returns {Promise<Array>} Array of email objects
     */
    async searchEmails(query, options = {}) {
        const {
            maxResults = 10,
            includeSpamTrash = false
        } = options;

        try {
            const response = await this.gmail.users.messages.list({
                userId: 'me',
                q: query,
                maxResults,
                includeSpamTrash
            });

            const messages = response.data.messages || [];
            const emailDetails = [];

            // Get detailed information for each email
            for (const message of messages) {
                const email = await this.getEmailDetails(message.id);
                emailDetails.push(email);
            }

            return emailDetails;
        } catch (error) {
            console.error('Error searching emails:', error.message);
            throw error;
        }
    }

    /**
     * Get email details by ID
     * @param {string} messageId - Gmail message ID
     * @returns {Promise<Object>} Email details
     */
    async getEmailDetails(messageId) {
        try {
            const response = await this.gmail.users.messages.get({
                userId: 'me',
                id: messageId,
                format: 'full'
            });

            const message = response.data;
            const headers = message.payload.headers;
            
            // Extract email information
            const email = {
                id: messageId,
                threadId: message.threadId,
                snippet: message.snippet,
                sizeEstimate: message.sizeEstimate,
                historyId: message.historyId,
                internalDate: message.internalDate,
                subject: this.getHeader(headers, 'Subject'),
                from: this.getHeader(headers, 'From'),
                to: this.getHeader(headers, 'To'),
                date: this.getHeader(headers, 'Date'),
                body: this.extractEmailBody(message.payload),
                links: this.extractLinks(message.payload)
            };

            return email;
        } catch (error) {
            console.error('Error getting email details:', error.message);
            throw error;
        }
    }

    /**
     * Find email by subject
     * @param {string} subject - Email subject to search for
     * @param {Object} options - Search options
     * @returns {Promise<Object>} Email object
     */
    async findEmailBySubject(subject, options = {}) {
        const {
            unreadOnly = false,
            maxResults = 10
        } = options;

        let query = `subject:"${subject}"`;
        if (unreadOnly) {
            query += ' is:unread';
        }

        const emails = await this.searchEmails(query, { maxResults });
        
        if (emails.length === 0) {
            throw new Error(`Email with subject "${subject}" not found`);
        }

        return emails[0];
    }

    /**
     * Find email by sender
     * @param {string} sender - Email sender address or name
     * @param {Object} options - Search options
     * @returns {Promise<Object>} Email object
     */
    async findEmailBySender(sender, options = {}) {
        const {
            unreadOnly = false,
            maxResults = 10
        } = options;

        let query = `from:"${sender}"`;
        if (unreadOnly) {
            query += ' is:unread';
        }

        const emails = await this.searchEmails(query, { maxResults });
        
        if (emails.length === 0) {
            throw new Error(`Email from "${sender}" not found`);
        }

        return emails[0];
    }

    /**
     * Wait for email to arrive
     * @param {string} subject - Email subject to wait for
     * @param {Object} options - Options
     * @returns {Promise<Object>} Email object
     */
    async waitForEmail(subject, options = {}) {
        const {
            timeout = 300000, // 5 minutes
            pollInterval = 10000, // 10 seconds
            from = null
        } = options;

        const startTime = Date.now();
        
        while (Date.now() - startTime < timeout) {
            try {
                let query = `subject:"${subject}"`;
                if (from) {
                    query += ` from:"${from}"`;
                }
                
                const emails = await this.searchEmails(query, { maxResults: 1 });
                if (emails.length > 0) {
                    console.log(`Email with subject "${subject}" found`);
                    return emails[0];
                }
            } catch (error) {
                console.log(`Email not found yet, continuing to wait... (${error.message})`);
            }
            
            await this.sleep(pollInterval);
        }

        throw new Error(`Email with subject "${subject}" not received within ${timeout}ms`);
    }

    /**
     * Mark email as read
     * @param {string} messageId - Gmail message ID
     */
    async markAsRead(messageId) {
        try {
            await this.gmail.users.messages.modify({
                userId: 'me',
                id: messageId,
                resource: {
                    removeLabelIds: ['UNREAD']
                }
            });
            console.log(`Email ${messageId} marked as read`);
        } catch (error) {
            console.error('Error marking email as read:', error.message);
            throw error;
        }
    }

    /**
     * Mark email as unread
     * @param {string} messageId - Gmail message ID
     */
    async markAsUnread(messageId) {
        try {
            await this.gmail.users.messages.modify({
                userId: 'me',
                id: messageId,
                resource: {
                    addLabelIds: ['UNREAD']
                }
            });
            console.log(`Email ${messageId} marked as unread`);
        } catch (error) {
            console.error('Error marking email as unread:', error.message);
            throw error;
        }
    }

    /**
     * Delete email
     * @param {string} messageId - Gmail message ID
     */
    async deleteEmail(messageId) {
        try {
            await this.gmail.users.messages.delete({
                userId: 'me',
                id: messageId
            });
            console.log(`Email ${messageId} deleted`);
        } catch (error) {
            console.error('Error deleting email:', error.message);
            throw error;
        }
    }

    /**
     * Archive email
     * @param {string} messageId - Gmail message ID
     */
    async archiveEmail(messageId) {
        try {
            await this.gmail.users.messages.modify({
                userId: 'me',
                id: messageId,
                resource: {
                    removeLabelIds: ['INBOX']
                }
            });
            console.log(`Email ${messageId} archived`);
        } catch (error) {
            console.error('Error archiving email:', error.message);
            throw error;
        }
    }

    /**
     * Get unread email count
     * @returns {Promise<number>} Number of unread emails
     */
    async getUnreadEmailCount() {
        try {
            const response = await this.gmail.users.messages.list({
                userId: 'me',
                q: 'is:unread',
                maxResults: 1
            });
            return response.data.resultSizeEstimate || 0;
        } catch (error) {
            console.error('Error getting unread email count:', error.message);
            return 0;
        }
    }

    /**
     * Extract links from email body
     * @param {Object} payload - Email payload
     * @returns {Array} Array of links
     */
    extractLinks(payload) {
        const links = [];
        const body = this.extractEmailBody(payload);
        
        // Simple regex to find links
        const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/gi;
        let match;
        
        while ((match = linkRegex.exec(body)) !== null) {
            links.push({
                url: match[1],
                text: match[2]
            });
        }
        
        return links;
    }

    /**
     * Extract email body from payload
     * @param {Object} payload - Email payload
     * @returns {string} Email body text
     */
    extractEmailBody(payload) {
        if (payload.body && payload.body.data) {
            return Buffer.from(payload.body.data, 'base64').toString('utf-8');
        }
        
        if (payload.parts) {
            for (const part of payload.parts) {
                if (part.mimeType === 'text/plain' && part.body && part.body.data) {
                    return Buffer.from(part.body.data, 'base64').toString('utf-8');
                }
                if (part.mimeType === 'text/html' && part.body && part.body.data) {
                    return Buffer.from(part.body.data, 'base64').toString('utf-8');
                }
            }
        }
        
        return '';
    }

    /**
     * Get header value from email headers
     * @param {Array} headers - Email headers
     * @param {string} name - Header name
     * @returns {string} Header value
     */
    getHeader(headers, name) {
        const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
        return header ? header.value : '';
    }

    /**
     * Sleep utility
     * @param {number} ms - Milliseconds to sleep
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Refresh access token if needed
     */
    async refreshTokenIfNeeded() {
        try {
            const credentials = this.getCredentials();
            this.auth.setCredentials({
                access_token: credentials.accessToken,
                refresh_token: credentials.refreshToken
            });
            
            // Try to get a new access token
            const { credentials: newCredentials } = await this.auth.refreshAccessToken();
            this.auth.setCredentials(newCredentials);
            
            console.log('Access token refreshed successfully');
        } catch (error) {
            console.error('Error refreshing access token:', error.message);
            throw error;
        }
    }
}

module.exports = { GmailApiService };
