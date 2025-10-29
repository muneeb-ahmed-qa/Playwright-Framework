const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/login.page');
const { EnvConfig } = require('../utils/envConfig');

/**
 * Login Test Suite
 * Demonstrates authentication testing, form validation, and error handling
 */
test.describe('Login Functionality', () => {
    let loginPage;
    let envConfig;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        envConfig = new EnvConfig();
        
        // Navigate to login page using environment configuration
        await loginPage.navigateToLogin();
    });

    test('should display login form elements', async () => {
        // Verify login form is visible
        await loginPage.expectLoginFormVisible();
        
        // Verify form elements are present
        await expect(loginPage.usernameField).toBeVisible();
        await expect(loginPage.passwordField).toBeVisible();
        await expect(loginPage.loginButton).toBeVisible();
    });

    test('should login successfully with valid credentials', async () => {
        // Use encrypted credentials from environment
        const validCredentials = envConfig.getCredentials('user');

        // Perform login
        await loginPage.login(validCredentials.username, validCredentials.password);
        
        // Verify successful login (update URL pattern as needed)
        await loginPage.expectRedirectAfterLogin(/dashboard|home|profile/);
    });

    test('should login with encrypted admin credentials', async () => {
        // Login using encrypted credentials from environment
        await loginPage.loginAsAdmin();
        
        // Verify successful login
        await loginPage.expectRedirectAfterLogin(/dashboard|admin|home/);
    });

    test('should login with encrypted user credentials', async () => {
        // Login using encrypted credentials from environment
        await loginPage.loginAsUser();
        
        // Verify successful login
        await loginPage.expectRedirectAfterLogin(/dashboard|home|profile/);
    });

    test('should login with encrypted guest credentials', async () => {
        // Login using encrypted credentials from environment
        await loginPage.loginAsGuest();
        
        // Verify successful login
        await loginPage.expectRedirectAfterLogin(/dashboard|home|guest/);
    });

    test('should show error message with invalid credentials', async () => {
        // Test data - using invalid credentials (keeping static for error testing)
        const invalidCredentials = {
            username: 'invalid@example.com',
            password: 'wrongpassword'
        };

        // Attempt login with invalid credentials
        await loginPage.loginWithInvalidCredentials(
            invalidCredentials.username, 
            invalidCredentials.password
        );
        
        // Verify error message is displayed
        await loginPage.expectErrorMessage('Invalid username or password');
    });

    test('should validate required fields', async () => {
        // Test empty form submission
        await loginPage.validateRequiredFields();
        
        // Test with only username
        await loginPage.fillTextInput('username', 'test@example.com');
        await loginPage.click(loginPage.loginButton);
        
        // Should still show validation error for password
        await expect(loginPage.errorMessage).toBeVisible();
    });

    test('should handle remember me functionality', async () => {
        const credentials = envConfig.getCredentials('user');

        // Login with remember me checked
        await loginPage.login(credentials.username, credentials.password, { 
            rememberMe: true 
        });
        
        // Verify remember me was checked
        const isRemembered = await loginPage.isRememberMeChecked();
        expect(isRemembered).toBe(true);
    });

    test('should test keyboard navigation', async () => {
        // Test tab navigation through form elements
        await loginPage.testKeyboardNavigation();
    });

    test('should test form accessibility', async () => {
        // Test accessibility features
        await loginPage.testAccessibility();
    });

    test('should handle forgot password link', async () => {
        // Click forgot password link
        await loginPage.clickForgotPassword();
        
        // Verify navigation to forgot password page
        await expect(loginPage.page).toHaveURL(/forgot-password|reset-password/);
    });

    test('should test different user roles', async () => {
        const userRoles = [
            {
                credentials: envConfig.getCredentials('admin'),
                role: 'admin',
                expectedRedirect: /admin|dashboard/
            },
            {
                credentials: envConfig.getCredentials('user'),
                role: 'user',
                expectedRedirect: /dashboard|profile/
            }
        ];

        for (const userData of userRoles) {
            // Navigate back to login page
            await loginPage.navigateToLogin('https://example.com');
            
            // Test login with different roles
            await loginPage.login(userData.credentials.username, userData.credentials.password);
            await loginPage.expectRedirectAfterLogin(userData.expectedRedirect);
        }
    });

    test('should handle loading states', async () => {
        const credentials = envConfig.getCredentials('user');

        // Start login process
        await loginPage.fillTextInput('username', credentials.username);
        await loginPage.fillTextInput('password', credentials.password);
        
        // Click login and verify loading state
        await loginPage.click(loginPage.loginButton);
        
        // Wait for loading to complete
        if (await loginPage.isVisible(loginPage.loadingSpinner)) {
            await loginPage.waitForElementToHide(loginPage.loadingSpinner);
        }
    });

    test('should test form validation messages', async () => {
        // Test email format validation
        const userCreds = envConfig.getCredentials('user');
        await loginPage.fillTextInput('username', 'invalid-email');
        await loginPage.fillTextInput('password', userCreds.password);
        await loginPage.click(loginPage.loginButton);
        
        // Should show email format error
        await loginPage.expectErrorMessage(/invalid email|email format/);
    });

    test('should clear form correctly', async () => {
        // Fill form
        const userCreds = envConfig.getCredentials('user');
        await loginPage.fillTextInput('username', userCreds.username);
        await loginPage.fillTextInput('password', userCreds.password);
        
        // Clear form
        await loginPage.clearForm();
        
        // Verify fields are empty
        const usernameValue = await loginPage.getUsernameValue();
        const passwordValue = await loginPage.getPasswordValue();
        
        expect(usernameValue).toBe('');
        expect(passwordValue).toBe('');
    });

    test('should handle multiple login attempts', async () => {
        const credentials = envConfig.getCredentials('user');

        // First login attempt
        await loginPage.login(credentials.username, credentials.password);
        await loginPage.expectRedirectAfterLogin(/dashboard/);
        
        // Logout
        await loginPage.logout();
        
        // Second login attempt
        await loginPage.navigateToLogin('https://example.com');
        await loginPage.login(credentials.username, credentials.password);
        await loginPage.expectRedirectAfterLogin(/dashboard/);
    });

    test('should test responsive design', async () => {
        // Test mobile viewport
        await loginPage.page.setViewportSize({ width: 375, height: 667 });
        await loginPage.expectLoginFormVisible();
        
        // Test tablet viewport
        await loginPage.page.setViewportSize({ width: 768, height: 1024 });
        await loginPage.expectLoginFormVisible();
        
        // Test desktop viewport
        await loginPage.page.setViewportSize({ width: 1920, height: 1080 });
        await loginPage.expectLoginFormVisible();
    });
});
