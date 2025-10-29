/**
 * API Helper Utility
 * Provides methods for API testing, mocking, and data validation
 */
class ApiHelper {
    constructor(page) {
        this.page = page;
        this.baseUrl = process.env.API_BASE_URL || 'https://api.example.com';
        this.headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }

    /**
     * Set authentication token
     * @param {string} token - Authentication token
     */
    setAuthToken(token) {
        this.headers['Authorization'] = `Bearer ${token}`;
    }

    /**
     * Set custom headers
     * @param {Object} headers - Custom headers
     */
    setHeaders(headers) {
        this.headers = { ...this.headers, ...headers };
    }

    /**
     * Make GET request
     * @param {string} endpoint - API endpoint
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} API response
     */
    async get(endpoint, params = {}) {
        const url = new URL(`${this.baseUrl}${endpoint}`);
        
        // Add query parameters
        Object.keys(params).forEach(key => {
            url.searchParams.append(key, params[key]);
        });

        const response = await this.page.request.get(url.toString(), {
            headers: this.headers
        });

        return {
            status: response.status(),
            data: await response.json(),
            headers: response.headers()
        };
    }

    /**
     * Make POST request
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request body data
     * @returns {Promise<Object>} API response
     */
    async post(endpoint, data = {}) {
        const response = await this.page.request.post(`${this.baseUrl}${endpoint}`, {
            headers: this.headers,
            data: data
        });

        return {
            status: response.status(),
            data: await response.json(),
            headers: response.headers()
        };
    }

    /**
     * Make PUT request
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request body data
     * @returns {Promise<Object>} API response
     */
    async put(endpoint, data = {}) {
        const response = await this.page.request.put(`${this.baseUrl}${endpoint}`, {
            headers: this.headers,
            data: data
        });

        return {
            status: response.status(),
            data: await response.json(),
            headers: response.headers()
        };
    }

    /**
     * Make DELETE request
     * @param {string} endpoint - API endpoint
     * @returns {Promise<Object>} API response
     */
    async delete(endpoint) {
        const response = await this.page.request.delete(`${this.baseUrl}${endpoint}`, {
            headers: this.headers
        });

        return {
            status: response.status(),
            data: await response.json(),
            headers: response.headers()
        };
    }

    /**
     * Make PATCH request
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request body data
     * @returns {Promise<Object>} API response
     */
    async patch(endpoint, data = {}) {
        const response = await this.page.request.patch(`${this.baseUrl}${endpoint}`, {
            headers: this.headers,
            data: data
        });

        return {
            status: response.status(),
            data: await response.json(),
            headers: response.headers()
        };
    }

    /**
     * Wait for API response
     * @param {string} url - API URL pattern
     * @param {Function} handler - Response handler function
     * @returns {Promise<Object>} API response
     */
    async waitForResponse(url, handler = null) {
        const response = await this.page.waitForResponse(url);
        
        if (handler) {
            await handler(response);
        }

        return {
            status: response.status(),
            data: await response.json(),
            headers: response.headers()
        };
    }

    /**
     * Wait for API request
     * @param {string} url - API URL pattern
     * @param {Function} handler - Request handler function
     * @returns {Promise<Object>} API request
     */
    async waitForRequest(url, handler = null) {
        const request = await this.page.waitForRequest(url);
        
        if (handler) {
            await handler(request);
        }

        return {
            url: request.url(),
            method: request.method(),
            headers: request.headers(),
            postData: request.postData()
        };
    }

    /**
     * Mock API response
     * @param {string} url - URL pattern to mock
     * @param {Object} response - Mock response data
     * @param {number} status - HTTP status code
     */
    async mockResponse(url, response, status = 200) {
        await this.page.route(url, route => {
            route.fulfill({
                status: status,
                contentType: 'application/json',
                body: JSON.stringify(response)
            });
        });
    }

    /**
     * Mock API error response
     * @param {string} url - URL pattern to mock
     * @param {string} errorMessage - Error message
     * @param {number} status - HTTP status code
     */
    async mockErrorResponse(url, errorMessage, status = 500) {
        await this.page.route(url, route => {
            route.fulfill({
                status: status,
                contentType: 'application/json',
                body: JSON.stringify({
                    error: errorMessage,
                    status: status
                })
            });
        });
    }

    /**
     * Intercept and modify API request
     * @param {string} url - URL pattern to intercept
     * @param {Function} modifier - Request modifier function
     */
    async interceptRequest(url, modifier) {
        await this.page.route(url, route => {
            const request = route.request();
            const modifiedRequest = modifier(request);
            
            route.continue({
                url: modifiedRequest.url || request.url(),
                method: modifiedRequest.method || request.method(),
                headers: modifiedRequest.headers || request.headers(),
                postData: modifiedRequest.postData || request.postData()
            });
        });
    }

