const { BasePage } = require('./base.page');

/**
 * Generic Form Page Object Class
 * Demonstrates form handling, validation, and data submission
 */
class FormPage extends BasePage {
    constructor(page) {
        super(page);
        
        // Form elements
        this.form = page.locator('form, .form, [data-testid="form"]');
        this.submitButton = page.locator('button[type="submit"], .submit-button, [data-testid="submit"]');
        this.resetButton = page.locator('button[type="reset"], .reset-button, [data-testid="reset"]');
        this.cancelButton = page.locator('button:has-text("Cancel"), .cancel-button, [data-testid="cancel"]');
        
        // Input fields
        this.textInputs = page.locator('input[type="text"], input[type="email"], input[type="tel"], input[type="url"]');
        this.passwordInputs = page.locator('input[type="password"]');
        this.numberInputs = page.locator('input[type="number"]');
        this.dateInputs = page.locator('input[type="date"], input[type="datetime-local"]');
        this.checkboxes = page.locator('input[type="checkbox"]');
        this.radioButtons = page.locator('input[type="radio"]');
        this.selectDropdowns = page.locator('select');
        this.textareas = page.locator('textarea');
        this.fileInputs = page.locator('input[type="file"]');
        
        // Validation elements
        this.errorMessages = page.locator('.error, .field-error, .validation-error, [data-testid="error"]');
        this.requiredIndicators = page.locator('.required, .mandatory, [data-testid="required"]');
        this.helpText = page.locator('.help-text, .field-help, [data-testid="help"]');
        
        // Form states
        this.loadingSpinner = page.locator('.loading, .spinner, [data-testid="loading"]');
        this.successMessage = page.locator('.success, .alert-success, [data-testid="success"]');
        this.errorAlert = page.locator('.alert-error, .alert-danger, [data-testid="error-alert"]');
    }

    /**
     * Navigate to form page
     * @param {string} baseUrl - Base URL of the application
     * @param {string} formPath - Form path (e.g., '/contact', '/register')
     */
    async navigateToForm(baseUrl, formPath) {
        await this.navigateTo(`${baseUrl}${formPath}`);
        await this.waitForElement(this.form);
    }

    /**
     * Fill text input field
     * @param {string} fieldName - Field name, label, or data-testid
     * @param {string} value - Value to fill
     */
    async fillTextInput(fieldName, value) {
        const field = this.getFieldLocator(fieldName, 'text');
        await this.fill(field, value);
    }

    /**
     * Fill email input field
     * @param {string} fieldName - Field name, label, or data-testid
     * @param {string} email - Email value
     */
    async fillEmailInput(fieldName, email) {
        const field = this.getFieldLocator(fieldName, 'email');
        await this.fill(field, email);
    }

    /**
     * Fill password input field
     * @param {string} fieldName - Field name, label, or data-testid
     * @param {string} password - Password value
     */
    async fillPasswordInput(fieldName, password) {
        const field = this.getFieldLocator(fieldName, 'password');
        await this.fill(field, password);
    }

    /**
     * Fill number input field
     * @param {string} fieldName - Field name, label, or data-testid
     * @param {number} value - Number value
     */
    async fillNumberInput(fieldName, value) {
        const field = this.getFieldLocator(fieldName, 'number');
        await this.fill(field, value.toString());
    }

    /**
     * Fill date input field
     * @param {string} fieldName - Field name, label, or data-testid
     * @param {string} date - Date value (YYYY-MM-DD format)
     */
    async fillDateInput(fieldName, date) {
        const field = this.getFieldLocator(fieldName, 'date');
        await this.fill(field, date);
    }

    /**
     * Fill textarea field
     * @param {string} fieldName - Field name, label, or data-testid
     * @param {string} value - Text value
     */
    async fillTextarea(fieldName, value) {
        const field = this.getFieldLocator(fieldName, 'textarea');
        await this.fill(field, value);
    }

    /**
     * Select option from dropdown
     * @param {string} fieldName - Field name, label, or data-testid
     * @param {string|Array} value - Option value(s) to select
     */
    async selectDropdownOption(fieldName, value) {
        const field = this.getFieldLocator(fieldName, 'select');
        await this.selectOption(field, value);
    }

    /**
     * Check checkbox
     * @param {string} fieldName - Field name, label, or data-testid
     * @param {boolean} checked - Whether to check or uncheck
     */
    async setCheckbox(fieldName, checked = true) {
        const field = this.getFieldLocator(fieldName, 'checkbox');
        const isCurrentlyChecked = await field.isChecked();
        
        if (checked !== isCurrentlyChecked) {
            await this.click(field);
        }
    }

    /**
     * Select radio button
     * @param {string} fieldName - Field name, label, or data-testid
     * @param {string} value - Radio button value to select
     */
    async selectRadioButton(fieldName, value) {
        const field = this.page.locator(`input[name="${fieldName}"][value="${value}"], input[data-testid="${fieldName}"][value="${value}"]`);
        await this.click(field);
    }

