/**
 * Global Setup
 * Runs once before all tests
 */
async function globalSetup(_config) {
  console.log('🚀 Starting global setup...');
  
  // Set up test environment
  process.env.NODE_ENV = 'test';
  
  // Create necessary directories
  const fs = require('fs');
  const path = require('path');
  
  const directories = [
    'test-results',
    'screenshots',
    'downloads',
    'reports'
  ];
  
  directories.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  });
  
  // Set up test data
  const { TestDataGenerator } = require('./testDataGenerator');
  const dataGenerator = new TestDataGenerator();
  
  // Generate sample test data
  const sampleData = {
    users: [
      dataGenerator.generateUserData({ role: 'admin' }),
      dataGenerator.generateUserData({ role: 'user' }),
      dataGenerator.generateUserData({ role: 'guest' })
    ],
    forms: [
      dataGenerator.generateFormData({ type: 'contact' }),
      dataGenerator.generateFormData({ type: 'registration' }),
      dataGenerator.generateFormData({ type: 'feedback' })
    ]
  };
  
  // Save test data to file
  fs.writeFileSync(
    path.join(process.cwd(), 'test-data.json'),
    JSON.stringify(sampleData, null, 2)
  );
  
  console.log('✅ Global setup completed');
  console.log(`📊 Generated test data for ${sampleData.users.length} users and ${sampleData.forms.length} forms`);
}

module.exports = globalSetup;
