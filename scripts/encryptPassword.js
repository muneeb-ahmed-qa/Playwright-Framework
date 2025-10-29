const crypto = require('crypto');

/**
 * Password Encryption Utility
 * Demonstrates secure password handling for test automation
 */
class PasswordEncryption {
    constructor() {
        this.algorithm = 'aes-256-cbc';
        this.secretKey = this.prepareSecretKey(process.env.ENCRYPTION_KEY || 'your-32-character-secret-key-here');
        this.ivLength = 16; // For AES, this is always 16
    }

    /**
     * Prepare secret key for encryption
     * @param {string} key - Secret key
     * @returns {string} Prepared key
     */
    prepareSecretKey(key) {
        // If key is already hex, return as is
        if (/^[0-9a-fA-F]{64}$/.test(key)) {
            return key;
        }
        
        // Convert string to 32-byte key using SHA-256
        return crypto.createHash('sha256').update(key).digest('hex');
    }

    /**
     * Encrypt a password
     * @param {string} password - Plain text password
     * @returns {string} Encrypted password
     */
    encrypt(password) {
        try {
            const iv = crypto.randomBytes(this.ivLength);
            const cipher = crypto.createCipheriv(this.algorithm, Buffer.from(this.secretKey, 'hex'), iv);
            
            let encrypted = cipher.update(password, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            
            // Combine IV and encrypted data
            const combined = iv.toString('hex') + ':' + encrypted;
            return combined;
        } catch (error) {
            console.error('Encryption error:', error.message);
            throw new Error('Failed to encrypt password');
        }
    }

    /**
     * Decrypt a password
     * @param {string} encryptedPassword - Encrypted password
     * @returns {string} Decrypted password
     */
    decrypt(encryptedPassword) {
        try {
            const parts = encryptedPassword.split(':');
            if (parts.length !== 2) {
                throw new Error('Invalid encrypted password format');
            }

            const iv = Buffer.from(parts[0], 'hex');
            const encrypted = parts[1];
            
            const decipher = crypto.createDecipheriv(this.algorithm, Buffer.from(this.secretKey, 'hex'), iv);
            
            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            
            return decrypted;
        } catch (error) {
            console.error('Decryption error:', error.message);
            throw new Error('Failed to decrypt password');
        }
    }

    /**
     * Generate a secure random password
     * @param {number} length - Password length (default: 12)
     * @param {Object} options - Password generation options
     * @returns {string} Generated password
     */
    generateSecurePassword(length = 12, options = {}) {
        const {
            includeUppercase = true,
            includeLowercase = true,
            includeNumbers = true,
            includeSymbols = true
        } = options;

        let charset = '';
        if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
        if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (includeNumbers) charset += '0123456789';
        if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

        let password = '';
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }

        return password;
    }

    /**
     * Hash a password using SHA-256
     * @param {string} password - Plain text password
     * @returns {string} Hashed password
     */
    hashPassword(password) {
        return crypto.createHash('sha256').update(password).digest('hex');
    }

    /**
     * Verify a password against its hash
     * @param {string} password - Plain text password
     * @param {string} hash - Hashed password
     * @returns {boolean} True if password matches hash
     */
    verifyPassword(password, hash) {
        const passwordHash = this.hashPassword(password);
        return passwordHash === hash;
    }

    /**
     * Generate a secure encryption key
     * @param {number} length - Key length in bytes (default: 32)
     * @returns {string} Generated encryption key
     */
    generateEncryptionKey(length = 32) {
        return crypto.randomBytes(length).toString('hex');
    }

