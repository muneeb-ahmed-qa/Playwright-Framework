// @ts-check
/**
 * Example demonstrating tab switching functionality in CommonHelper
 */

const { CommonHelper } = require('../utils/commonHelper.js');

class TabSwitchingExample {
    constructor(page) {
        this.page = page;
        this.commonHelper = new CommonHelper(page);
    }

    /**
     * Example workflow showing tab switching
     */
    async demonstrateTabSwitching() {
        // Step 1: Work on original tab
        console.log('📋 Working on original tab');
        const pageObjects = this.commonHelper.getPageObjects();
        
        // Step 2: Extract email link and switch to new tab
        const email = { /* email object */ };
        const newPage = await this.commonHelper.extractAndNavigateToLink(email, 'Verify');
        console.log('✅ Switched to new tab for app workflow');
        
        // Step 3: Work on the new tab (app pages)
        // ... perform app-specific operations ...
        
        // Step 4: Switch back to original tab for TCU operations
        await this.commonHelper.switchToOriginalTab();
        console.log('✅ Switched back to original tab');
        
        // Step 5: Capture TCU values on original tab
        const initialTCU = await this.commonHelper.captureInitialTCUValues(this.page, pageObjects);
        
        // Step 6: Switch back to new tab for more app operations
        await this.commonHelper.switchToTab(newPage);
        console.log('✅ Switched back to new tab');
        
        // Step 7: Continue app workflow
        // ... more app operations ...
        
        // Step 8: Final TCU capture on original tab
        await this.commonHelper.switchToOriginalTab();
        const finalTCU = await this.commonHelper.captureFinalTCUValues(this.page, pageObjects);
        
        // Step 9: Validate TCU consumption
        await this.commonHelper.validateTCUConsumptionWithReporting(initialTCU, finalTCU, 'Exit', false);
    }

    /**
     * Manual tab switching methods
     */
    async manualTabSwitching() {
        // Switch to original tab
        await this.commonHelper.switchToOriginalTab();
        
        // Switch to a specific tab (if you have a reference)
        // await this.commonHelper.switchToTab(specificPage);
        
        // Get current page reference
        const currentPage = this.commonHelper.page;
        console.log('Current page:', currentPage);
    }
}

module.exports = { TabSwitchingExample };
