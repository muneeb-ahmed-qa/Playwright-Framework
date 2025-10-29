const { BasePage } = require('./base.page');

/**
 * Dashboard Page Object Class
 * Demonstrates navigation, data display, and user interactions
 */
class DashboardPage extends BasePage {
    constructor(page) {
        super(page);
        
        // Navigation elements
        this.navigationMenu = page.locator('.nav-menu, .sidebar, [data-testid="navigation"]');
        this.userMenu = page.locator('.user-menu, .profile-menu, [data-testid="user-menu"]');
        this.logoutButton = page.locator('button:has-text("Logout"), .logout-button, [data-testid="logout"]');
        this.settingsButton = page.locator('button:has-text("Settings"), .settings-button, [data-testid="settings"]');
        
        // Dashboard content
        this.welcomeMessage = page.locator('.welcome-message, h1, [data-testid="welcome"]');
        this.dashboardTitle = page.locator('.dashboard-title, h2, [data-testid="dashboard-title"]');
        this.statsCards = page.locator('.stat-card, .metric-card, [data-testid="stat-card"]');
        this.recentActivity = page.locator('.recent-activity, .activity-feed, [data-testid="recent-activity"]');
        this.quickActions = page.locator('.quick-actions, .action-buttons, [data-testid="quick-actions"]');
        
        // Data tables and lists
        this.dataTable = page.locator('table, .data-table, [data-testid="data-table"]');
        this.tableRows = page.locator('table tbody tr, .data-table tbody tr, [data-testid="table-row"]');
        this.tableHeaders = page.locator('table thead th, .data-table thead th, [data-testid="table-header"]');
        
        // Search and filters
        this.searchInput = page.locator('input[type="search"], .search-input, [data-testid="search"]');
        this.filterDropdown = page.locator('select, .filter-dropdown, [data-testid="filter"]');
        this.sortButton = page.locator('button:has-text("Sort"), .sort-button, [data-testid="sort"]');
        
        // Pagination
        this.pagination = page.locator('.pagination, [data-testid="pagination"]');
        this.nextPageButton = page.locator('.pagination .next, [data-testid="next-page"]');
        this.previousPageButton = page.locator('.pagination .prev, [data-testid="previous-page"]');
        this.pageNumbers = page.locator('.pagination .page-number, [data-testid="page-number"]');
        
        // Modals and overlays
        this.modal = page.locator('.modal, .overlay, [data-testid="modal"]');
        this.modalCloseButton = page.locator('.modal .close, .modal-close, [data-testid="modal-close"]');
        this.confirmButton = page.locator('button:has-text("Confirm"), .confirm-button, [data-testid="confirm"]');
        this.cancelButton = page.locator('button:has-text("Cancel"), .cancel-button, [data-testid="cancel"]');
        
        // Notifications
        this.notification = page.locator('.notification, .alert, [data-testid="notification"]');
        this.successNotification = page.locator('.notification.success, .alert-success, [data-testid="success-notification"]');
        this.errorNotification = page.locator('.notification.error, .alert-error, [data-testid="error-notification"]');
    }

    /**
     * Navigate to dashboard
     * @param {string} baseUrl - Base URL of the application
     */
    async navigateToDashboard(baseUrl) {
        await this.navigateTo(`${baseUrl}/dashboard`);
        await this.waitForElement(this.dashboardTitle);
    }

    /**
     * Check if dashboard is loaded
     */
    async expectDashboardLoaded() {
        await this.expectVisible(this.dashboardTitle);
        await this.expectVisible(this.navigationMenu);
    }

    /**
     * Get welcome message text
     * @returns {Promise<string>} Welcome message
     */
    async getWelcomeMessage() {
        return await this.getText(this.welcomeMessage);
    }

    /**
     * Navigate to a specific menu item
     * @param {string} menuItem - Menu item text or selector
     */
    async navigateToMenuItem(menuItem) {
        const menuLocator = this.page.locator(`text="${menuItem}", [data-testid="${menuItem}"]`);
        await this.click(menuLocator);
        await this.waitForPageLoad();
    }

