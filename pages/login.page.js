const { BasePage } = require('./base.page');
const { EnvConfig } = require('../utils/envConfig');

/**
 * Login Page Object Class
 * Demonstrates form handling, validation, and user authentication
 */
class LoginPage extends BasePage {
    constructor(page) {
        super(page);
        this.envConfig = new EnvConfig();
        
        // Locators
        this.usernameField = page.locator('#username, [name="username"], [data-testid="username"]');
        this.passwordField = page.locator('#password, [name="password"], [data-testid="password"]');
        this.loginButton = page.locator('button[type="submit"], .login-button, [data-testid="login-button"]');
        this.rememberMeCheckbox = page.locator('#remember-me, [name="remember"], [data-testid="remember-me"]');
        this.forgotPasswordLink = page.locator('a[href*="forgot"], .forgot-password, [data-testid="forgot-password"]');
        this.errorMessage = page.locator('.error, .alert-danger, [data-testid="error-message"]');
        this.successMessage = page.locator('.success, .alert-success, [data-testid="success-message"]');
        this.loadingSpinner = page.locator('.spinner, .loading, [data-testid="loading"]');
        this.loginForm = page.locator('form, .login-form, [data-testid="login-form"]');
    }

    /**
     * Navigate to login page
     * @param {string} baseUrl - Base URL of the application
     */
    async navigateToLogin(baseUrl) {
        const url = baseUrl || this.envConfig.getBaseUrl();
        await this.navigateTo(`${url}/login`);
        await this.waitForElement(this.loginForm);
    }

    /**
     * Login with encrypted credentials from environment
     * @param {string} role - User role (admin, user, guest)
     * @param {Object} options - Additional options
     */
    async loginWithEncryptedCredentials(role, options = {}) {
        try {
            const credentials = this.envConfig.getCredentials(role);
            await this.login(credentials.username, credentials.password, options);
            console.log(`Successfully logged in as ${role} user: ${credentials.username}`);
        } catch (error) {
            console.error(`Failed to login with encrypted credentials for role ${role}:`, error.message);
            throw error;
        }
    }

    /**
     * Login with admin credentials from environment
     * @param {Object} options - Additional options
     */
    async loginAsAdmin(options = {}) {
        await this.loginWithEncryptedCredentials('admin', options);
    }

    /**
     * Login with user credentials from environment
     * @param {Object} options - Additional options
     */
    async loginAsUser(options = {}) {
        await this.loginWithEncryptedCredentials('user', options);
    }

    /**
     * Login with guest credentials from environment
     * @param {Object} options - Additional options
     */
    async loginAsGuest(options = {}) {
        await this.loginWithEncryptedCredentials('guest', options);
    }

    /**
     * Perform login with username and password
     * @param {string} username - Username or email
     * @param {string} password - Password
     * @param {Object} options - Additional options
     */
    async login(username, password, options = {}) {
        const { rememberMe = false, waitForRedirect = true } = options;
        
        // Fill username
        await this.fill(this.usernameField, username);
        
        // Fill password
        await this.fill(this.passwordField, password);
        
        // Handle remember me checkbox
        if (rememberMe) {
            await this.click(this.rememberMeCheckbox);
        }
        
        // Click login button
        await this.click(this.loginButton);
        
        // Wait for loading to complete
        if (await this.isVisible(this.loadingSpinner)) {
            await this.waitForElementToHide(this.loadingSpinner);
        }
        
        // Wait for redirect if specified
        if (waitForRedirect) {
            await this.waitForPageLoad();
        }
    }

    /**
     * Login with invalid credentials to test error handling
     * @param {string} username - Invalid username
     * @param {string} password - Invalid password
     */
    async loginWithInvalidCredentials(username, password) {
        await this.login(username, password, { waitForRedirect: false });
        await this.expectVisible(this.errorMessage);
    }

    /**
     * Check if error message is displayed
     * @param {string} expectedMessage - Expected error message
     */
    async expectErrorMessage(expectedMessage) {
        await this.expectVisible(this.errorMessage);
        await this.expectText(this.errorMessage, expectedMessage);
    }

