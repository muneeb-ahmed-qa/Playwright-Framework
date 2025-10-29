const { test, expect } = require('@playwright/test');
const { TestDataManager } = require('../utils/testDataManager');
const { dataDrivenTest, csvTest, jsonTest } = require('../fixtures/dataDrivenFixture');

/**
 * Advanced Test Data Management Examples
 * Demonstrates various data-driven testing patterns and strategies
 */
test.describe('Test Data Management Examples', () => {
    let dataManager;

    test.beforeEach(async () => {
        dataManager = new TestDataManager({
            dataDir: 'test-data',
            cleanupStrategy: 'auto',
            environment: 'test'
        });
    });

    test.afterEach(async () => {
        await dataManager.cleanup();
    });

    test('should generate user data with all options', async () => {
        const user = dataManager.generateUser({
            role: 'admin',
            domain: 'example.com',
            encryptedPassword: true,
            includeProfile: true,
            includePreferences: true
        });

        // Validate user data
        expect(user.id).toBeDefined();
        expect(user.email).toContain('@example.com');
        expect(user.role).toBe('admin');
        expect(user.password).toBeDefined();
        expect(user.plainPassword).toBeDefined();
        expect(user.profile).toBeDefined();
        expect(user.preferences).toBeDefined();

        console.log('Generated user:', JSON.stringify(user, null, 2));
    });

    test('should generate multiple users with different roles', async () => {
        const users = dataManager.generateUsers(5, {
            role: 'user',
            includeProfile: true
        });

        expect(users).toHaveLength(5);
        users.forEach(user => {
            expect(user.role).toBe('user');
            expect(user.profile).toBeDefined();
        });

        console.log(`Generated ${users.length} users`);
    });

    test('should generate product data with reviews', async () => {
        const product = dataManager.generateProduct({
            category: 'electronics',
            priceRange: { min: 100, max: 500 },
            includeImages: true,
            includeReviews: true
        });

        expect(product.category).toBe('electronics');
        expect(product.price).toBeGreaterThanOrEqual(100);
        expect(product.price).toBeLessThanOrEqual(500);
        expect(product.images).toBeDefined();
        expect(product.reviews).toBeDefined();

        console.log('Generated product:', product.name, `$${product.price}`);
    });

    test('should generate order with items', async () => {
        const user = dataManager.generateUser();
        const products = dataManager.generateUsers(3).map(() => 
            dataManager.generateProduct()
        );
        
        const order = dataManager.generateOrder({
            userId: user.id,
            productIds: products.map(p => p.id),
            includeItems: true
        });

        expect(order.userId).toBe(user.id);
        expect(order.items).toBeDefined();
        expect(order.items.length).toBeGreaterThan(0);
        expect(order.totalAmount).toBeGreaterThan(0);

        console.log('Generated order:', order.orderNumber, `$${order.totalAmount}`);
    });

    test('should generate API test data', async () => {
        const apiData = dataManager.generateApiData('/api/users', {
            method: 'POST',
            includeHeaders: true,
            includeAuth: true
        });

        expect(apiData.endpoint).toBe('/api/users');
        expect(apiData.method).toBe('POST');
        expect(apiData.headers).toBeDefined();
        expect(apiData.headers.Authorization).toBeDefined();
        expect(apiData.data).toBeDefined();

        console.log('Generated API data:', apiData);
    });

    test('should save and load test data', async () => {
        const testData = {
            users: dataManager.generateUsers(3),
            products: [dataManager.generateProduct()],
            orders: [dataManager.generateOrder()]
        };

        // Save test data
        dataManager.saveTestData('test-suite-data', testData, 'fixtures');

        // Load test data
        const loadedData = dataManager.loadTestData('test-suite-data', 'fixtures');

        expect(loadedData.users).toHaveLength(3);
        expect(loadedData.products).toHaveLength(1);
        expect(loadedData.orders).toHaveLength(1);

        console.log('Saved and loaded test data successfully');
    });

    test('should generate scenario data', async () => {
        const scenarios = [
            'user_registration',
            'product_purchase',
            'api_authentication',
            'data_validation'
        ];

        for (const scenario of scenarios) {
            const scenarioData = dataManager.generateScenarioData(scenario);
            expect(scenarioData).toBeDefined();
            expect(scenarioData.expectedResult).toBeDefined();
            console.log(`Generated ${scenario} scenario data`);
        }
    });

    test('should validate test data', async () => {
        const user = dataManager.generateUser();
        
        const schema = {
            id: { required: true, type: 'string' },
            email: { required: true, type: 'string', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
            username: { required: true, type: 'string', minLength: 3 },
            role: { required: true, type: 'string' }
        };

        const validation = dataManager.validateData(user, schema);
        expect(validation.isValid).toBe(true);
        expect(validation.errors).toHaveLength(0);

        console.log('Data validation passed');
    });

    test('should track generated data statistics', async () => {
        // Generate some test data
        dataManager.generateUsers(5);
        dataManager.generateProduct();
        dataManager.generateOrder();

        const stats = dataManager.getDataStatistics();
        expect(stats.totalGenerated).toBeGreaterThan(0);
        expect(stats.byType.user).toBe(5);
        expect(stats.byType.product).toBe(1);
        expect(stats.byType.order).toBe(1);

        console.log('Data statistics:', stats);
    });
});

/**
 * Data-Driven Testing with Fixtures
 */
dataDrivenTest.describe('Data-Driven Testing with Fixtures', () => {
    
    dataDrivenTest('should test user registration with generated data', async ({ page, testUser }) => {
        // Use generated user data for registration test
        await page.goto('https://example.com/register');
        
        await page.fill('[name="firstName"]', testUser.firstName);
        await page.fill('[name="lastName"]', testUser.lastName);
        await page.fill('[name="email"]', testUser.email);
        await page.fill('[name="password"]', testUser.plainPassword);
        
        await page.click('[type="submit"]');
        
        // Verify registration success
        await expect(page.locator('.success-message')).toBeVisible();
        
        console.log(`Tested registration for user: ${testUser.email}`);
    });

    dataDrivenTest('should test product creation with generated data', async ({ page, testProduct }) => {
        // Use generated product data for product creation test
        await page.goto('https://example.com/admin/products/create');
        
        await page.fill('[name="name"]', testProduct.name);
        await page.fill('[name="description"]', testProduct.description);
        await page.fill('[name="price"]', testProduct.price.toString());
        await page.selectOption('[name="category"]', testProduct.category);
        
        await page.click('[type="submit"]');
        
        // Verify product creation success
        await expect(page.locator('.success-message')).toBeVisible();
        
        console.log(`Tested product creation: ${testProduct.name}`);
    });

    dataDrivenTest('should test order processing with generated data', async ({ page, testOrder }) => {
        // Use generated order data for order processing test
        await page.goto('https://example.com/orders');
        
        // Verify order exists
        await expect(page.locator(`[data-order-id="${testOrder.id}"]`)).toBeVisible();
        
        // Test order status update
        await page.click(`[data-order-id="${testOrder.id}"] .status-button`);
        await page.selectOption('.status-select', 'shipped');
        await page.click('.update-status');
        
        // Verify status update
        await expect(page.locator('.status-badge')).toContainText('shipped');
        
        console.log(`Tested order processing: ${testOrder.orderNumber}`);
    });
});

/**
 * CSV Data-Driven Testing
 */
csvTest.describe('CSV Data-Driven Testing', () => {
    
    csvTest('should test login with CSV data', async ({ page, csvData }) => {
        for (const testCase of csvData) {
            await page.goto('https://example.com/login');
            
            await page.fill('[name="username"]', testCase.username);
            await page.fill('[name="password"]', testCase.password);
            await page.click('[type="submit"]');
            
            if (testCase.expectedResult === 'success') {
                await expect(page.locator('.dashboard')).toBeVisible();
            } else {
                await expect(page.locator('.error-message')).toBeVisible();
            }
            
            console.log(`Tested login for: ${testCase.username} - ${testCase.expectedResult}`);
        }
    });
});

/**
 * JSON Data-Driven Testing
 */
jsonTest.describe('JSON Data-Driven Testing', () => {
    
    jsonTest('should test API endpoints with JSON data', async ({ page, jsonData }) => {
        for (const scenario of jsonData.scenarios) {
            console.log(`Testing scenario: ${scenario.name}`);
            
            // Navigate to API test page
            await page.goto('https://example.com/api-test');
            
            // Set endpoint
            await page.fill('[name="endpoint"]', scenario.endpoint);
            await page.selectOption('[name="method"]', scenario.method);
            
            // Set request data
            await page.fill('[name="requestBody"]', JSON.stringify(scenario.data));
            
            // Submit request
            await page.click('.submit-request');
            
            // Verify response
            await expect(page.locator('.response-status')).toContainText(scenario.expectedStatus);
            
            console.log(`Completed scenario: ${scenario.name}`);
        }
    });
});

/**
 * Performance Testing with Data Management
 */
test.describe('Performance Testing with Data Management', () => {
    
    test('should measure performance with large dataset', async ({ page }) => {
        const dataManager = new TestDataManager();
        
        // Generate large dataset
        const users = dataManager.generateUsers(100);
        const products = Array.from({ length: 50 }, () => dataManager.generateProduct());
        
        // Test page performance with large dataset
        await page.goto('https://example.com/dashboard');
        
        // Simulate loading large dataset
        await page.evaluate((data) => {
            window.testData = data;
        }, { users, products });
        
        // Measure performance
        const startTime = Date.now();
        await page.waitForSelector('.data-loaded');
        const endTime = Date.now();
        
        const loadTime = endTime - startTime;
        expect(loadTime).toBeLessThan(5000); // Should load in less than 5 seconds
        
        console.log(`Large dataset loaded in ${loadTime}ms`);
        
        await dataManager.cleanup();
    });
});

/**
 * Data Cleanup Testing
 */
test.describe('Data Cleanup Testing', () => {
    
    test('should cleanup generated data automatically', async () => {
        const dataManager = new TestDataManager({
            cleanupStrategy: 'auto'
        });
        
        // Generate test data
        dataManager.generateUsers(10);
        dataManager.generateProducts(5);
        
        // Register custom cleanup hook
        dataManager.registerCleanupHook(async () => {
            console.log('Custom cleanup hook executed');
        });
        
        // Verify data exists
        expect(dataManager.getGeneratedData('user')).toHaveLength(10);
        expect(dataManager.getGeneratedData('product')).toHaveLength(5);
        
        // Cleanup
        await dataManager.cleanup();
        
        // Verify data is cleaned up
        expect(dataManager.getGeneratedData('user')).toHaveLength(0);
        expect(dataManager.getGeneratedData('product')).toHaveLength(0);
        
        console.log('Data cleanup completed successfully');
    });
});