    /**
     * Open user menu
     */
    async openUserMenu() {
        await this.click(this.userMenu);
        await this.waitForElement(this.logoutButton);
    }

    /**
     * Logout from the application
     */
    async logout() {
        await this.openUserMenu();
        await this.click(this.logoutButton);
        await this.waitForPageLoad();
    }

    /**
     * Search for specific content
     * @param {string} searchTerm - Search term
     */
    async search(searchTerm) {
        await this.fill(this.searchInput, searchTerm);
        await this.page.keyboard.press('Enter');
        await this.waitForPageLoad();
    }

    /**
     * Clear search
     */
    async clearSearch() {
        await this.fill(this.searchInput, '');
        await this.page.keyboard.press('Enter');
        await this.waitForPageLoad();
    }

    /**
     * Apply filter
     * @param {string} filterValue - Filter value to select
     */
    async applyFilter(filterValue) {
        await this.selectOption(this.filterDropdown, filterValue);
        await this.waitForPageLoad();
    }

    /**
     * Sort table by column
     * @param {string} columnName - Column name to sort by
     * @param {string} direction - Sort direction (asc/desc)
     */
    async sortTable(columnName, direction = 'asc') {
        const columnHeader = this.page.locator(`th:has-text("${columnName}"), [data-testid="column-${columnName}"]`);
        await this.click(columnHeader);
        
        // If sorting is toggled, click again for desc
        if (direction === 'desc') {
            await this.click(columnHeader);
        }
        
        await this.waitForPageLoad();
    }

    /**
     * Get table data
     * @returns {Promise<Array>} Array of table rows data
     */
    async getTableData() {
        const rows = await this.tableRows.all();
        const data = [];
        
        for (const row of rows) {
            const cells = await row.locator('td').all();
            const rowData = [];
            
            for (const cell of cells) {
                const cellText = await cell.textContent();
                rowData.push(cellText?.trim() || '');
            }
            
            data.push(rowData);
        }
        
        return data;
    }

    /**
     * Get specific table row by index
     * @param {number} index - Row index (0-based)
     * @returns {Promise<Array>} Row data
     */
    async getTableRow(index) {
        const row = this.tableRows.nth(index);
        const cells = await row.locator('td').all();
        const rowData = [];
        
        for (const cell of cells) {
            const cellText = await cell.textContent();
            rowData.push(cellText?.trim() || '');
        }
        
        return rowData;
    }

    /**
     * Click on table row
     * @param {number} index - Row index (0-based)
     */
    async clickTableRow(index) {
        const row = this.tableRows.nth(index);
        await this.click(row);
    }

    /**
     * Get stats card data
     * @returns {Promise<Array>} Array of stats card data
     */
    async getStatsCards() {
        const cards = await this.statsCards.all();
        const stats = [];
        
        for (const card of cards) {
            const title = await card.locator('.card-title, h3, [data-testid="card-title"]').textContent();
            const value = await card.locator('.card-value, .stat-value, [data-testid="card-value"]').textContent();
            const change = await card.locator('.card-change, .stat-change, [data-testid="card-change"]').textContent();
            
            stats.push({
                title: title?.trim() || '',
                value: value?.trim() || '',
                change: change?.trim() || ''
            });
        }
        
        return stats;
    }

    /**
     * Navigate to next page
     */
    async goToNextPage() {
        if (await this.isVisible(this.nextPageButton)) {
            await this.click(this.nextPageButton);
            await this.waitForPageLoad();
        }
    }

    /**
     * Navigate to previous page
     */
    async goToPreviousPage() {
        if (await this.isVisible(this.previousPageButton)) {
            await this.click(this.previousPageButton);
            await this.waitForPageLoad();
        }
    }

    /**
     * Navigate to specific page
     * @param {number} pageNumber - Page number to navigate to
     */
    async goToPage(pageNumber) {
        const pageButton = this.pageNumbers.filter({ hasText: pageNumber.toString() });
        if (await this.isVisible(pageButton)) {
            await this.click(pageButton);
            await this.waitForPageLoad();
        }
    }

