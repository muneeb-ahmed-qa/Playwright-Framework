#!/usr/bin/env node

const { PasswordEncryption } = require('../scripts/encryptPassword');
const { EnvConfig } = require('../utils/envConfig');
const fs = require('fs').promises;

/**
 * Setup Encrypted Credentials Script
 * Generates encrypted passwords and updates .env file
 */

async function setupEncryptedCredentials() {
    console.log('🔐 Setting up encrypted credentials...\n');

    try {
        const encryption = new PasswordEncryption();
        const envConfig = new EnvConfig();

        // Default passwords for different roles
        const passwords = {
            admin: 'AdminPass123!',
            user: 'UserPass456!',
            guest: 'GuestPass789!'
        };

        console.log('📝 Generating encrypted passwords...');
        
        // Generate encrypted passwords
        const encryptedPasswords = {};
        for (const [role, password] of Object.entries(passwords)) {
            const encrypted = encryption.encrypt(password);
            encryptedPasswords[`ENCRYPTED_${role.toUpperCase()}_PASSWORD`] = encrypted;
            console.log(`✅ ${role.toUpperCase()}: ${password} → ${encrypted.substring(0, 20)}...`);
        }

        // Generate encryption key if not exists
        const encryptionKey = process.env.ENCRYPTION_KEY || encryption.generateEncryptionKey(32);
        
        console.log('\n🔑 Encryption Key:', encryptionKey);

        // Create .env file content
        const envContent = `# Application Configuration
BASE_URL=${process.env.BASE_URL || 'https://example.com'}
API_BASE_URL=${process.env.API_BASE_URL || 'https://api.example.com'}

# Test Configuration
TIMEOUT=${process.env.TIMEOUT || '30000'}
RETRIES=${process.env.RETRIES || '2'}
WORKERS=${process.env.WORKERS || '4'}

# Browser Configuration
HEADLESS=${process.env.HEADLESS || 'true'}
SLOW_MO=${process.env.SLOW_MO || '0'}

# Encryption Configuration
ENCRYPTION_KEY=${encryptionKey}

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
API_TIMEOUT=${process.env.API_TIMEOUT || '10000'}

# Reporting
REPORT_PATH=${process.env.REPORT_PATH || 'playwright-report'}
SCREENSHOT_PATH=${process.env.SCREENSHOT_PATH || 'screenshots'}
VIDEO_PATH=${process.env.VIDEO_PATH || 'videos'}

# Environment
NODE_ENV=${process.env.NODE_ENV || 'test'}
`;

        // Write .env file
        await fs.writeFile('.env', envContent);
        console.log('\n✅ .env file updated with encrypted credentials');

        // Validate configuration
        console.log('\n🔍 Validating configuration...');
        const validation = envConfig.validateConfig();
        
        if (validation.isValid) {
            console.log('✅ Configuration is valid');
        } else {
            console.log('❌ Configuration validation failed:');
            validation.errors.forEach(error => console.log(`  - ${error}`));
        }

        if (validation.warnings.length > 0) {
            console.log('\n⚠️  Warnings:');
            validation.warnings.forEach(warning => console.log(`  - ${warning}`));
        }

        // Display summary
        console.log('\n📊 Configuration Summary:');
        const summary = envConfig.getSummary();
        console.log(`  Base URL: ${summary.baseUrl}`);
        console.log(`  API URL: ${summary.apiUrl}`);
        console.log(`  Available Roles: ${summary.availableRoles.join(', ')}`);
        console.log(`  Headless Mode: ${summary.testConfig.headless}`);
        console.log(`  Timeout: ${summary.testConfig.timeout}ms`);

        console.log('\n🎉 Setup complete! You can now use encrypted credentials in your tests.');
        console.log('\n📖 Usage Examples:');
        console.log('  await loginPage.loginAsAdmin();');
        console.log('  await loginPage.loginAsUser();');
        console.log('  await loginPage.loginAsGuest();');

    } catch (error) {
        console.error('❌ Error setting up encrypted credentials:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    setupEncryptedCredentials();
}

module.exports = { setupEncryptedCredentials };
