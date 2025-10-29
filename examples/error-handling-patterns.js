const { expect } = require('@playwright/test');

/**
 * COMPREHENSIVE ERROR HANDLING PATTERNS FOR PLAYWRIGHT AUTOMATION
 * 
 * This file demonstrates various error handling patterns you should use
 * in your test automation for better debugging, logging, and maintenance.
 */

class ErrorHandlingExamples {

    constructor(page) {
        this.page = page;
    }

    // ==========================================
    // PATTERN 1: BASIC TRY-CATCH WITH LOGGING
    // ==========================================
    
    async basicTryCatchExample(elementSelector) {
        try {
            console.log(`Attempting to click element: ${elementSelector}`);
            await this.page.click(elementSelector);
            console.log(`Successfully clicked: ${elementSelector}`);
        } catch (error) {
            console.error(`Failed to click ${elementSelector}: ${error.message}`);
            throw error; // Re-throw to maintain error chain
        }
    }

    // ==========================================
    // PATTERN 2: TRY-CATCH WITH RETRY LOGIC
    // ==========================================
    
    async retryWithTryCatch(elementSelector, maxRetries = 3) {
        let lastError;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`Attempt ${attempt}/${maxRetries} to click: ${elementSelector}`);
                await this.page.click(elementSelector);
                console.log(`Successfully clicked on attempt ${attempt}`);
                return; // Success, exit retry loop
            } catch (error) {
                lastError = error;
                console.warn(`Attempt ${attempt} failed: ${error.message}`);
                
                if (attempt < maxRetries) {
                    console.log(`Waiting 1 second before retry...`);
                    await this.page.waitForTimeout(1000);
                }
            }
        }
        
        // All retries failed
        console.error(`All ${maxRetries} attempts failed for ${elementSelector}`);
        throw new Error(`Failed to click ${elementSelector} after ${maxRetries} attempts. Last error: ${lastError.message}`);
    }

    // ==========================================
    // PATTERN 3: TRY-CATCH WITH FALLBACK METHODS
    // ==========================================
    
    async fallbackMethodExample(surveyName) {
        try {
            // Try primary method
            console.log(`Trying primary selection method for: ${surveyName}`);
            return await this.selectSurveyFromList(surveyName);
        } catch (primaryError) {
            console.warn(`Primary method failed: ${primaryError.message}`);
            
            try {
                // Try fallback method
                console.log(`Trying fallback search method for: ${surveyName}`);
                return await this.selectSurveyFromSearch(surveyName);
            } catch (fallbackError) {
                console.error(`Both methods failed for: ${surveyName}`);
                console.error(`Primary error: ${primaryError.message}`);
                console.error(`Fallback error: ${fallbackError.message}`);
                throw new Error(`All selection methods failed for "${surveyName}". Primary: ${primaryError.message}, Fallback: ${fallbackError.message}`);
            }
        }
    }

    // ==========================================
    // PATTERN 4: TRY-CATCH WITH SPECIFIC ERROR HANDLING
    // ==========================================
    
    async specificErrorHandling(elementSelector) {
        try {
            await this.page.click(elementSelector);
        } catch (error) {
            // Handle different types of errors specifically
            if (error.message.includes('timeout')) {
                console.error(`Timeout error for ${elementSelector}: Element not found within timeout`);
                throw new Error(`Element ${elementSelector} not found - timeout exceeded`);
            } else if (error.message.includes('not visible')) {
                console.error(`Visibility error for ${elementSelector}: Element not visible`);
                throw new Error(`Element ${elementSelector} is not visible`);
            } else if (error.message.includes('not attached')) {
                console.error(`Attachment error for ${elementSelector}: Element not attached to DOM`);
                throw new Error(`Element ${elementSelector} is not attached to DOM`);
            } else {
                console.error(`Unexpected error for ${elementSelector}: ${error.message}`);
                throw new Error(`Unexpected error with ${elementSelector}: ${error.message}`);
            }
        }
    }

    // ==========================================
    // PATTERN 5: TRY-CATCH WITH CLEANUP
    // ==========================================
    
    async tryCatchWithCleanup() {
        let modalClosed = false;
        
        try {
            console.log("Opening modal");
            await this.page.click('#open-modal');
            
            console.log("Performing action in modal");
            await this.page.click('#modal-action');
            
            console.log("Closing modal");
            await this.page.click('#close-modal');
            modalClosed = true;
            
        } catch (error) {
            console.error(`Error in modal operation: ${error.message}`);
            
            // Cleanup: Ensure modal is closed even if error occurs
            if (!modalClosed) {
                try {
                    console.log("Attempting to close modal after error");
                    await this.page.click('#close-modal');
                } catch (cleanupError) {
                    console.warn(`Failed to close modal during cleanup: ${cleanupError.message}`);
                }
            }
            
            throw error; // Re-throw original error
        }
    }

    // ==========================================
    // PATTERN 6: TRY-CATCH WITH VALIDATION
    // ==========================================
    
    async tryCatchWithValidation(surveyName) {
        try {
            // Input validation
            if (!surveyName || surveyName.trim() === '') {
                throw new Error("Survey name cannot be empty");
            }
            
            console.log(`Validating survey selection for: ${surveyName}`);
            
            // Perform action
            await this.selectSurvey(surveyName);
            
            // Post-action validation
            await this.validateSurveySelection(surveyName);
            
            console.log(`Survey selection completed successfully for: ${surveyName}`);
            
        } catch (error) {
            console.error(`Survey selection failed for "${surveyName}": ${error.message}`);
            
            // Log additional context
            console.error(`Current URL: ${this.page.url()}`);
            console.error(`Page title: ${await this.page.title()}`);
            
            throw error;
        }
    }

    // ==========================================
    // PATTERN 7: NESTED TRY-CATCH
    // ==========================================
    
    async nestedTryCatchExample() {
        try {
            console.log("Starting complex operation");
            
            try {
                console.log("Step 1: Opening survey modal");
                await this.page.click('#survey-button');
            } catch (error) {
                console.error("Step 1 failed: Could not open survey modal");
                throw new Error(`Failed to open survey modal: ${error.message}`);
            }
            
            try {
                console.log("Step 2: Selecting survey");
                await this.selectSurvey('Test Survey');
            } catch (error) {
                console.error("Step 2 failed: Could not select survey");
                // Try to close modal before failing
                try {
                    await this.page.click('#close-modal');
                } catch (closeError) {
                    console.warn(`Failed to close modal: ${closeError.message}`);
                }
                throw new Error(`Failed to select survey: ${error.message}`);
            }
            
            try {
                console.log("Step 3: Submitting selection");
                await this.page.click('#submit-button');
            } catch (error) {
                console.error("Step 3 failed: Could not submit selection");
                throw new Error(`Failed to submit selection: ${error.message}`);
            }
            
            console.log("Complex operation completed successfully");
            
        } catch (error) {
            console.error(`Complex operation failed: ${error.message}`);
            throw error;
        }
    }

    // ==========================================
    // PATTERN 8: TRY-CATCH WITH CUSTOM ERROR TYPES
    // ==========================================
    
    async customErrorHandling(surveyName) {
        try {
            await this.selectSurvey(surveyName);
        } catch (error) {
            // Create custom error with more context
            const customError = new Error(`Survey selection failed for "${surveyName}"`);
            customError.originalError = error;
            customError.surveyName = surveyName;
            customError.timestamp = new Date().toISOString();
            customError.pageUrl = this.page.url();
            
            console.error(`Custom error details:`, {
                message: customError.message,
                surveyName: customError.surveyName,
                timestamp: customError.timestamp,
                pageUrl: customError.pageUrl,
                originalError: customError.originalError.message
            });
            
            throw customError;
        }
    }

    // ==========================================
    // HELPER METHODS (for examples above)
    // ==========================================
    
    async selectSurveyFromList(surveyName) {
        // Simulate list selection
        throw new Error("List method not implemented");
    }
    
    async selectSurveyFromSearch(surveyName) {
        // Simulate search selection
        throw new Error("Search method not implemented");
    }
    
    async selectSurvey(surveyName) {
        // Simulate survey selection
        console.log(`Selecting survey: ${surveyName}`);
    }
    
    async validateSurveySelection(surveyName) {
        // Simulate validation
        console.log(`Validating selection for: ${surveyName}`);
    }
}

module.exports = { ErrorHandlingExamples };
