const { PasswordEncryption } = require('../scripts/encryptPassword');

/**
 * Password Encryption Utility for Test Automation
 * Provides secure password handling for test data and sensitive information
 */
class PasswordEncryptionHelper {
    constructor() {
        this.encryption = new PasswordEncryption();
    }

    /**
     * Encrypt test user credentials
     * @param {Object} credentials - User credentials object
     * @returns {Object} Encrypted credentials
     */
    encryptCredentials(credentials) {
        const encrypted = { ...credentials };
        
        if (encrypted.password) {
            encrypted.password = this.encryption.encrypt(encrypted.password);
        }
        
        if (encrypted.apiKey) {
            encrypted.apiKey = this.encryption.encrypt(encrypted.apiKey);
        }
        
        if (encrypted.token) {
            encrypted.token = this.encryption.encrypt(encrypted.token);
        }

        return encrypted;
    }

    /**
     * Decrypt test user credentials
     * @param {Object} encryptedCredentials - Encrypted credentials object
     * @returns {Object} Decrypted credentials
     */
    decryptCredentials(encryptedCredentials) {
        const decrypted = { ...encryptedCredentials };
        
        if (decrypted.password) {
            decrypted.password = this.encryption.decrypt(decrypted.password);
        }
        
        if (decrypted.apiKey) {
            decrypted.apiKey = this.encryption.decrypt(decrypted.apiKey);
        }
        
        if (decrypted.token) {
            decrypted.token = this.encryption.decrypt(decrypted.token);
        }

        return decrypted;
    }

    /**
     * Generate secure test passwords
     * @param {number} count - Number of passwords to generate
     * @param {Object} options - Password generation options
     * @returns {Array} Array of generated passwords
     */
    generateTestPasswords(count = 5, options = {}) {
        const passwords = [];
        for (let i = 0; i < count; i++) {
            passwords.push(this.encryption.generateSecurePassword(12, options));
        }
        return passwords;
    }

    /**
     * Create encrypted test data file
     * @param {Object} testData - Test data to encrypt
     * @param {string} filePath - File path to save encrypted data
     */
    async createEncryptedTestData(testData, filePath) {
        const fs = require('fs').promises;
        
        try {
            // Encrypt sensitive fields
            const encryptedData = this.encryptSensitiveFields(testData);
            
            // Save to file
            await fs.writeFile(filePath, JSON.stringify(encryptedData, null, 2));
            console.log(`Encrypted test data saved to: ${filePath}`);
        } catch (error) {
            console.error('Failed to create encrypted test data:', error.message);
            throw error;
        }
    }

    /**
     * Load and decrypt test data file
     * @param {string} filePath - File path to encrypted test data
     * @returns {Object} Decrypted test data
     */
    async loadEncryptedTestData(filePath) {
        const fs = require('fs').promises;
        
        try {
            const encryptedData = JSON.parse(await fs.readFile(filePath, 'utf8'));
            return this.decryptSensitiveFields(encryptedData);
        } catch (error) {
            console.error('Failed to load encrypted test data:', error.message);
            throw error;
        }
    }

    /**
     * Encrypt sensitive fields in test data
     * @param {Object} data - Test data object
     * @returns {Object} Data with encrypted sensitive fields
     */
    encryptSensitiveFields(data) {
        const encrypted = JSON.parse(JSON.stringify(data)); // Deep clone
        
        const sensitiveFields = ['password', 'apiKey', 'token', 'secret', 'key'];
        
        const encryptObject = (obj) => {
            if (typeof obj === 'object' && obj !== null) {
                if (Array.isArray(obj)) {
                    return obj.map(encryptObject);
                } else {
                    const result = {};
                    for (const [key, value] of Object.entries(obj)) {
                        if (sensitiveFields.includes(key.toLowerCase()) && typeof value === 'string') {
                            result[key] = this.encryption.encrypt(value);
                        } else {
                            result[key] = encryptObject(value);
                        }
                    }
                    return result;
                }
            }
            return obj;
        };
        
        return encryptObject(encrypted);
    }

    /**
     * Decrypt sensitive fields in test data
     * @param {Object} data - Test data object with encrypted fields
     * @returns {Object} Data with decrypted sensitive fields
     */
    decryptSensitiveFields(data) {
        const decrypted = JSON.parse(JSON.stringify(data)); // Deep clone
        
        const sensitiveFields = ['password', 'apiKey', 'token', 'secret', 'key'];
        
        const decryptObject = (obj) => {
            if (typeof obj === 'object' && obj !== null) {
                if (Array.isArray(obj)) {
                    return obj.map(decryptObject);
                } else {
                    const result = {};
                    for (const [key, value] of Object.entries(obj)) {
                        if (sensitiveFields.includes(key.toLowerCase()) && typeof value === 'string') {
                            try {
                                result[key] = this.encryption.decrypt(value);
                            } catch (error) {
                                // If decryption fails, keep original value (might not be encrypted)
                                result[key] = value;
                            }
                        } else {
                            result[key] = decryptObject(value);
                        }
                    }
                    return result;
                }
            }
            return obj;
        };
        
        return decryptObject(decrypted);
    }

