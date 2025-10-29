/**
 * Global Teardown
 * Runs once after all tests complete
 */
async function globalTeardown(_config) {
  console.log('🧹 Starting global teardown...');
  
  // Clean up temporary files
  const fs = require('fs');
  const path = require('path');
  
  const tempFiles = [
    'test-data.json',
    'temp-*.json',
    '*.tmp'
  ];
  
  tempFiles.forEach(pattern => {
    const files = fs.readdirSync(process.cwd())
      .filter(file => file.match(pattern.replace('*', '.*')));
    
    files.forEach(file => {
      try {
        fs.unlinkSync(path.join(process.cwd(), file));
        console.log(`🗑️  Removed temporary file: ${file}`);
      } catch (error) {
        console.warn(`⚠️  Could not remove file ${file}: ${error.message}`);
      }
    });
  });
  
  // Generate test summary
  const testResultsPath = path.join(process.cwd(), 'test-results.json');
  if (fs.existsSync(testResultsPath)) {
    try {
      const testResults = JSON.parse(fs.readFileSync(testResultsPath, 'utf8'));
      
      const summary = {
        totalTests: testResults.stats?.total || 0,
        passedTests: testResults.stats?.passed || 0,
        failedTests: testResults.stats?.failed || 0,
        skippedTests: testResults.stats?.skipped || 0,
        duration: testResults.stats?.duration || 0,
        timestamp: new Date().toISOString()
      };
      
      console.log('📊 Test Summary:');
      console.log(`   Total Tests: ${summary.totalTests}`);
      console.log(`   Passed: ${summary.passedTests}`);
      console.log(`   Failed: ${summary.failedTests}`);
      console.log(`   Skipped: ${summary.skippedTests}`);
      console.log(`   Duration: ${(summary.duration / 1000).toFixed(2)}s`);
      
      // Save summary
      fs.writeFileSync(
        path.join(process.cwd(), 'test-summary.json'),
        JSON.stringify(summary, null, 2)
      );
      
    } catch (error) {
      console.warn('⚠️  Could not generate test summary:', error.message);
    }
  }
  
  console.log('✅ Global teardown completed');
}

module.exports = globalTeardown;
