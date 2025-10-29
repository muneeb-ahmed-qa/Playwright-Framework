const fs = require('fs');
const path = require('path');
// @ts-ignore - Module is installed and works at runtime
const { faker } = require('@faker-js/faker');
const { PasswordEncryption } = require('./passwordEncryption');

/**
 * Advanced Test Data Management System
 * Handles dynamic test data generation, environment-specific data, cleanup strategies, and data-driven testing
 */
class TestDataManager {
    constructor(options = {}) {
        this.encryption = new PasswordEncryption();
        this.dataDir = options.dataDir || 'test-data';
        this.cleanupStrategy = options.cleanupStrategy || 'auto';
        this.environment = process.env.NODE_ENV || 'test';
        this.generatedData = new Map();
        this.cleanupHooks = [];
        
        // Ensure data directory exists
        this.ensureDataDirectory();
        
        // Load environment-specific configuration
        this.loadEnvironmentConfig();
    }

    /**
     * Ensure test data directory exists
     */
    ensureDataDirectory() {
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
        }
        
        // Create subdirectories
        const subdirs = ['users', 'products', 'orders', 'api', 'fixtures', 'temp'];
        subdirs.forEach(subdir => {
            const subdirPath = path.join(this.dataDir, subdir);
            if (!fs.existsSync(subdirPath)) {
                fs.mkdirSync(subdirPath, { recursive: true });
            }
        });
    }

    /**
     * Load environment-specific configuration
     */
    loadEnvironmentConfig() {
        const configPath = path.join(this.dataDir, 'config', `${this.environment}.json`);
        if (fs.existsSync(configPath)) {
            this.config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        } else {
            this.config = this.getDefaultConfig();
        }
    }

    /**
     * Get default configuration
     */
    getDefaultConfig() {
        return {
            users: {
                count: 10,
                roles: ['admin', 'user', 'guest'],
                domains: ['example.com', 'test.com']
            },
            products: {
                count: 50,
                categories: ['electronics', 'clothing', 'books', 'home'],
                priceRange: { min: 10, max: 1000 }
            },
            api: {
                baseUrl: process.env.API_BASE_URL || 'https://api.example.com',
                timeout: 10000,
                retries: 3
            },
            cleanup: {
                auto: true,
                strategies: ['database', 'api', 'file'],
                retention: '24h'
            }
        };
    }

    /**
     * Generate user data
     * @param {Object} options - User generation options
     * @returns {Object} Generated user data
     */
    generateUser(options = {}) {
        const {
            role = 'user',
            domain = null,
            encryptedPassword = false,
            includeProfile = true,
            includePreferences = false
        } = options;

        const user = {
            id: faker.string.uuid(),
            email: faker.internet.email({ provider: domain || faker.helpers.arrayElement(this.config.users.domains) }),
            username: faker.internet.userName(),
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            role: role,
            isActive: true,
            createdAt: faker.date.past().toISOString(),
            lastLogin: faker.date.recent().toISOString()
        };

        // Generate password
        const password = faker.internet.password({ length: 12, memorable: true });
        user.password = encryptedPassword ? this.encryption.encrypt(password) : password;
        user.plainPassword = password; // Keep plain password for testing

        // Include profile data
        if (includeProfile) {
            user.profile = {
                phone: faker.phone.number(),
                address: {
                    street: faker.location.streetAddress(),
                    city: faker.location.city(),
                    state: faker.location.state(),
                    zipCode: faker.location.zipCode(),
                    country: faker.location.country()
                },
                dateOfBirth: faker.date.birthdate().toISOString(),
                avatar: faker.image.avatar()
            };
        }

        // Include preferences
        if (includePreferences) {
            user.preferences = {
                theme: faker.helpers.arrayElement(['light', 'dark']),
                language: faker.helpers.arrayElement(['en', 'es', 'fr', 'de']),
                notifications: {
                    email: faker.datatype.boolean(),
                    sms: faker.datatype.boolean(),
                    push: faker.datatype.boolean()
                }
            };
        }

        // Store generated data for cleanup
        this.storeGeneratedData('user', user);

        return user;
    }

    /**
     * Generate multiple users
     * @param {number} count - Number of users to generate
     * @param {Object} options - Generation options
     * @returns {Array} Array of generated users
     */
    generateUsers(count = 10, options = {}) {
        const users = [];
        for (let i = 0; i < count; i++) {
            users.push(this.generateUser(options));
        }
        return users;
    }

    /**
     * Generate product data
     * @param {Object} options - Product generation options
     * @returns {Object} Generated product data
     */
    generateProduct(options = {}) {
        const {
            category = null,
            priceRange = null,
            includeImages = true,
            includeReviews = false
        } = options;

        const product = {
            id: faker.string.uuid(),
            name: faker.commerce.productName(),
            description: faker.commerce.productDescription(),
            category: category || faker.helpers.arrayElement(this.config.products.categories),
            price: faker.number.float({
                min: priceRange?.min || this.config.products.priceRange.min,
                max: priceRange?.max || this.config.products.priceRange.max,
                fractionDigits: 2
            }),
            sku: faker.string.alphanumeric(10).toUpperCase(),
            stock: faker.number.int({ min: 0, max: 1000 }),
            isActive: true,
            createdAt: faker.date.past().toISOString(),
            updatedAt: faker.date.recent().toISOString()
        };

        // Include images
        if (includeImages) {
            product.images = [
                faker.image.url({ width: 400, height: 400 }),
                faker.image.url({ width: 400, height: 400 }),
                faker.image.url({ width: 400, height: 400 })
            ];
        }

        // Include reviews
        if (includeReviews) {
            const reviewCount = faker.number.int({ min: 0, max: 20 });
            product.reviews = [];
            for (let i = 0; i < reviewCount; i++) {
                product.reviews.push({
                    id: faker.string.uuid(),
                    userId: faker.string.uuid(),
                    rating: faker.number.int({ min: 1, max: 5 }),
                    comment: faker.lorem.sentence(),
                    createdAt: faker.date.past().toISOString()
                });
            }
        }

        // Store generated data for cleanup
        this.storeGeneratedData('product', product);

        return product;
    }

    /**
     * Generate order data
     * @param {Object} options - Order generation options
     * @returns {Object} Generated order data
     */
    generateOrder(options = {}) {
        const {
            userId = null,
            productIds = null,
            status = 'pending',
            includeItems = true
        } = options;

        const order = {
            id: faker.string.uuid(),
            userId: userId || faker.string.uuid(),
            orderNumber: faker.string.alphanumeric(8).toUpperCase(),
            status: status,
            totalAmount: 0,
            currency: 'USD',
            createdAt: faker.date.past().toISOString(),
            updatedAt: faker.date.recent().toISOString(),
            shippingAddress: {
                street: faker.location.streetAddress(),
                city: faker.location.city(),
                state: faker.location.state(),
                zipCode: faker.location.zipCode(),
                country: faker.location.country()
            }
        };

        // Generate order items
        if (includeItems) {
            const itemCount = faker.number.int({ min: 1, max: 5 });
            order.items = [];
            
            for (let i = 0; i < itemCount; i++) {
                const productId = productIds ? faker.helpers.arrayElement(productIds) : faker.string.uuid();
                const quantity = faker.number.int({ min: 1, max: 5 });
                const price = faker.number.float({ min: 10, max: 500, fractionDigits: 2 });
                
                order.items.push({
                    id: faker.string.uuid(),
                    productId: productId,
                    quantity: quantity,
                    price: price,
                    total: quantity * price
                });
                
                order.totalAmount += quantity * price;
            }
        }

        // Store generated data for cleanup
        this.storeGeneratedData('order', order);

        return order;
    }

    /**
     * Generate API test data
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Generation options
     * @returns {Object} Generated API data
     */
    generateApiData(endpoint, options = {}) {
        const {
            method = 'POST',
            includeHeaders = true,
            includeAuth = false
        } = options;

        const apiData = {
            endpoint: endpoint,
            method: method,
            headers: includeHeaders ? {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Test-Automation/1.0'
            } : {},
            data: this.generateDataForEndpoint(endpoint)
        };

        // Include authentication
        if (includeAuth) {
            apiData.headers['Authorization'] = `Bearer ${faker.string.alphanumeric(32)}`;
        }

        // Store generated data for cleanup
        this.storeGeneratedData('api', apiData);

        return apiData;
    }

    /**
     * Generate data for specific API endpoint
     * @param {string} endpoint - API endpoint
     * @returns {Object} Generated data
     */
    generateDataForEndpoint(endpoint) {
        if (endpoint.includes('/users')) {
            return this.generateUser({ includeProfile: true });
        } else if (endpoint.includes('/products')) {
            return this.generateProduct({ includeImages: true });
        } else if (endpoint.includes('/orders')) {
            return this.generateOrder({ includeItems: true });
        } else {
            // Generic data generation
            return {
                id: faker.string.uuid(),
                name: faker.lorem.word(),
                value: faker.lorem.sentence(),
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Load test data from file
     * @param {string} filename - File name
     * @param {string} category - Data category
     * @returns {Object} Loaded data
     */
    loadTestData(filename, category = 'fixtures') {
        const filePath = path.join(this.dataDir, category, `${filename}.json`);
        
        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }
        
        throw new Error(`Test data file not found: ${filePath}`);
    }

    /**
     * Save test data to file
     * @param {string} filename - File name
     * @param {Object} data - Data to save
     * @param {string} category - Data category
     */
    saveTestData(filename, data, category = 'fixtures') {
        const filePath = path.join(this.dataDir, category, `${filename}.json`);
        const dir = path.dirname(filePath);
        
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    }

    /**
     * Store generated data for cleanup
     * @param {string} type - Data type
     * @param {Object} data - Data to store
     */
    storeGeneratedData(type, data) {
        if (!this.generatedData.has(type)) {
            this.generatedData.set(type, []);
        }
        this.generatedData.get(type).push(data);
    }

    /**
     * Get generated data by type
     * @param {string} type - Data type
     * @returns {Array} Generated data
     */
    getGeneratedData(type) {
        return this.generatedData.get(type) || [];
    }

    /**
     * Clear generated data
     * @param {string} type - Data type to clear (optional)
     */
    clearGeneratedData(type = null) {
        if (type) {
            this.generatedData.delete(type);
        } else {
            this.generatedData.clear();
        }
    }

    /**
     * Register cleanup hook
     * @param {Function} hook - Cleanup function
     */
    registerCleanupHook(hook) {
        this.cleanupHooks.push(hook);
    }

    /**
     * Execute cleanup hooks
     */
    async executeCleanupHooks() {
        for (const hook of this.cleanupHooks) {
            try {
                await hook();
            } catch (error) {
                console.error('Cleanup hook failed:', error.message);
            }
        }
    }

    /**
     * Cleanup generated data
     * @param {string} strategy - Cleanup strategy
     */
    async cleanup(strategy = 'auto') {
        const cleanupStrategy = strategy === 'auto' ? this.cleanupStrategy : strategy;
        
        switch (cleanupStrategy) {
            case 'database':
                await this.cleanupDatabase();
                break;
            case 'api':
                await this.cleanupApi();
                break;
            case 'file':
                await this.cleanupFiles();
                break;
            case 'all':
                await this.cleanupDatabase();
                await this.cleanupApi();
                await this.cleanupFiles();
                break;
        }
        
        // Execute custom cleanup hooks
        await this.executeCleanupHooks();
        
        // Clear generated data from memory
        this.clearGeneratedData();
    }

    /**
     * Cleanup database data
     */
    async cleanupDatabase() {
        // This would typically connect to a database and clean up test data
        console.log('Cleaning up database data...');
        // Implementation depends on your database setup
    }

    /**
     * Cleanup API data
     */
    async cleanupApi() {
        // This would typically make API calls to clean up test data
        console.log('Cleaning up API data...');
        // Implementation depends on your API setup
    }

    /**
     * Cleanup file data
     */
    async cleanupFiles() {
        // Clean up temporary files
        const tempDir = path.join(this.dataDir, 'temp');
        if (fs.existsSync(tempDir)) {
            const files = fs.readdirSync(tempDir);
            files.forEach(file => {
                fs.unlinkSync(path.join(tempDir, file));
            });
        }
        console.log('Cleaned up temporary files');
    }

    /**
     * Generate test scenario data
     * @param {string} scenario - Test scenario name
     * @param {Object} options - Generation options
     * @returns {Object} Scenario data
     */
    generateScenarioData(scenario, _options = {}) {
        const scenarios = {
            'user_registration': () => ({
                user: this.generateUser({ includeProfile: true, includePreferences: true }),
                expectedResult: 'success'
            }),
            'product_purchase': () => ({
                user: this.generateUser(),
                product: this.generateProduct(),
                order: this.generateOrder(),
                expectedResult: 'success'
            }),
            'api_authentication': () => ({
                credentials: {
                    username: faker.internet.userName(),
                    password: faker.internet.password()
                },
                expectedResult: 'success'
            }),
            'data_validation': () => ({
                validData: this.generateUser(),
                invalidData: {
                    email: 'invalid-email',
                    password: '123'
                },
                expectedResult: 'validation_error'
            })
        };

        const generator = scenarios[scenario];
        if (!generator) {
            throw new Error(`Unknown test scenario: ${scenario}`);
        }

        return generator();
    }

    /**
     * Validate test data
     * @param {Object} data - Data to validate
     * @param {Object} schema - Validation schema
     * @returns {Object} Validation result
     */
    validateData(data, schema) {
        const errors = [];
        
        for (const [field, rules] of Object.entries(schema)) {
            const value = data[field];
            
            if (rules.required && (value === undefined || value === null || value === '')) {
                errors.push(`${field} is required`);
            }
            
            if (value !== undefined && value !== null && value !== '') {
                if (rules.type && typeof value !== rules.type) {
                    errors.push(`${field} must be of type ${rules.type}`);
                }
                
                if (rules.minLength && value.length < rules.minLength) {
                    errors.push(`${field} must be at least ${rules.minLength} characters`);
                }
                
                if (rules.maxLength && value.length > rules.maxLength) {
                    errors.push(`${field} must be at most ${rules.maxLength} characters`);
                }
                
                if (rules.pattern && !rules.pattern.test(value)) {
                    errors.push(`${field} does not match required pattern`);
                }
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Get data statistics
     * @returns {Object} Data statistics
     */
    getDataStatistics() {
        const stats = {
            totalGenerated: 0,
            byType: {},
            environment: this.environment,
            dataDirectory: this.dataDir
        };
        
        for (const [type, data] of this.generatedData.entries()) {
            stats.byType[type] = data.length;
            stats.totalGenerated += data.length;
        }
        
        return stats;
    }
}

module.exports = { TestDataManager };