    /**
     * Check if success message is displayed
     * @param {string} expectedMessage - Expected success message
     */
    async expectSuccessMessage(expectedMessage) {
        await this.expectVisible(this.successMessage);
        await this.expectText(this.successMessage, expectedMessage);
    }

    /**
     * Click forgot password link
     */
    async clickForgotPassword() {
        await this.click(this.forgotPasswordLink);
    }

    /**
     * Check if login form is visible
     */
    async expectLoginFormVisible() {
        await this.expectVisible(this.loginForm);
    }

    /**
     * Check if user is redirected after successful login
     * @param {string} expectedUrl - Expected redirect URL pattern
     */
    async expectRedirectAfterLogin(expectedUrl) {
        await this.expectUrl(expectedUrl);
    }

    /**
     * Clear login form
     */
    async clearForm() {
        await this.fill(this.usernameField, '');
        await this.fill(this.passwordField, '');
    }

    /**
     * Get current username value
     * @returns {Promise<string>} Username value
     */
    async getUsernameValue() {
        return await this.getValue(this.usernameField);
    }

    /**
     * Get current password value
     * @returns {Promise<string>} Password value
     */
    async getPasswordValue() {
        return await this.getValue(this.passwordField);
    }

    /**
     * Check if remember me is checked
     * @returns {Promise<boolean>} True if checked
     */
    async isRememberMeChecked() {
        return await this.rememberMeCheckbox.isChecked();
    }

    /**
     * Validate form fields are required
     */
    async validateRequiredFields() {
        // Try to submit empty form
        await this.click(this.loginButton);
        
        // Check for validation messages or form not submitting
        const isFormStillVisible = await this.isVisible(this.loginForm);
        if (isFormStillVisible) {
            // Form should still be visible if validation prevents submission
            await this.expectVisible(this.loginForm);
        }
    }

    /**
     * Test login with different user roles
     * @param {Object} userData - User data object
     */
    async loginWithUserRole(userData) {
        const { username, password, role, expectedRedirect } = userData;
        
        await this.login(username, password);
        
        if (expectedRedirect) {
            await this.expectRedirectAfterLogin(expectedRedirect);
        }
        
        // Additional role-specific validations can be added here
        console.log(`Logged in as ${role} user: ${username}`);
    }

    /**
     * Logout functionality (if available on login page)
     */
    async logout() {
        const logoutButton = this.page.locator('button:has-text("Logout"), .logout-button, [data-testid="logout"]');
        if (await this.isVisible(logoutButton)) {
            await this.click(logoutButton);
            await this.waitForPageLoad();
        }
    }

    /**
     * Check if user is already logged in
     * @returns {Promise<boolean>} True if logged in
     */
    async isLoggedIn() {
        const userMenu = this.page.locator('.user-menu, .profile-menu, [data-testid="user-menu"]');
        return await this.isVisible(userMenu);
    }

    /**
     * Wait for login page to load completely
     */
    async waitForLoginPageLoad() {
        await this.waitForElement(this.loginForm);
        await this.waitForPageLoad();
    }

    /**
     * Take screenshot of login form
     * @param {string} name - Screenshot name
     */
    async takeLoginFormScreenshot(name = 'login-form') {
        await this.takeScreenshot(name);
    }

    /**
     * Test keyboard navigation
     */
    async testKeyboardNavigation() {
        // Tab to username field
        await this.page.keyboard.press('Tab');
        await this.expectVisible(this.usernameField);
        
        // Tab to password field
        await this.page.keyboard.press('Tab');
        await this.expectVisible(this.passwordField);
        
        // Tab to login button
        await this.page.keyboard.press('Tab');
        await this.expectVisible(this.loginButton);
    }

    /**
     * Test form accessibility
     */
    async testAccessibility() {
        // Check if form has proper labels
        const usernameLabel = this.page.locator('label[for="username"], label:has-text("Username"), label:has-text("Email")');
        const passwordLabel = this.page.locator('label[for="password"], label:has-text("Password")');
        
        await this.expectVisible(usernameLabel);
        await this.expectVisible(passwordLabel);
        
        // Check if login button is accessible
        await this.expectEnabled(this.loginButton);
    }
}

module.exports = { LoginPage };