    /**
     * Upload file
     * @param {string} fieldName - Field name, label, or data-testid
     * @param {string} filePath - Path to file to upload
     */
    async uploadFile(fieldName, filePath) {
        const field = this.getFieldLocator(fieldName, 'file');
        await field.setInputFiles(filePath);
    }

    /**
     * Submit form
     * @param {Object} options - Submit options
     */
    async submitForm(options = {}) {
        const { waitForRedirect = true, expectSuccess = true } = options;
        
        await this.click(this.submitButton);
        
        // Wait for loading to complete
        if (await this.isVisible(this.loadingSpinner)) {
            await this.waitForElementToHide(this.loadingSpinner);
        }
        
        if (waitForRedirect) {
            await this.waitForPageLoad();
        }
        
        if (expectSuccess) {
            await this.expectVisible(this.successMessage);
        }
    }

    /**
     * Reset form
     */
    async resetForm() {
        await this.click(this.resetButton);
        await this.waitForPageLoad();
    }

    /**
     * Cancel form
     */
    async cancelForm() {
        await this.click(this.cancelButton);
        await this.waitForPageLoad();
    }

    /**
     * Fill entire form with data
     * @param {Object} formData - Form data object
     */
    async fillForm(formData) {
        for (const [fieldName, fieldValue] of Object.entries(formData)) {
            const fieldType = this.detectFieldType(fieldName);
            
            switch (fieldType) {
                case 'email':
                    await this.fillEmailInput(fieldName, fieldValue);
                    break;
                case 'password':
                    await this.fillPasswordInput(fieldName, fieldValue);
                    break;
                case 'number':
                    await this.fillNumberInput(fieldName, fieldValue);
                    break;
                case 'date':
                    await this.fillDateInput(fieldName, fieldValue);
                    break;
                case 'checkbox':
                    await this.setCheckbox(fieldName, fieldValue);
                    break;
                case 'radio':
                    await this.selectRadioButton(fieldName, fieldValue);
                    break;
                case 'select':
                    await this.selectDropdownOption(fieldName, fieldValue);
                    break;
                case 'file':
                    await this.uploadFile(fieldName, fieldValue);
                    break;
                case 'textarea':
                    await this.fillTextarea(fieldName, fieldValue);
                    break;
                default:
                    await this.fillTextInput(fieldName, fieldValue);
            }
        }
    }

    /**
     * Validate form fields
     * @param {Object} validationRules - Validation rules object
     */
    async validateForm(validationRules) {
        for (const [fieldName, rules] of Object.entries(validationRules)) {
            // Validate field exists
            this.getFieldLocator(fieldName);
            
            if (rules.required) {
                await this.validateRequiredField(fieldName);
            }
            
            if (rules.minLength) {
                await this.validateMinLength(fieldName, rules.minLength);
            }
            
            if (rules.maxLength) {
                await this.validateMaxLength(fieldName, rules.maxLength);
            }
            
            if (rules.pattern) {
                await this.validatePattern(fieldName, rules.pattern);
            }
            
            if (rules.email) {
                await this.validateEmail(fieldName);
            }
        }
    }

    /**
     * Validate required field
     * @param {string} fieldName - Field name
     */
    async validateRequiredField(fieldName) {
        // Validate field exists
        this.getFieldLocator(fieldName);
        await this.click(this.submitButton);
        
        // Check for validation error
        const errorMessage = this.page.locator(`[data-testid="error-${fieldName}"], .field-error:has-text("${fieldName}")`);
        await this.expectVisible(errorMessage);
    }

    /**
     * Validate email field
     * @param {string} fieldName - Field name
     */
    async validateEmail(fieldName) {
        const field = this.getFieldLocator(fieldName, 'email');
        await this.fill(field, 'invalid-email');
        await this.click(this.submitButton);
        
        const errorMessage = this.page.locator(`[data-testid="error-${fieldName}"], .field-error:has-text("email")`);
        await this.expectVisible(errorMessage);
    }

    /**
     * Validate minimum length
     * @param {string} fieldName - Field name
     * @param {number} minLength - Minimum length
     */
    async validateMinLength(fieldName, minLength) {
        const field = this.getFieldLocator(fieldName);
        const shortValue = 'a'.repeat(minLength - 1);
        await this.fill(field, shortValue);
        await this.click(this.submitButton);
        
        const errorMessage = this.page.locator(`[data-testid="error-${fieldName}"], .field-error:has-text("minimum")`);
        await this.expectVisible(errorMessage);
    }

    /**
     * Validate maximum length
     * @param {string} fieldName - Field name
     * @param {number} maxLength - Maximum length
     */
    async validateMaxLength(fieldName, maxLength) {
        const field = this.getFieldLocator(fieldName);
        const longValue = 'a'.repeat(maxLength + 1);
        await this.fill(field, longValue);
        
        // Check if input is truncated
        const currentValue = await this.getValue(field);
        expect(currentValue.length).toBeLessThanOrEqual(maxLength);
    }