    /**
     * Create secure test tokens
     * @param {Array} testScenarios - Array of test scenario data
     * @returns {Array} Array of test scenarios with secure tokens
     */
    createSecureTestTokens(testScenarios) {
        return testScenarios.map(scenario => {
            const token = this.encryption.createSecureToken(
                JSON.stringify(scenario),
                60 // 60 minutes expiry
            );
            
            return {
                ...scenario,
                secureToken: token
            };
        });
    }

    /**
     * Verify secure test token
     * @param {string} token - Secure token to verify
     * @returns {Object|null} Decoded token data or null if invalid
     */
    verifySecureTestToken(token) {
        const decoded = this.encryption.verifySecureToken(token);
        if (decoded) {
            return JSON.parse(decoded.data);
        }
        return null;
    }

    /**
     * Generate encrypted test users
     * @param {number} count - Number of test users to generate
     * @returns {Array} Array of encrypted test user objects
     */
    generateEncryptedTestUsers(count = 3) {
        const users = [];
        
        for (let i = 0; i < count; i++) {
            const user = {
                id: i + 1,
                username: `testuser${i + 1}@example.com`,
                password: this.encryption.generateSecurePassword(12),
                firstName: `Test${i + 1}`,
                lastName: `User${i + 1}`,
                role: i === 0 ? 'admin' : i === 1 ? 'user' : 'guest',
                apiKey: this.encryption.generateEncryptionKey(32),
                token: this.encryption.createSecureToken(`user${i + 1}`, 120)
            };
            
            // Encrypt sensitive fields
            const encryptedUser = this.encryptCredentials(user);
            users.push(encryptedUser);
        }
        
        return users;
    }

    /**
     * Create password policy validator
     * @param {Object} policy - Password policy rules
     * @returns {Function} Password validation function
     */
    createPasswordValidator(policy = {}) {
        const {
            minLength = 8,
            requireUppercase = true,
            requireLowercase = true,
            requireNumbers = true,
            requireSymbols = false,
            maxLength = 128
        } = policy;

        return (password) => {
            const errors = [];
            
            if (password.length < minLength) {
                errors.push(`Password must be at least ${minLength} characters long`);
            }
            
            if (password.length > maxLength) {
                errors.push(`Password must be no more than ${maxLength} characters long`);
            }
            
            if (requireUppercase && !/[A-Z]/.test(password)) {
                errors.push('Password must contain at least one uppercase letter');
            }
            
            if (requireLowercase && !/[a-z]/.test(password)) {
                errors.push('Password must contain at least one lowercase letter');
            }
            
            if (requireNumbers && !/\d/.test(password)) {
                errors.push('Password must contain at least one number');
            }
            
            if (requireSymbols && !/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(password)) {
                errors.push('Password must contain at least one symbol');
            }
            
            return {
                isValid: errors.length === 0,
                errors: errors
            };
        };
    }

    /**
     * Generate test data with encrypted passwords
     * @param {Object} baseData - Base test data
     * @returns {Object} Test data with encrypted passwords
     */
    generateTestDataWithEncryption(baseData) {
        const testData = JSON.parse(JSON.stringify(baseData));
        
        // Add encrypted password fields
        if (testData.users) {
            testData.users = testData.users.map(user => ({
                ...user,
                password: this.encryption.encrypt(user.password || 'defaultPassword123'),
                encryptedPassword: this.encryption.encrypt(user.password || 'defaultPassword123')
            }));
        }
        
        // Add API keys and tokens
        testData.apiKeys = {
            test: this.encryption.encrypt('test-api-key-12345'),
            staging: this.encryption.encrypt('staging-api-key-67890'),
            production: this.encryption.encrypt('production-api-key-abcdef')
        };
        
        testData.tokens = {
            access: this.encryption.createSecureToken('access-token', 60),
            refresh: this.encryption.createSecureToken('refresh-token', 1440), // 24 hours
            admin: this.encryption.createSecureToken('admin-token', 480) // 8 hours
        };
        
        return testData;
    }
}

module.exports = { PasswordEncryptionHelper };