    /**
     * Open modal
     * @param {string} modalTrigger - Selector for modal trigger
     */
    async openModal(modalTrigger) {
        const trigger = this.page.locator(modalTrigger);
        await this.click(trigger);
        await this.waitForElement(this.modal);
    }

    /**
     * Close modal
     */
    async closeModal() {
        if (await this.isVisible(this.modalCloseButton)) {
            await this.click(this.modalCloseButton);
        } else {
            await this.page.keyboard.press('Escape');
        }
        await this.waitForElementToHide(this.modal);
    }

    /**
     * Confirm action in modal
     */
    async confirmModal() {
        await this.click(this.confirmButton);
        await this.waitForElementToHide(this.modal);
    }

    /**
     * Cancel action in modal
     */
    async cancelModal() {
        await this.click(this.cancelButton);
        await this.waitForElementToHide(this.modal);
    }

    /**
     * Check for success notification
     * @param {string} expectedMessage - Expected success message
     */
    async expectSuccessNotification(expectedMessage) {
        await this.expectVisible(this.successNotification);
        if (expectedMessage) {
            await this.expectText(this.successNotification, expectedMessage);
        }
    }

    /**
     * Check for error notification
     * @param {string} expectedMessage - Expected error message
     */
    async expectErrorNotification(expectedMessage) {
        await this.expectVisible(this.errorNotification);
        if (expectedMessage) {
            await this.expectText(this.errorNotification, expectedMessage);
        }
    }

    /**
     * Wait for notification to appear
     * @param {string} type - Notification type (success/error)
     */
    async waitForNotification(type = 'success') {
        const notification = type === 'success' ? this.successNotification : this.errorNotification;
        await this.waitForElement(notification);
    }

    /**
     * Get recent activity items
     * @returns {Promise<Array>} Array of recent activity items
     */
    async getRecentActivity() {
        const activityItems = await this.recentActivity.locator('.activity-item, [data-testid="activity-item"]').all();
        const activities = [];
        
        for (const item of activityItems) {
            const text = await item.textContent();
            activities.push(text?.trim() || '');
        }
        
        return activities;
    }

    /**
     * Click quick action button
     * @param {string} actionName - Name of the quick action
     */
    async clickQuickAction(actionName) {
        const actionButton = this.page.locator(`button:has-text("${actionName}"), [data-testid="action-${actionName}"]`);
        await this.click(actionButton);
    }

    /**
     * Refresh dashboard data
     */
    async refreshDashboard() {
        await this.reload();
        await this.expectDashboardLoaded();
    }

    /**
     * Check if data is loading
     * @returns {Promise<boolean>} True if loading
     */
    async isLoading() {
        const loadingIndicator = this.page.locator('.loading, .spinner, [data-testid="loading"]');
        return await this.isVisible(loadingIndicator);
    }

    /**
     * Wait for data to load
     */
    async waitForDataLoad() {
        if (await this.isLoading()) {
            await this.waitForElementToHide(this.page.locator('.loading, .spinner, [data-testid="loading"]'));
        }
    }

    /**
     * Export data (if export functionality exists)
     * @param {string} format - Export format (csv, excel, pdf)
     */
    async exportData(format = 'csv') {
        const exportButton = this.page.locator(`button:has-text("Export"), [data-testid="export-${format}"]`);
        await this.click(exportButton);
        
        // Wait for download to start
        await this.page.waitForEvent('download');
    }

    /**
     * Test responsive design
     * @param {number} width - Viewport width
     * @param {number} height - Viewport height
     */
    async testResponsiveDesign(width, height) {
        await this.page.setViewportSize({ width, height });
        await this.waitForPageLoad();
        
        // Check if navigation menu is still accessible
        if (width < 768) {
            // Mobile view - check for hamburger menu
            const hamburgerMenu = this.page.locator('.hamburger-menu, .mobile-menu, [data-testid="mobile-menu"]');
            if (await this.isVisible(hamburgerMenu)) {
                await this.click(hamburgerMenu);
                await this.expectVisible(this.navigationMenu);
            }
        }
    }
}

module.exports = { DashboardPage };
