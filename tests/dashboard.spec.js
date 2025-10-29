const { test, expect } = require('@playwright/test');
const { DashboardPage } = require('../pages/dashboard.page');
const { LoginPage } = require('../pages/login.page');
const { EnvConfig } = require('../utils/envConfig');

/**
 * Dashboard Test Suite
 * Demonstrates data display, navigation, search, and user interactions
 */
test.describe('Dashboard Functionality', () => {
    let dashboardPage;
    let loginPage;
    let envConfig;

    test.beforeEach(async ({ page }) => {
        dashboardPage = new DashboardPage(page);
        loginPage = new LoginPage(page);
        envConfig = new EnvConfig();
        
        // Login before each test using encrypted credentials
        await loginPage.navigateToLogin('https://example.com');
        const userCredentials = envConfig.getCredentials('user');
        await loginPage.login(userCredentials.username, userCredentials.password);
        
        // Navigate to dashboard
        await dashboardPage.navigateToDashboard('https://example.com');
    });

    test('should display dashboard elements', async () => {
        // Verify dashboard is loaded
        await dashboardPage.expectDashboardLoaded();
        
        // Verify welcome message
        const welcomeMessage = await dashboardPage.getWelcomeMessage();
        expect(welcomeMessage).toContain('Welcome');
        
        // Verify navigation menu is visible
        await expect(dashboardPage.navigationMenu).toBeVisible();
    });

    test('should display statistics cards', async () => {
        // Get stats cards data
        const statsCards = await dashboardPage.getStatsCards();
        
        // Verify stats cards are present
        expect(statsCards.length).toBeGreaterThan(0);
        
        // Verify each card has required properties
        for (const card of statsCards) {
            expect(card.title).toBeDefined();
            expect(card.value).toBeDefined();
        }
    });

    test('should navigate to different menu items', async () => {
        const menuItems = ['Profile', 'Settings', 'Reports', 'Users'];
        
        for (const menuItem of menuItems) {
            // Navigate to menu item
            await dashboardPage.navigateToMenuItem(menuItem);
            
            // Verify navigation (update URL patterns as needed)
            await expect(dashboardPage.page).toHaveURL(new RegExp(menuItem.toLowerCase()));
            
            // Navigate back to dashboard
            await dashboardPage.navigateToDashboard('https://example.com');
        }
    });

    test('should perform search functionality', async () => {
        const searchTerms = ['test', 'user', 'data'];
        
        for (const searchTerm of searchTerms) {
            // Perform search
            await dashboardPage.search(searchTerm);
            
            // Verify search results (update based on your app's search behavior)
            await dashboardPage.waitForDataLoad();
            
            // Clear search
            await dashboardPage.clearSearch();
        }
    });

    test('should apply filters', async () => {
        // Test different filter options
        const filterOptions = ['All', 'Active', 'Inactive', 'Recent'];
        
        for (const filterOption of filterOptions) {
            await dashboardPage.applyFilter(filterOption);
            await dashboardPage.waitForDataLoad();
        }
    });

    test('should sort table data', async () => {
        // Test sorting by different columns
        const sortColumns = ['Name', 'Date', 'Status', 'Priority'];
        
        for (const column of sortColumns) {
            // Sort ascending
            await dashboardPage.sortTable(column, 'asc');
            await dashboardPage.waitForDataLoad();
            
            // Sort descending
            await dashboardPage.sortTable(column, 'desc');
            await dashboardPage.waitForDataLoad();
        }
    });

    test('should display and interact with data table', async () => {
        // Get table data
        const tableData = await dashboardPage.getTableData();
        
        // Verify table has data
        expect(tableData.length).toBeGreaterThan(0);
        
        // Test clicking on table rows
        if (tableData.length > 0) {
            await dashboardPage.clickTableRow(0);
            // Add assertions based on your app's behavior
        }
    });

    test('should handle pagination', async () => {
        // Test pagination if available
        if (await dashboardPage.isVisible(dashboardPage.pagination)) {
            // Test next page
            await dashboardPage.goToNextPage();
            await dashboardPage.waitForDataLoad();
            
            // Test previous page
            await dashboardPage.goToPreviousPage();
            await dashboardPage.waitForDataLoad();
            
            // Test specific page number
            await dashboardPage.goToPage(2);
            await dashboardPage.waitForDataLoad();
        }
    });

    test('should handle modal interactions', async () => {
        // Test opening a modal (update selector based on your app)
        const modalTrigger = 'button:has-text("Add"), .add-button, [data-testid="add-button"]';
        
        if (await dashboardPage.isVisible(dashboardPage.page.locator(modalTrigger))) {
            await dashboardPage.openModal(modalTrigger);
            
            // Verify modal is open
            await expect(dashboardPage.modal).toBeVisible();
            
            // Test closing modal
            await dashboardPage.closeModal();
            
            // Verify modal is closed
            await expect(dashboardPage.modal).toBeHidden();
        }
    });

    test('should display recent activity', async () => {
        // Get recent activity items
        const recentActivity = await dashboardPage.getRecentActivity();
        
        // Verify recent activity is displayed
        expect(recentActivity.length).toBeGreaterThan(0);
        
        // Verify activity items have content
        for (const activity of recentActivity) {
            expect(activity).toBeTruthy();
        }
    });

    test('should test quick actions', async () => {
        const quickActions = ['Add New', 'Export', 'Refresh', 'Settings'];
        
        for (const action of quickActions) {
            if (await dashboardPage.isVisible(dashboardPage.page.locator(`button:has-text("${action}")`))) {
                await dashboardPage.clickQuickAction(action);
                // Add assertions based on your app's behavior
            }
        }
    });

    test('should handle user menu interactions', async () => {
        // Open user menu
        await dashboardPage.openUserMenu();
        
        // Verify user menu is open
        await expect(dashboardPage.logoutButton).toBeVisible();
        
        // Test logout
        await dashboardPage.logout();
        
        // Verify redirect to login page
        await expect(dashboardPage.page).toHaveURL(/login/);
    });

    test('should test responsive design', async () => {
        // Test mobile viewport
        await dashboardPage.testResponsiveDesign(375, 667);
        
        // Test tablet viewport
        await dashboardPage.testResponsiveDesign(768, 1024);
        
        // Test desktop viewport
        await dashboardPage.testResponsiveDesign(1920, 1080);
    });

    test('should handle data refresh', async () => {
        // Refresh dashboard data
        await dashboardPage.refreshDashboard();
        
        // Verify dashboard is still loaded
        await dashboardPage.expectDashboardLoaded();
    });

    test('should test export functionality', async () => {
        // Test data export if available
        if (await dashboardPage.isVisible(dashboardPage.page.locator('button:has-text("Export")'))) {
            await dashboardPage.exportData('csv');
            // Verify download started
            await dashboardPage.page.waitForEvent('download');
        }
    });

    test('should handle loading states', async () => {
        // Refresh to trigger loading state
        await dashboardPage.refreshDashboard();
        
        // Check if loading indicator appears
        const isLoading = await dashboardPage.isLoading();
        
        if (isLoading) {
            // Wait for loading to complete
            await dashboardPage.waitForDataLoad();
        }
    });

    test('should test keyboard navigation', async () => {
        // Test tab navigation
        await dashboardPage.page.keyboard.press('Tab');
        await dashboardPage.page.keyboard.press('Tab');
        await dashboardPage.page.keyboard.press('Tab');
        
        // Test enter key on focused element
        await dashboardPage.page.keyboard.press('Enter');
    });

    test('should handle error states', async () => {
        // Simulate error by navigating to invalid URL
        await dashboardPage.page.goto('https://example.com/invalid-page');
        
        // Check for error handling
        const hasError = await dashboardPage.isVisible(dashboardPage.page.locator('.error, .alert-error'));
        
        if (hasError) {
            // Verify error message is displayed
            await expect(dashboardPage.page.locator('.error, .alert-error')).toBeVisible();
        }
    });

    test('should test accessibility features', async () => {
        // Test keyboard navigation
        await dashboardPage.page.keyboard.press('Tab');
        
        // Test screen reader compatibility
        const focusedElement = await dashboardPage.page.evaluate(() => document.activeElement);
        expect(focusedElement).toBeTruthy();
        
        // Test ARIA labels
        const elementsWithAria = await dashboardPage.page.locator('[aria-label]').count();
        expect(elementsWithAria).toBeGreaterThan(0);
    });

    test('should handle concurrent user actions', async () => {
        // Simulate multiple rapid actions
        const actions = [
            () => dashboardPage.search('test'),
            () => dashboardPage.applyFilter('Active'),
            () => dashboardPage.sortTable('Name', 'asc')
        ];
        
        // Execute actions concurrently
        await Promise.all(actions.map(action => action()));
        
        // Wait for all actions to complete
        await dashboardPage.waitForDataLoad();
    });
});