    /**
     * Encrypt sensitive test data
     * @param {Object} data - Data object to encrypt
     * @returns {string} Encrypted data
     */
    encryptTestData(data) {
        try {
            const jsonString = JSON.stringify(data);
            const iv = crypto.randomBytes(this.ivLength);
            const cipher = crypto.createCipheriv(this.algorithm, Buffer.from(this.secretKey, 'hex'), iv);
            
            let encrypted = cipher.update(jsonString, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            
            const combined = iv.toString('hex') + ':' + encrypted;
            return combined;
        } catch (error) {
            console.error('Test data encryption error:', error.message);
            throw new Error('Failed to encrypt test data');
        }
    }

    /**
     * Decrypt sensitive test data
     * @param {string} encryptedData - Encrypted data
     * @returns {Object} Decrypted data object
     */
    decryptTestData(encryptedData) {
        try {
            const parts = encryptedData.split(':');
            if (parts.length !== 2) {
                throw new Error('Invalid encrypted data format');
            }

            const iv = Buffer.from(parts[0], 'hex');
            const encrypted = parts[1];
            
            const decipher = crypto.createDecipheriv(this.algorithm, Buffer.from(this.secretKey, 'hex'), iv);
            
            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            
            return JSON.parse(decrypted);
        } catch (error) {
            console.error('Test data decryption error:', error.message);
            throw new Error('Failed to decrypt test data');
        }
    }

    /**
     * Create a secure token
     * @param {string} data - Data to include in token
     * @param {number} expiryMinutes - Token expiry in minutes (default: 60)
     * @returns {string} Secure token
     */
    createSecureToken(data, expiryMinutes = 60) {
        const payload = {
            data: data,
            timestamp: Date.now(),
            expiry: Date.now() + (expiryMinutes * 60 * 1000)
        };

        const token = Buffer.from(JSON.stringify(payload)).toString('base64');
        const signature = crypto.createHmac('sha256', this.secretKey)
            .update(token)
            .digest('hex');

        return `${token}.${signature}`;
    }

    /**
     * Verify a secure token
     * @param {string} token - Token to verify
     * @returns {Object|null} Decoded payload or null if invalid
     */
    verifySecureToken(token) {
        try {
            const parts = token.split('.');
            if (parts.length !== 2) {
                return null;
            }

            const [payload, signature] = parts;
            const expectedSignature = crypto.createHmac('sha256', this.secretKey)
                .update(payload)
                .digest('hex');

            if (signature !== expectedSignature) {
                return null;
            }

            const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
            
            if (Date.now() > decoded.expiry) {
                return null; // Token expired
            }

            return decoded;
        } catch (error) {
            console.error('Token verification error:', error.message);
            return null;
        }
    }
}

// CLI usage
if (require.main === module) {
    const args = process.argv.slice(2);
    const command = args[0];
    const password = args[1];

    const encryption = new PasswordEncryption();

    switch (command) {
        case 'encrypt':
            if (!password) {
                console.error('Usage: node encryptPassword.js encrypt <password>');
                process.exit(1);
            }
            console.log('Encrypted password:', encryption.encrypt(password));
            break;

        case 'decrypt':
            if (!password) {
                console.error('Usage: node encryptPassword.js decrypt <encrypted-password>');
                process.exit(1);
            }
            try {
                console.log('Decrypted password:', encryption.decrypt(password));
            } catch (error) {
                console.error('Decryption failed:', error.message);
                process.exit(1);
            }
            break;

        case 'generate':
            const length = parseInt(args[1]) || 12;
            const options = {
                includeUppercase: args.includes('--uppercase'),
                includeLowercase: args.includes('--lowercase'),
                includeNumbers: args.includes('--numbers'),
                includeSymbols: args.includes('--symbols')
            };
            console.log('Generated password:', encryption.generateSecurePassword(length, options));
            break;

        case 'hash':
            if (!password) {
                console.error('Usage: node encryptPassword.js hash <password>');
                process.exit(1);
            }
            console.log('Password hash:', encryption.hashPassword(password));
            break;

        case 'key':
            const keyLength = parseInt(args[1]) || 32;
            console.log('Generated encryption key:', encryption.generateEncryptionKey(keyLength));
            break;

        default:
            console.log(`
Password Encryption Utility

Usage:
  node encryptPassword.js encrypt <password>           - Encrypt a password
  node encryptPassword.js decrypt <encrypted-password> - Decrypt a password
  node encryptPassword.js generate [length] [options]  - Generate secure password
  node encryptPassword.js hash <password>              - Hash a password
  node encryptPassword.js key [length]                 - Generate encryption key

Options for generate:
  --uppercase  Include uppercase letters
  --lowercase  Include lowercase letters
  --numbers    Include numbers
  --symbols    Include symbols

Examples:
  node encryptPassword.js encrypt "mypassword"
  node encryptPassword.js generate 16 --uppercase --numbers --symbols
  node encryptPassword.js hash "mypassword"
  node encryptPassword.js key 64
            `);
            break;
    }
}

module.exports = { PasswordEncryption };
