require('dotenv').config();
const { PasswordEncryption } = require('../scripts/encryptPassword');

/**
 * Environment Configuration Utility
 * Handles environment variables and encrypted credentials
 */
class EnvConfig {
    constructor() {
        this.encryption = new PasswordEncryption();
    }

    /**
     * Get application base URL
     * @returns {string} Base URL
     */
    getBaseUrl() {
        return process.env.BASE_URL || 'https://example.com';
    }

    /**
     * Get API base URL
     * @returns {string} API base URL
     */
    getApiUrl() {
        return process.env.API_BASE_URL || 'https://api.example.com';
    }

    /**
     * Get test configuration
     * @returns {Object} Test configuration
     */
    getTestConfig() {
        return {
            timeout: parseInt(process.env.TIMEOUT) || 30000,
            retries: parseInt(process.env.RETRIES) || 2,
            workers: parseInt(process.env.WORKERS) || 4,
            headless: process.env.HEADLESS === 'true',
            slowMo: parseInt(process.env.SLOW_MO) || 0
        };
    }

    /**
     * Get encrypted credentials for a user role
     * @param {string} role - User role (admin, user, guest)
     * @returns {Object} Decrypted credentials
     */
    getCredentials(role) {
        const roleMap = {
            admin: {
                username: process.env.ADMIN_USERNAME || 'admin@example.com',
                encryptedPassword: process.env.ENCRYPTED_ADMIN_PASSWORD
            },
            user: {
                username: process.env.USER_USERNAME || 'user@example.com',
                encryptedPassword: process.env.ENCRYPTED_USER_PASSWORD
            },
            guest: {
                username: process.env.GUEST_USERNAME || 'guest@example.com',
                encryptedPassword: process.env.ENCRYPTED_GUEST_PASSWORD
            }
        };

        const credentials = roleMap[role.toLowerCase()];
        if (!credentials) {
            throw new Error(`Invalid user role: ${role}`);
        }

        if (!credentials.encryptedPassword) {
            throw new Error(`No encrypted password found for role: ${role}`);
        }

        try {
            const decryptedPassword = this.encryption.decrypt(credentials.encryptedPassword);
            return {
                username: credentials.username,
                password: decryptedPassword
            };
        } catch (error) {
            throw new Error(`Failed to decrypt password for role ${role}: ${error.message}`);
        }
    }

    /**
     * Get all available user roles
     * @returns {Array} Array of available roles
     */
    getAvailableRoles() {
        return ['admin', 'user', 'guest'];
    }

    /**
     * Get API configuration
     * @returns {Object} API configuration
     */
    getApiConfig() {
        return {
            baseUrl: this.getApiUrl(),
            token: process.env.API_TOKEN || '',
            timeout: parseInt(process.env.API_TIMEOUT) || 10000
        };
    }

    /**
     * Get reporting configuration
     * @returns {Object} Reporting configuration
     */
    getReportingConfig() {
        return {
            reportPath: process.env.REPORT_PATH || 'playwright-report',
            screenshotPath: process.env.SCREENSHOT_PATH || 'screenshots',
            videoPath: process.env.VIDEO_PATH || 'videos'
        };
    }

    /**
     * Generate encrypted passwords for all roles
     * @param {Object} passwords - Object with role passwords
     * @returns {Object} Encrypted passwords
     */
    generateEncryptedPasswords(passwords = {}) {
        const defaultPasswords = {
            admin: 'AdminPass123!',
            user: 'UserPass456!',
            guest: 'GuestPass789!'
        };

        const finalPasswords = { ...defaultPasswords, ...passwords };
        const encrypted = {};

        for (const [role, password] of Object.entries(finalPasswords)) {
            encrypted[`ENCRYPTED_${role.toUpperCase()}_PASSWORD`] = this.encryption.encrypt(password);
        }

        return encrypted;
    }

    /**
     * Create .env file with encrypted passwords
     * @param {Object} passwords - Object with role passwords
     * @param {string} filePath - Path to save .env file
     */
    async createEnvFile(passwords = {}, filePath = '.env') {
        const fs = require('fs').promises;
        
        const encryptedPasswords = this.generateEncryptedPasswords(passwords);
        
        const envContent = `# Application Configuration
BASE_URL=${this.getBaseUrl()}
API_BASE_URL=${this.getApiUrl()}

# Test Configuration
TIMEOUT=${this.getTestConfig().timeout}
RETRIES=${this.getTestConfig().retries}
WORKERS=${this.getTestConfig().workers}

# Browser Configuration
HEADLESS=${this.getTestConfig().headless}
SLOW_MO=${this.getTestConfig().slowMo}

# Encryption Configuration
ENCRYPTION_KEY=${process.env.ENCRYPTION_KEY || this.encryption.secretKey}

# Encrypted Test Credentials
ENCRYPTED_ADMIN_PASSWORD=${encryptedPasswords.ENCRYPTED_ADMIN_PASSWORD}
ENCRYPTED_USER_PASSWORD=${encryptedPasswords.ENCRYPTED_USER_PASSWORD}
ENCRYPTED_GUEST_PASSWORD=${encryptedPasswords.ENCRYPTED_GUEST_PASSWORD}

# Test User Credentials (for reference)
ADMIN_USERNAME=${process.env.ADMIN_USERNAME || 'admin@example.com'}
USER_USERNAME=${process.env.USER_USERNAME || 'user@example.com'}
GUEST_USERNAME=${process.env.GUEST_USERNAME || 'guest@example.com'}

# API Configuration
API_TOKEN=${process.env.API_TOKEN || ''}
API_TIMEOUT=${this.getApiConfig().timeout}

# Reporting
REPORT_PATH=${this.getReportingConfig().reportPath}
SCREENSHOT_PATH=${this.getReportingConfig().screenshotPath}
VIDEO_PATH=${this.getReportingConfig().videoPath}

# Environment
NODE_ENV=${process.env.NODE_ENV || 'test'}
`;

        await fs.writeFile(filePath, envContent);
        console.log(`Environment file created: ${filePath}`);
    }

    /**
     * Validate environment configuration
     * @returns {Object} Validation result
     */
    validateConfig() {
        const errors = [];
        const warnings = [];

        // Check required environment variables
        if (!process.env.ENCRYPTION_KEY) {
            errors.push('ENCRYPTION_KEY is not set');
        }

        if (!process.env.BASE_URL) {
            warnings.push('BASE_URL is not set, using default');
        }

        // Check encrypted passwords
        const roles = this.getAvailableRoles();
        for (const role of roles) {
            const envVar = `ENCRYPTED_${role.toUpperCase()}_PASSWORD`;
            if (!process.env[envVar]) {
                errors.push(`${envVar} is not set`);
            } else {
                // Check if the encrypted password has the correct format (IV:encrypted)
                const parts = process.env[envVar].split(':');
                if (parts.length !== 2 || parts[0].length !== 32 || parts[1].length < 1) {
                    errors.push(`${envVar} is not in valid encrypted format`);
                }
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Get environment summary
     * @returns {Object} Environment summary
     */
    getSummary() {
        const validation = this.validateConfig();
        
        return {
            baseUrl: this.getBaseUrl(),
            apiUrl: this.getApiUrl(),
            testConfig: this.getTestConfig(),
            availableRoles: this.getAvailableRoles(),
            apiConfig: this.getApiConfig(),
            reportingConfig: this.getReportingConfig(),
            validation
        };
    }
}

module.exports = { EnvConfig };