    /**
     * Validate pattern
     * @param {string} fieldName - Field name
     * @param {RegExp} pattern - Pattern to validate
     */
    async validatePattern(fieldName, _pattern) {
        const field = this.getFieldLocator(fieldName);
        await this.fill(field, 'invalid-pattern');
        await this.click(this.submitButton);
        
        const errorMessage = this.page.locator(`[data-testid="error-${fieldName}"], .field-error:has-text("format")`);
        await this.expectVisible(errorMessage);
    }

    /**
     * Get field locator
     * @param {string} fieldName - Field name
     * @param {string} type - Field type
     * @returns {Locator} Playwright locator
     */
    getFieldLocator(fieldName, type = 'text') {
        const selectors = [
            `[name="${fieldName}"]`,
            `[data-testid="${fieldName}"]`,
            `input[type="${type}"][placeholder*="${fieldName}"]`,
            `label:has-text("${fieldName}") + input`,
            `label:has-text("${fieldName}") ~ input`,
            `#${fieldName}`,
            `.${fieldName}`
        ];
        
        return this.page.locator(selectors.join(', '));
    }

    /**
     * Detect field type based on field name
     * @param {string} fieldName - Field name
     * @returns {string} Field type
     */
    detectFieldType(fieldName) {
        const lowerName = fieldName.toLowerCase();
        
        if (lowerName.includes('email')) return 'email';
        if (lowerName.includes('password')) return 'password';
        if (lowerName.includes('phone') || lowerName.includes('tel')) return 'tel';
        if (lowerName.includes('date')) return 'date';
        if (lowerName.includes('number') || lowerName.includes('age') || lowerName.includes('count')) return 'number';
        if (lowerName.includes('file') || lowerName.includes('upload')) return 'file';
        if (lowerName.includes('message') || lowerName.includes('comment') || lowerName.includes('description')) return 'textarea';
        if (lowerName.includes('agree') || lowerName.includes('accept') || lowerName.includes('terms')) return 'checkbox';
        if (lowerName.includes('gender') || lowerName.includes('type') || lowerName.includes('category')) return 'radio';
        if (lowerName.includes('country') || lowerName.includes('state') || lowerName.includes('select')) return 'select';
        
        return 'text';
    }

    /**
     * Clear all form fields
     */
    async clearForm() {
        const allInputs = this.page.locator('input, textarea, select');
        const inputCount = await allInputs.count();
        
        for (let i = 0; i < inputCount; i++) {
            const input = allInputs.nth(i);
            const inputType = await input.getAttribute('type');
            
            if (inputType === 'checkbox' || inputType === 'radio') {
                if (await input.isChecked()) {
                    await this.click(input);
                }
            } else {
                await this.fill(input, '');
            }
        }
    }

    /**
     * Get form data
     * @returns {Promise<Object>} Form data object
     */
    async getFormData() {
        const formData = {};
        const allInputs = this.page.locator('input, textarea, select');
        const inputCount = await allInputs.count();
        
        for (let i = 0; i < inputCount; i++) {
            const input = allInputs.nth(i);
            const name = await input.getAttribute('name') || await input.getAttribute('data-testid');
            const type = await input.getAttribute('type');
            
            if (name) {
                if (type === 'checkbox') {
                    formData[name] = await input.isChecked();
                } else if (type === 'radio') {
                    if (await input.isChecked()) {
                        formData[name] = await input.getAttribute('value');
                    }
                } else {
                    formData[name] = await this.getValue(input);
                }
            }
        }
        
        return formData;
    }

    /**
     * Check if form is valid
     * @returns {Promise<boolean>} True if form is valid
     */
    async isFormValid() {
        const hasErrors = await this.isVisible(this.errorMessages);
        return !hasErrors;
    }

    /**
     * Wait for form submission to complete
     */
    async waitForFormSubmission() {
        if (await this.isVisible(this.loadingSpinner)) {
            await this.waitForElementToHide(this.loadingSpinner);
        }
        
        // Wait for either success or error message
        await this.page.waitForFunction(() => {
            // eslint-disable-next-line no-undef
            const success = document.querySelector('.success, .alert-success, [data-testid="success"]');
            // eslint-disable-next-line no-undef
            const error = document.querySelector('.alert-error, .alert-danger, [data-testid="error-alert"]');
            return success || error;
        });
    }

    /**
     * Test form accessibility
     */
    async testAccessibility() {
        // Check if form has proper labels
        const inputs = this.page.locator('input, textarea, select');
        const inputCount = await inputs.count();
        
        for (let i = 0; i < inputCount; i++) {
            const input = inputs.nth(i);
            const inputId = await input.getAttribute('id');
            
            if (inputId) {
                const label = this.page.locator(`label[for="${inputId}"]`);
                await this.expectVisible(label);
            }
        }
        
        // Check if submit button is accessible
        await this.expectEnabled(this.submitButton);
    }
}

module.exports = { FormPage };
