const playwrightTest = require('@playwright/test');
const baseTest = playwrightTest.test;
const { TestDataManager } = require('../utils/testDataManager');

/**
 * Data-Driven Testing Fixtures
 * Provides fixtures for data-driven testing patterns
 */
const dataDrivenTest = baseTest.extend({
    testDataManager: async ({}, use) => {
        const dataManager = new TestDataManager({
            dataDir: 'test-data',
            cleanupStrategy: 'auto',
            environment: process.env.NODE_ENV || 'test'
        });
        
        await use(dataManager);
        
        // Cleanup after test
        await dataManager.cleanup();
    },
    
    testUser: async ({ testDataManager }, use) => {
        const user = testDataManager.generateUser({
            includeProfile: true,
            includePreferences: true
        });
        await use(user);
    },
    
    testProduct: async ({ testDataManager }, use) => {
        const product = testDataManager.generateProduct({
            includeImages: true,
            includeReviews: true
        });
        await use(product);
    },
    
    testOrder: async ({ testDataManager, testUser, testProduct }, use) => {
        const order = testDataManager.generateOrder({
            userId: testUser.id,
            productIds: [testProduct.id],
            includeItems: true
        });
        await use(order);
    }
});

/**
 * CSV Data-Driven Testing
 * Loads test data from CSV files
 */
const csvTest = baseTest.extend({
    csvData: async ({}, use) => {
        const csvData = await loadCsvData('test-data/csv/test-cases.csv');
        await use(csvData);
    }
});

/**
 * JSON Data-Driven Testing
 * Loads test data from JSON files
 */
const jsonTest = baseTest.extend({
    jsonData: async ({}, use) => {
        const jsonData = await loadJsonData('test-data/json/test-scenarios.json');
        await use(jsonData);
    }
});

/**
 * Load CSV data
 * @param {string} filePath - Path to CSV file
 * @returns {Array} Parsed CSV data
 */
async function loadCsvData(filePath) {
    const fs = require('fs');
    const csv = require('csv-parser');
    
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', reject);
    });
}

/**
 * Load JSON data
 * @param {string} filePath - Path to JSON file
 * @returns {Object} Parsed JSON data
 */
async function loadJsonData(filePath) {
    const fs = require('fs');
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

module.exports = { 
    dataDrivenTest, 
    csvTest, 
    jsonTest,
    loadCsvData,
    loadJsonData
};