    /**
     * Validate API response structure
     * @param {Object} response - API response
     * @param {Object} schema - Expected response schema
     * @returns {boolean} Validation result
     */
    validateResponse(response, schema) {
        try {
            // Basic validation - can be extended with JSON schema validation
            if (schema.status && response.status !== schema.status) {
                return false;
            }

            if (schema.requiredFields) {
                for (const field of schema.requiredFields) {
                    if (!this.hasNestedProperty(response.data, field)) {
                        return false;
                    }
                }
            }

            if (schema.dataType && typeof response.data !== schema.dataType) {
                return false;
            }

            return true;
        } catch (error) {
            console.error('Response validation error:', error);
            return false;
        }
    }

    /**
     * Check if object has nested property
     * @param {Object} obj - Object to check
     * @param {string} path - Property path (e.g., 'user.profile.name')
     * @returns {boolean} True if property exists
     */
    hasNestedProperty(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        }, obj) !== undefined;
    }

    /**
     * Extract data from API response
     * @param {Object} response - API response
     * @param {string} path - Data path (e.g., 'data.users[0].name')
     * @returns {*} Extracted data
     */
    extractData(response, path) {
        return path.split('.').reduce((current, key) => {
            if (key.includes('[') && key.includes(']')) {
                const arrayKey = key.substring(0, key.indexOf('['));
                const index = parseInt(key.substring(key.indexOf('[') + 1, key.indexOf(']')));
                return current[arrayKey][index];
            }
            return current[key];
        }, response.data);
    }

    /**
     * Test API endpoint with different scenarios
     * @param {string} endpoint - API endpoint
     * @param {Array} scenarios - Test scenarios
     */
    async testEndpoint(endpoint, scenarios) {
        const results = [];

        for (const scenario of scenarios) {
            try {
                let response;
                
                switch (scenario.method.toLowerCase()) {
                    case 'get':
                        response = await this.get(endpoint, scenario.params);
                        break;
                    case 'post':
                        response = await this.post(endpoint, scenario.data);
                        break;
                    case 'put':
                        response = await this.put(endpoint, scenario.data);
                        break;
                    case 'delete':
                        response = await this.delete(endpoint);
                        break;
                    default:
                        throw new Error(`Unsupported method: ${scenario.method}`);
                }

                results.push({
                    scenario: scenario.name,
                    success: true,
                    response: response,
                    expectedStatus: scenario.expectedStatus,
                    actualStatus: response.status
                });
            } catch (error) {
                results.push({
                    scenario: scenario.name,
                    success: false,
                    error: error.message
                });
            }
        }

        return results;
    }

    /**
     * Load test API endpoint
     * @param {string} endpoint - API endpoint
     * @param {number} requests - Number of requests
     * @param {number} concurrency - Concurrent requests
     */
    async loadTest(endpoint, requests = 100, concurrency = 10) {
        const results = [];
        const startTime = Date.now();

        const makeRequest = async () => {
            const requestStart = Date.now();
            try {
                const response = await this.get(endpoint);
                const requestEnd = Date.now();
                
                return {
                    success: true,
                    responseTime: requestEnd - requestStart,
                    status: response.status
                };
            } catch (error) {
                const requestEnd = Date.now();
                return {
                    success: false,
                    responseTime: requestEnd - requestStart,
                    error: error.message
                };
            }
        };

        // Create batches of concurrent requests
        for (let i = 0; i < requests; i += concurrency) {
            const batch = [];
            for (let j = 0; j < concurrency && i + j < requests; j++) {
                batch.push(makeRequest());
            }
            
            const batchResults = await Promise.all(batch);
            results.push(...batchResults);
        }

        const endTime = Date.now();
        const totalTime = endTime - startTime;

        return {
            totalRequests: requests,
            successfulRequests: results.filter(r => r.success).length,
            failedRequests: results.filter(r => !r.success).length,
            totalTime: totalTime,
            averageResponseTime: results.reduce((sum, r) => sum + r.responseTime, 0) / results.length,
            requestsPerSecond: requests / (totalTime / 1000),
            results: results
        };
    }

    /**
     * Generate API test report
     * @param {Array} testResults - Test results array
     * @returns {Object} Test report
     */
    generateTestReport(testResults) {
        const totalTests = testResults.length;
        const passedTests = testResults.filter(r => r.success).length;
        const failedTests = totalTests - passedTests;
        const successRate = (passedTests / totalTests) * 100;

        return {
            summary: {
                totalTests,
                passedTests,
                failedTests,
                successRate: `${successRate.toFixed(2)}%`
            },
            details: testResults,
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = { ApiHelper };