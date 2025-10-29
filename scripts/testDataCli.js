#!/usr/bin/env node

const { TestDataManager } = require('../utils/testDataManager');
const fs = require('fs');
const path = require('path');

/**
 * Test Data CLI Utility
 * Command-line interface for managing test data
 */
class TestDataCLI {
    constructor() {
        this.dataManager = new TestDataManager({
            dataDir: 'test-data',
            cleanupStrategy: 'auto'
        });
    }

    /**
     * Main CLI handler
     */
    async run() {
        const args = process.argv.slice(2);
        const command = args[0];

        try {
            switch (command) {
                case 'generate':
                    await this.generateData(args);
                    break;
                case 'cleanup':
                    await this.cleanupData(args);
                    break;
                case 'validate':
                    await this.validateData(args);
                    break;
                case 'export':
                    await this.exportData(args);
                    break;
                case 'import':
                    await this.importData(args);
                    break;
                case 'stats':
                    await this.showStats();
                    break;
                case 'help':
                default:
                    this.showHelp();
                    break;
            }
        } catch (error) {
            console.error('Error:', error.message);
            process.exit(1);
        }
    }

    /**
     * Generate test data
     */
    async generateData(args) {
        const type = args[1];
        const count = parseInt(args[2]) || 1;
        const options = this.parseOptions(args.slice(3));

        console.log(`Generating ${count} ${type}(s)...`);

        let data;
        switch (type) {
            case 'users':
                data = this.dataManager.generateUsers(count, options);
                break;
            case 'products':
                data = Array.from({ length: count }, () => 
                    this.dataManager.generateProduct(options)
                );
                break;
            case 'orders':
                data = Array.from({ length: count }, () => 
                    this.dataManager.generateOrder(options)
                );
                break;
            case 'api':
                const endpoint = args[2] || '/api/test';
                data = this.dataManager.generateApiData(endpoint, options);
                break;
            default:
                throw new Error(`Unknown data type: ${type}`);
        }

        // Save generated data
        const filename = `${type}-${Date.now()}`;
        this.dataManager.saveTestData(filename, data, 'generated');
        
        console.log(`✅ Generated ${Array.isArray(data) ? data.length : 1} ${type}(s)`);
        console.log(`📁 Saved to: test-data/generated/${filename}.json`);
    }

    /**
     * Cleanup test data
     */
    async cleanupData(args) {
        const strategy = args[1] || 'auto';
        
        console.log(`Cleaning up test data using strategy: ${strategy}`);
        
        await this.dataManager.cleanup(strategy);
        
        console.log('✅ Cleanup completed');
    }

    /**
     * Validate test data
     */
    async validateData(args) {
        const filename = args[1];
        const category = args[2] || 'fixtures';
        
        if (!filename) {
            throw new Error('Filename is required for validation');
        }

        console.log(`Validating test data: ${filename}`);

        const data = this.dataManager.loadTestData(filename, category);
        
        // Basic validation
        if (Array.isArray(data)) {
            console.log(`✅ Valid JSON array with ${data.length} items`);
        } else if (typeof data === 'object') {
            console.log('✅ Valid JSON object');
        } else {
            console.log('⚠️  Data is not a valid JSON object or array');
        }

        // Show data structure
        console.log('\n📊 Data structure:');
        console.log(JSON.stringify(data, null, 2).substring(0, 500) + '...');
    }

    /**
     * Export test data
     */
    async exportData(args) {
        const type = args[1];
        const format = args[2] || 'json';
        const filename = args[3] || `${type}-export-${Date.now()}`;

        console.log(`Exporting ${type} data as ${format}...`);

        const data = this.dataManager.getGeneratedData(type);
        
        if (format === 'json') {
            this.dataManager.saveTestData(filename, data, 'exports');
            console.log(`✅ Exported to: test-data/exports/${filename}.json`);
        } else if (format === 'csv') {
            await this.exportToCSV(data, filename);
            console.log(`✅ Exported to: test-data/exports/${filename}.csv`);
        } else {
            throw new Error(`Unsupported format: ${format}`);
        }
    }

    /**
     * Import test data
     */
    async importData(args) {
        const filepath = args[1];
        
        if (!filepath) {
            throw new Error('File path is required for import');
        }

        console.log(`Importing test data from: ${filepath}`);

        const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
        
        // Store imported data
        if (Array.isArray(data)) {
            data.forEach(item => {
                this.dataManager.storeGeneratedData('imported', item);
            });
            console.log(`✅ Imported ${data.length} items`);
        } else {
            this.dataManager.storeGeneratedData('imported', data);
            console.log('✅ Imported 1 item');
        }
    }

    /**
     * Show data statistics
     */
    async showStats() {
        const stats = this.dataManager.getDataStatistics();
        
        console.log('\n📊 Test Data Statistics');
        console.log('========================');
        console.log(`Environment: ${stats.environment}`);
        console.log(`Data Directory: ${stats.dataDirectory}`);
        console.log(`Total Generated: ${stats.totalGenerated}`);
        console.log('\nBy Type:');
        
        for (const [type, count] of Object.entries(stats.byType)) {
            console.log(`  ${type}: ${count}`);
        }
    }

    /**
     * Export data to CSV
     */
    async exportToCSV(data, filename) {
        if (!Array.isArray(data) || data.length === 0) {
            throw new Error('Data must be a non-empty array for CSV export');
        }

        const csv = require('csv-writer').createObjectCsvWriter({
            path: `test-data/exports/${filename}.csv`,
            header: Object.keys(data[0]).map(key => ({ id: key, title: key }))
        });

        await csv.writeRecords(data);
    }

    /**
     * Parse command line options
     */
    parseOptions(args) {
        const options = {};
        
        for (let i = 0; i < args.length; i += 2) {
            const key = args[i].replace('--', '');
            const value = args[i + 1];
            
            if (value === 'true') {
                options[key] = true;
            } else if (value === 'false') {
                options[key] = false;
            } else if (!isNaN(value)) {
                options[key] = parseFloat(value);
            } else {
                options[key] = value;
            }
        }
        
        return options;
    }

    /**
     * Show help information
     */
    showHelp() {
        console.log(`
🧪 Test Data Management CLI

Usage: node scripts/testDataCli.js <command> [options]

Commands:
  generate <type> [count] [options]  Generate test data
    Types: users, products, orders, api
    Options: --role, --domain, --includeProfile, etc.

  cleanup [strategy]                 Cleanup generated data
    Strategies: auto, database, api, file, all

  validate <filename> [category]     Validate test data file
    Categories: fixtures, generated, exports

  export <type> [format] [filename] Export generated data
    Formats: json, csv

  import <filepath>                  Import test data from file

  stats                             Show data statistics

  help                              Show this help message

Examples:
  node scripts/testDataCli.js generate users 10 --role admin --includeProfile
  node scripts/testDataCli.js generate products 5 --category electronics
  node scripts/testDataCli.js cleanup auto
  node scripts/testDataCli.js validate test-data.json fixtures
  node scripts/testDataCli.js export users csv users-export
  node scripts/testDataCli.js stats
        `);
    }
}

// Run CLI if called directly
if (require.main === module) {
    const cli = new TestDataCLI();
    cli.run();
}

module.exports = { TestDataCLI };
