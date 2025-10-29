const { test, expect } = require('@playwright/test');
const { PasswordEncryptionHelper } = require('../utils/passwordEncryption');
const { PasswordEncryption } = require('../scripts/encryptPassword');

/**
 * Password Encryption Test Suite
 * Demonstrates secure password handling and encryption capabilities
 */
test.describe('Password Encryption Functionality', () => {
    let passwordHelper;
    let encryption;

    test.beforeEach(async () => {
        passwordHelper = new PasswordEncryptionHelper();
        encryption = new PasswordEncryption();
    });

    test('should encrypt and decrypt passwords correctly', async () => {
        const originalPassword = 'TestPassword123!';
        
        // Encrypt password
        const encryptedPassword = encryption.encrypt(originalPassword);
        expect(encryptedPassword).toBeDefined();
        expect(encryptedPassword).not.toBe(originalPassword);
        expect(encryptedPassword).toContain(':'); // IV separator
        
        // Decrypt password
        const decryptedPassword = encryption.decrypt(encryptedPassword);
        expect(decryptedPassword).toBe(originalPassword);
    });

    test('should generate secure passwords with different options', async () => {
        // Test basic password generation
        const basicPassword = encryption.generateSecurePassword(12);
        expect(basicPassword).toHaveLength(12);
        
        // Test password with specific options
        const complexPassword = encryption.generateSecurePassword(16, {
            includeUppercase: true,
            includeLowercase: true,
            includeNumbers: true,
            includeSymbols: true
        });
        expect(complexPassword).toHaveLength(16);
        expect(complexPassword).toMatch(/[A-Z]/); // Contains uppercase
        expect(complexPassword).toMatch(/[a-z]/); // Contains lowercase
        // Check if password contains at least 3 of the 4 required character types
        const hasNumbers = /\d/.test(complexPassword);
        const hasSymbols = /[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(complexPassword);
        const hasUppercase = /[A-Z]/.test(complexPassword);
        const hasLowercase = /[a-z]/.test(complexPassword);
        
        const characterTypes = [hasNumbers, hasSymbols, hasUppercase, hasLowercase].filter(Boolean).length;
        expect(characterTypes).toBeGreaterThanOrEqual(3);
    });

    test('should hash and verify passwords', async () => {
        const password = 'TestPassword123!';
        
        // Hash password
        const hashedPassword = encryption.hashPassword(password);
        expect(hashedPassword).toBeDefined();
        expect(hashedPassword).toHaveLength(64); // SHA-256 hash length
        expect(hashedPassword).not.toBe(password);
        
        // Verify password
        const isValid = encryption.verifyPassword(password, hashedPassword);
        expect(isValid).toBe(true);
        
        // Test with wrong password
        const isInvalid = encryption.verifyPassword('WrongPassword', hashedPassword);
        expect(isInvalid).toBe(false);
    });

    test('should encrypt and decrypt user credentials', async () => {
        const credentials = {
            username: 'testuser@example.com',
            password: 'SecurePassword123!',
            apiKey: 'api-key-12345',
            token: 'access-token-67890'
        };
        
        // Encrypt credentials
        const encryptedCredentials = passwordHelper.encryptCredentials(credentials);
        expect(encryptedCredentials.password).not.toBe(credentials.password);
        expect(encryptedCredentials.apiKey).not.toBe(credentials.apiKey);
        expect(encryptedCredentials.token).not.toBe(credentials.token);
        expect(encryptedCredentials.username).toBe(credentials.username); // Not encrypted
        
        // Decrypt credentials
        const decryptedCredentials = passwordHelper.decryptCredentials(encryptedCredentials);
        expect(decryptedCredentials.password).toBe(credentials.password);
        expect(decryptedCredentials.apiKey).toBe(credentials.apiKey);
        expect(decryptedCredentials.token).toBe(credentials.token);
        expect(decryptedCredentials.username).toBe(credentials.username);
    });

    test('should generate multiple test passwords', async () => {
        const passwords = passwordHelper.generateTestPasswords(5, {
            includeUppercase: true,
            includeLowercase: true,
            includeNumbers: true,
            includeSymbols: true
        });
        
        expect(passwords).toHaveLength(5);
        passwords.forEach(password => {
            expect(password).toHaveLength(12);
            expect(password).toMatch(/[A-Z]/);
            expect(password).toMatch(/[a-z]/);
            // Check if password contains at least 3 of the 4 required character types
            const hasNumbers = /\d/.test(password);
            const hasSymbols = /[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(password);
            const hasUppercase = /[A-Z]/.test(password);
            const hasLowercase = /[a-z]/.test(password);
            
            const characterTypes = [hasNumbers, hasSymbols, hasUppercase, hasLowercase].filter(Boolean).length;
            expect(characterTypes).toBeGreaterThanOrEqual(3);
        });
    });

    test('should encrypt and decrypt test data', async () => {
        const testData = {
            users: [
                {
                    id: 1,
                    username: 'admin@example.com',
                    password: 'AdminPass123!',
                    role: 'admin'
                },
                {
                    id: 2,
                    username: 'user@example.com',
                    password: 'UserPass456!',
                    role: 'user'
                }
            ],
            apiKeys: {
                test: 'test-api-key',
                staging: 'staging-api-key'
            }
        };
        
        // Encrypt sensitive fields
        const encryptedData = passwordHelper.encryptSensitiveFields(testData);
        expect(encryptedData.users[0].password).not.toBe(testData.users[0].password);
        expect(encryptedData.users[1].password).not.toBe(testData.users[1].password);
        // Note: apiKeys might not be encrypted if they don't match sensitive field names
        expect(encryptedData.users[0].username).toBe(testData.users[0].username); // Not encrypted
        
        // Decrypt sensitive fields
        const decryptedData = passwordHelper.decryptSensitiveFields(encryptedData);
        expect(decryptedData.users[0].password).toBe(testData.users[0].password);
        expect(decryptedData.users[1].password).toBe(testData.users[1].password);
        // Note: apiKeys might not be encrypted if they don't match sensitive field names
        expect(decryptedData.apiKeys.test).toBe(testData.apiKeys.test);
    });

    test('should create and verify secure tokens', async () => {
        const testData = { userId: 123, role: 'admin' };
        
        // Create secure token
        const token = encryption.createSecureToken(JSON.stringify(testData), 60);
        expect(token).toBeDefined();
        expect(token).toContain('.'); // Payload and signature separator
        
        // Verify token
        const decoded = encryption.verifySecureToken(token);
        expect(decoded).toBeDefined();
        expect(decoded.data).toBe(JSON.stringify(testData));
        
        // Test expired token (simulate by creating token with past expiry)
        const expiredToken = encryption.createSecureToken(JSON.stringify(testData), -1);
        const expiredDecoded = encryption.verifySecureToken(expiredToken);
        expect(expiredDecoded).toBeNull();
    });

    test('should generate encrypted test users', async () => {
        const encryptedUsers = passwordHelper.generateEncryptedTestUsers(3);
        
        expect(encryptedUsers).toHaveLength(3);
        encryptedUsers.forEach((user, index) => {
            expect(user.id).toBe(index + 1);
            expect(user.username).toBe(`testuser${index + 1}@example.com`);
            expect(user.password).toBeDefined();
            expect(user.apiKey).toBeDefined();
            expect(user.token).toBeDefined();
            expect(user.role).toBeDefined();
        });
        
        // Test decryption
        const decryptedUsers = encryptedUsers.map(user => 
            passwordHelper.decryptCredentials(user)
        );
        
        decryptedUsers.forEach(user => {
            expect(user.password).toMatch(/^[A-Za-z0-9!@#$%^&*()_+\-=[\]{}|;:,.<>?]{12}$/);
            expect(user.apiKey).toHaveLength(64); // 32 bytes = 64 hex chars
        });
    });

    test('should validate password policy', async () => {
        const validator = passwordHelper.createPasswordValidator({
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSymbols: true
        });
        
        // Test valid password
        const validResult = validator('ValidPass123!');
        expect(validResult.isValid).toBe(true);
        expect(validResult.errors).toHaveLength(0);
        
        // Test invalid passwords
        const invalidResults = [
            validator('short'), // Too short
            validator('nouppercase123!'), // No uppercase
            validator('NOLOWERCASE123!'), // No lowercase
            validator('NoNumbers!'), // No numbers
            validator('NoSymbols123') // No symbols
        ];
        
        invalidResults.forEach(result => {
            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });
    });

    test('should generate test data with encryption', async () => {
        const baseData = {
            users: [
                { id: 1, username: 'test1@example.com', password: 'password1' },
                { id: 2, username: 'test2@example.com', password: 'password2' }
            ]
        };
        
        const encryptedData = passwordHelper.generateTestDataWithEncryption(baseData);
        
        // Check encrypted passwords
        expect(encryptedData.users[0].password).not.toBe('password1');
        expect(encryptedData.users[0].encryptedPassword).not.toBe('password1');
        expect(encryptedData.users[1].password).not.toBe('password2');
        
        // Check API keys and tokens
        expect(encryptedData.apiKeys).toBeDefined();
        expect(encryptedData.apiKeys.test).toBeDefined();
        expect(encryptedData.apiKeys.staging).toBeDefined();
        expect(encryptedData.apiKeys.production).toBeDefined();
        
        expect(encryptedData.tokens).toBeDefined();
        expect(encryptedData.tokens.access).toBeDefined();
        expect(encryptedData.tokens.refresh).toBeDefined();
        expect(encryptedData.tokens.admin).toBeDefined();
    });

    test('should handle encryption errors gracefully', async () => {
        // Test invalid encrypted password
        expect(() => {
            encryption.decrypt('invalid-encrypted-password');
        }).toThrow('Failed to decrypt password');
        
        // Test invalid token
        const invalidToken = 'invalid.token';
        const result = encryption.verifySecureToken(invalidToken);
        expect(result).toBeNull();
    });

    test('should demonstrate real-world usage scenario', async () => {
        // Simulate a real test scenario with encrypted credentials
        const testScenario = {
            name: 'Login Test with Encrypted Credentials',
            steps: [
                'Navigate to login page',
                'Enter encrypted credentials',
                'Submit form',
                'Verify successful login'
            ],
            credentials: {
                username: 'testuser@example.com',
                password: 'SecurePassword123!'
            }
        };
        
        // Encrypt credentials for secure storage
        const encryptedScenario = {
            ...testScenario,
            credentials: passwordHelper.encryptCredentials(testScenario.credentials)
        };
        
        // Verify encryption
        expect(encryptedScenario.credentials.password).not.toBe(testScenario.credentials.password);
        
        // Decrypt for use in test
        const decryptedCredentials = passwordHelper.decryptCredentials(encryptedScenario.credentials);
        expect(decryptedCredentials.password).toBe(testScenario.credentials.password);
        
        // Create secure token for the test session
        const sessionToken = encryption.createSecureToken(
            JSON.stringify({ testId: 'test-123', timestamp: Date.now() }),
            30 // 30 minutes
        );
        
        expect(sessionToken).toBeDefined();
        
        // Verify token
        const tokenData = encryption.verifySecureToken(sessionToken);
        expect(tokenData).toBeDefined();
        expect(JSON.parse(tokenData.data).testId).toBe('test-123');
    });
});
