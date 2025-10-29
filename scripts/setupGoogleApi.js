#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const { PasswordEncryption } = require('../utils/passwordEncryption');

/**
 * Google API Setup Script
 * Helps set up Google API credentials for Gmail integration
 */
class GoogleApiSetup {
    constructor() {
        this.encryption = new PasswordEncryption();
        this.envPath = path.join(process.cwd(), '.env');
    }

    /**
     * Main setup function
     */
    async setup() {
        console.log('🔧 Google API Setup');
        console.log('==================');
        
        try {
            // Check if .env file exists
            if (!fs.existsSync(this.envPath)) {
                console.log('❌ .env file not found. Please run npm run setup:credentials first.');
                return;
            }

            // Read current .env file
            const envContent = fs.readFileSync(this.envPath, 'utf8');
            
            // Check if Google API credentials are already set
            if (envContent.includes('GOOGLE_CLIENT_ID')) {
                console.log('✅ Google API credentials already configured');
                return;
            }

            console.log('\n📋 Google API Setup Instructions:');
            console.log('1. Go to Google Cloud Console: https://console.cloud.google.com/');
            console.log('2. Create a new project or select existing one');
            console.log('3. Enable Gmail API');
            console.log('4. Create OAuth 2.0 credentials');
            console.log('5. Add authorized redirect URI: http://localhost:3000/oauth2callback');
            console.log('6. Download the credentials JSON file');
            
            console.log('\n🔑 Please provide your Google API credentials:');
            
            const clientId = await this.prompt('Client ID: ');
            const clientSecret = await this.prompt('Client Secret: ');
            const redirectUri = await this.prompt('Redirect URI (default: http://localhost:3000/oauth2callback): ') || 'http://localhost:3000/oauth2callback';
            
            if (!clientId || !clientSecret) {
                console.log('❌ Client ID and Client Secret are required');
                return;
            }

            // Generate OAuth2 URL
            const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
            const authUrl = oauth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: ['https://www.googleapis.com/auth/gmail.readonly'],
                prompt: 'consent'
            });

            console.log('\n🔗 Please visit this URL to authorize the application:');
            console.log(authUrl);
            
            const authCode = await this.prompt('\nEnter the authorization code: ');
            
            if (!authCode) {
                console.log('❌ Authorization code is required');
                return;
            }

            // Exchange authorization code for tokens
            const { tokens } = await oauth2Client.getToken(authCode);
            
            console.log('✅ Successfully obtained access and refresh tokens');
            
            // Encrypt tokens
            const encryptedAccessToken = this.encryption.encrypt(tokens.access_token);
            const encryptedRefreshToken = this.encryption.encrypt(tokens.refresh_token);
            
            // Add Google API credentials to .env file
            const googleApiConfig = `
# Google API Configuration
GOOGLE_CLIENT_ID=${clientId}
GOOGLE_CLIENT_SECRET=${clientSecret}
GOOGLE_REDIRECT_URI=${redirectUri}
ENCRYPTED_GOOGLE_ACCESS_TOKEN=${encryptedAccessToken}
ENCRYPTED_GOOGLE_REFRESH_TOKEN=${encryptedRefreshToken}
`;

            // Append to .env file
            fs.appendFileSync(this.envPath, googleApiConfig);
            
            console.log('✅ Google API credentials added to .env file');
            console.log('✅ Tokens encrypted and stored securely');
            
