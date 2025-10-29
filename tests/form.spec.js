const { test, expect } = require('@playwright/test');
const { FormPage } = require('../pages/form.page');
const { LoginPage } = require('../pages/login.page');
const { EnvConfig } = require('../utils/envConfig');

/**
 * Form Test Suite
 * Demonstrates form handling, validation, data submission, and user interactions
 */
test.describe('Form Functionality', () => {
    let formPage;
    let loginPage;
    let envConfig;

    test.beforeEach(async ({ page }) => {
        formPage = new FormPage(page);
        loginPage = new LoginPage(page);
        envConfig = new EnvConfig();
        
        // Login before each test using encrypted credentials
        await loginPage.navigateToLogin('https://example.com');
        const userCredentials = envConfig.getCredentials('user');
        await loginPage.login(userCredentials.username, userCredentials.password);
    });

    test('should display contact form elements', async () => {
        // Navigate to contact form
        await formPage.navigateToForm('https://example.com', '/contact');
        
        // Verify form is visible
        await expect(formPage.form).toBeVisible();
        await expect(formPage.submitButton).toBeVisible();
    });

    test('should fill and submit contact form successfully', async () => {
        await formPage.navigateToForm('https://example.com', '/contact');
        
        // Test data
        const formData = {
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+1234567890',
            subject: 'Test Inquiry',
            message: 'This is a test message for the contact form.',
            agreeToTerms: true
        };

        // Fill form
        await formPage.fillForm(formData);
        
        // Submit form
        await formPage.submitForm();
        
        // Verify success message
        await formPage.expectVisible(formPage.successMessage);
    });

    test('should validate required fields', async () => {
        await formPage.navigateToForm('https://example.com', '/contact');
        
        // Define validation rules
        const validationRules = {
            name: { required: true, minLength: 2 },
            email: { required: true, email: true },
            message: { required: true, minLength: 10 }
        };

        // Test validation
        await formPage.validateForm(validationRules);
    });

    test('should handle form validation errors', async () => {
        await formPage.navigateToForm('https://example.com', '/contact');
        
        // Test invalid email
        await formPage.fillEmailInput('email', 'invalid-email');
        await formPage.click(formPage.submitButton);
        await formPage.expectVisible(formPage.errorMessages);
        
        // Test short message
        await formPage.fillTextarea('message', 'Hi');
        await formPage.click(formPage.submitButton);
        await formPage.expectVisible(formPage.errorMessages);
    });

    test('should test different input types', async () => {
        await formPage.navigateToForm('https://example.com', '/register');
        
        // Test various input types
        const userCredentials = envConfig.getCredentials('user');
        await formPage.fillTextInput('firstName', 'John');
        await formPage.fillEmailInput('email', 'john@example.com');
        await formPage.fillPasswordInput('password', userCredentials.password);
        await formPage.fillNumberInput('age', 25);
        await formPage.fillDateInput('birthDate', '1998-01-01');
        await formPage.fillTextarea('bio', 'This is my bio');
        await formPage.selectDropdownOption('country', 'United States');
        await formPage.setCheckbox('agreeToTerms', true);
        await formPage.selectRadioButton('gender', 'male');
    });

    test('should handle file upload', async () => {
        await formPage.navigateToForm('https://example.com', '/upload');
        
        // Test file upload (create a test file first)
        const testFilePath = 'test-files/sample.txt';
        await formPage.uploadFile('resume', testFilePath);
        
        // Submit form
        await formPage.submitForm();
    });

    test('should test form reset functionality', async () => {
        await formPage.navigateToForm('https://example.com', '/contact');
        
        // Fill form
        await formPage.fillTextInput('name', 'John Doe');
        await formPage.fillEmailInput('email', 'john@example.com');
        
        // Reset form
        await formPage.resetForm();
        
        // Verify fields are cleared
        const formData = await formPage.getFormData();
        expect(formData.name).toBe('');
        expect(formData.email).toBe('');
    });

    test('should test form cancellation', async () => {
        await formPage.navigateToForm('https://example.com', '/contact');
        
        // Fill form
        await formPage.fillTextInput('name', 'John Doe');
        
        // Cancel form
        await formPage.cancelForm();
        
        // Verify redirect or form closure
        await expect(formPage.page).toHaveURL(/dashboard|home/);
    });

    test('should handle form submission with loading states', async () => {
        await formPage.navigateToForm('https://example.com', '/contact');
        
        // Fill form
        await formPage.fillForm({
            name: 'John Doe',
            email: 'john@example.com',
            message: 'Test message'
        });
        
        // Submit and wait for loading
        await formPage.submitForm({ waitForRedirect: false });
        await formPage.waitForFormSubmission();
    });

    test('should test form accessibility', async () => {
        await formPage.navigateToForm('https://example.com', '/contact');
        
        // Test accessibility features
        await formPage.testAccessibility();
    });

    test('should handle dynamic form fields', async () => {
        await formPage.navigateToForm('https://example.com', '/dynamic-form');
        
        // Test adding dynamic fields
        const addFieldButton = formPage.page.locator('button:has-text("Add Field")');
        if (await formPage.isVisible(addFieldButton)) {
            await formPage.click(addFieldButton);
            
            // Fill new field
            await formPage.fillTextInput('dynamicField1', 'Dynamic Value');
        }
    });

    test('should test form with conditional fields', async () => {
        await formPage.navigateToForm('https://example.com', '/conditional-form');
        
        // Test conditional field display
        await formPage.selectRadioButton('userType', 'business');
        
        // Check if business-specific fields appear
        const businessField = formPage.page.locator('input[name="companyName"]');
        if (await formPage.isVisible(businessField)) {
            await formPage.fillTextInput('companyName', 'Test Company');
        }
    });

    test('should handle form with multiple steps', async () => {
        await formPage.navigateToForm('https://example.com', '/multi-step-form');
        
        // Step 1
        await formPage.fillTextInput('firstName', 'John');
        await formPage.fillTextInput('lastName', 'Doe');
        await formPage.click(formPage.page.locator('button:has-text("Next")'));
        
        // Step 2
        const userCredentials = envConfig.getCredentials('user');
        await formPage.fillEmailInput('email', 'john@example.com');
        await formPage.fillPasswordInput('password', userCredentials.password);
        await formPage.click(formPage.page.locator('button:has-text("Next")'));
        
        // Step 3 - Final submission
        await formPage.fillTextarea('bio', 'This is my bio');
        await formPage.submitForm();
    });

    test('should test form validation with custom patterns', async () => {
        await formPage.navigateToForm('https://example.com', '/register');
        
        // Test phone number pattern
        await formPage.fillTextInput('phone', '123-456-7890');
        await formPage.click(formPage.submitButton);
        
        // Should validate phone format
        const phoneField = formPage.getFieldLocator('phone');
        await formPage.expectValue(phoneField, '123-456-7890');
    });

    test('should handle form with dependent dropdowns', async () => {
        await formPage.navigateToForm('https://example.com', '/dependent-form');
        
        // Select country first
        await formPage.selectDropdownOption('country', 'United States');
        
        // Wait for state dropdown to populate
        await formPage.wait(1000);
        
        // Select state
        await formPage.selectDropdownOption('state', 'California');
    });

    test('should test form with rich text editor', async () => {
        await formPage.navigateToForm('https://example.com', '/rich-text-form');
        
        // Test rich text editor
        const richTextEditor = formPage.page.locator('.rich-text-editor, [data-testid="rich-text"]');
        if (await formPage.isVisible(richTextEditor)) {
            await formPage.click(richTextEditor);
            await formPage.type(richTextEditor, 'This is rich text content');
        }
    });

    test('should handle form with date range picker', async () => {
        await formPage.navigateToForm('https://example.com', '/date-range-form');
        
        // Test date range selection
        await formPage.fillDateInput('startDate', '2024-01-01');
        await formPage.fillDateInput('endDate', '2024-12-31');
    });

    test('should test form with autocomplete fields', async () => {
        await formPage.navigateToForm('https://example.com', '/autocomplete-form');
        
        // Test autocomplete
        const autocompleteField = formPage.page.locator('input[data-autocomplete]');
        if (await formPage.isVisible(autocompleteField)) {
            await formPage.type(autocompleteField, 'New York');
            
            // Wait for suggestions
            await formPage.wait(1000);
            
            // Select suggestion
            const suggestion = formPage.page.locator('.autocomplete-suggestion').first();
            if (await formPage.isVisible(suggestion)) {
                await formPage.click(suggestion);
            }
        }
    });

    test('should handle form with drag and drop file upload', async () => {
        await formPage.navigateToForm('https://example.com', '/drag-drop-form');
        
        // Test drag and drop file upload
        const dropZone = formPage.page.locator('.drop-zone, [data-testid="drop-zone"]');
        if (await formPage.isVisible(dropZone)) {
            // Simulate file drop
            await dropZone.dispatchEvent('drop', {
                dataTransfer: new DataTransfer()
            });
        }
    });

    test('should test form with real-time validation', async () => {
        await formPage.navigateToForm('https://example.com', '/real-time-form');
        
        // Test real-time email validation
        await formPage.fillEmailInput('email', 'invalid');
        
        // Should show validation error immediately
        await formPage.wait(500);
        const hasError = await formPage.isVisible(formPage.errorMessages);
        expect(hasError).toBe(true);
        
        // Fix email
        await formPage.fillEmailInput('email', 'valid@example.com');
        
        // Error should disappear
        await formPage.wait(500);
        const hasErrorAfterFix = await formPage.isVisible(formPage.errorMessages);
        expect(hasErrorAfterFix).toBe(false);
    });

    test('should handle form submission with confirmation modal', async () => {
        await formPage.navigateToForm('https://example.com', '/confirmation-form');
        
        // Fill form
        await formPage.fillForm({
            name: 'John Doe',
            email: 'john@example.com',
            message: 'Test message'
        });
        
        // Submit form
        await formPage.click(formPage.submitButton);
        
        // Handle confirmation modal
        const confirmModal = formPage.page.locator('.confirmation-modal, [data-testid="confirm-modal"]');
        if (await formPage.isVisible(confirmModal)) {
            await formPage.click(formPage.page.locator('button:has-text("Confirm")'));
        }
    });

    test('should test form with progress indicator', async () => {
        await formPage.navigateToForm('https://example.com', '/progress-form');
        
        // Check if progress indicator is visible
        const progressBar = formPage.page.locator('.progress-bar, [data-testid="progress"]');
        if (await formPage.isVisible(progressBar)) {
            // Fill form step by step and verify progress
            await formPage.fillTextInput('step1', 'Value 1');
            await formPage.click(formPage.page.locator('button:has-text("Next")'));
            
            // Progress should update
            await formPage.wait(500);
        }
    });
});