            // Test the configuration
            await this.testConfiguration();
            
        } catch (error) {
            console.error('❌ Error setting up Google API:', error.message);
        }
    }

    /**
     * Test the Google API configuration
     */
    async testConfiguration() {
        try {
            console.log('\n🧪 Testing Google API configuration...');
            
            // Load environment variables
            require('dotenv').config();
            
            const { GmailApiService } = require('../utils/gmailApiService');
            const gmailApi = new GmailApiService();
            
            await gmailApi.initialize();
            
            // Test API access
            const unreadCount = await gmailApi.getUnreadEmailCount();
            console.log(`✅ Gmail API working! Unread emails: ${unreadCount}`);
            
        } catch (error) {
            console.error('❌ Google API test failed:', error.message);
            console.log('Please check your credentials and try again');
        }
    }

    /**
     * Prompt user for input
     * @param {string} question - Question to ask
     * @returns {Promise<string>} User input
     */
    async prompt(question) {
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        return new Promise((resolve) => {
            rl.question(question, (answer) => {
                rl.close();
                resolve(answer.trim());
            });
        });
    }

    /**
     * Generate OAuth2 URL for manual setup
     */
    generateOAuth2Url() {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/oauth2callback';
        
        if (!clientId || !clientSecret) {
            console.log('❌ Google API credentials not found in .env file');
            return;
        }

        const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: ['https://www.googleapis.com/auth/gmail.readonly'],
            prompt: 'consent'
        });

        console.log('🔗 OAuth2 URL for Gmail API:');
        console.log(authUrl);
        console.log('\nAfter authorization, you can exchange the code for tokens using:');
        console.log('npm run setup:google-api -- --exchange-code YOUR_CODE');
    }

    /**
     * Exchange authorization code for tokens
     * @param {string} authCode - Authorization code
     */
    async exchangeCodeForTokens(authCode) {
        try {
            const clientId = process.env.GOOGLE_CLIENT_ID;
            const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
            const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/oauth2callback';
            
            if (!clientId || !clientSecret) {
                console.log('❌ Google API credentials not found in .env file');
                return;
            }

            const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
            const { tokens } = await oauth2Client.getToken(authCode);
            
            console.log('✅ Successfully obtained tokens');
            
            // Encrypt tokens
            const encryptedAccessToken = this.encryption.encrypt(tokens.access_token);
            const encryptedRefreshToken = this.encryption.encrypt(tokens.refresh_token);
            
            // Update .env file
            let envContent = fs.readFileSync(this.envPath, 'utf8');
            
            // Update or add encrypted tokens
            if (envContent.includes('ENCRYPTED_GOOGLE_ACCESS_TOKEN')) {
                envContent = envContent.replace(
                    /ENCRYPTED_GOOGLE_ACCESS_TOKEN=.*/,
                    `ENCRYPTED_GOOGLE_ACCESS_TOKEN=${encryptedAccessToken}`
                );
            } else {
                envContent += `\nENCRYPTED_GOOGLE_ACCESS_TOKEN=${encryptedAccessToken}`;
            }
            
            if (envContent.includes('ENCRYPTED_GOOGLE_REFRESH_TOKEN')) {
                envContent = envContent.replace(
                    /ENCRYPTED_GOOGLE_REFRESH_TOKEN=.*/,
                    `ENCRYPTED_GOOGLE_REFRESH_TOKEN=${encryptedRefreshToken}`
                );
            } else {
                envContent += `\nENCRYPTED_GOOGLE_REFRESH_TOKEN=${encryptedRefreshToken}`;
            }
            
            fs.writeFileSync(this.envPath, envContent);
            
            console.log('✅ Tokens encrypted and stored in .env file');
            
        } catch (error) {
            console.error('❌ Error exchanging code for tokens:', error.message);
        }
    }
}

// CLI handling
if (require.main === module) {
    const setup = new GoogleApiSetup();
    const args = process.argv.slice(2);
    
    if (args.includes('--generate-url')) {
        setup.generateOAuth2Url();
    } else if (args.includes('--exchange-code')) {
        const codeIndex = args.indexOf('--exchange-code');
        const authCode = args[codeIndex + 1];
        if (authCode) {
            setup.exchangeCodeForTokens(authCode);
        } else {
            console.log('❌ Please provide authorization code: --exchange-code YOUR_CODE');
        }
    } else {
        setup.setup();
    }
}

module.exports = { GoogleApiSetup };
