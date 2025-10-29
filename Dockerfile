# Multi-stage Dockerfile for Playwright Test Framework
FROM node:18-slim as base

# Install system dependencies
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    procps \
    libxss1 \
    libgconf-2-4 \
    libxrandr2 \
    libasound2 \
    libpangocairo-1.0-0 \
    libatk1.0-0 \
    libcairo-gobject2 \
    libgtk-3-0 \
    libgdk-pixbuf2.0-0 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrender1 \
    libxtst6 \
    libnss3 \
    libcups2 \
    libxss1 \
    libgconf-2-4 \
    libxrandr2 \
    libasound2 \
    libpangocairo-1.0-0 \
    libatk1.0-0 \
    libcairo-gobject2 \
    libgtk-3-0 \
    libgdk-pixbuf2.0-0 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrender1 \
    libxtst6 \
    libnss3 \
    libcups2 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Development stage
FROM base as development

# Install all dependencies including dev dependencies
RUN npm ci

# Install Playwright browsers
RUN npx playwright install --with-deps

# Copy source code
COPY . .

# Create non-root user
RUN groupadd -r playwright && useradd -r -g playwright -G audio,video playwright \
    && mkdir -p /home/playwright/Downloads \
    && chown -R playwright:playwright /home/playwright \
    && chown -R playwright:playwright /app

# Switch to non-root user
USER playwright

# Expose port for test results server
EXPOSE 9323

# Default command
CMD ["npm", "test"]

# Production stage
FROM base as production

# Copy only necessary files
COPY --from=development /app/pages ./pages
COPY --from=development /app/tests ./tests
COPY --from=development /app/utils ./utils
COPY --from=development /app/fixtures ./fixtures
COPY --from=development /app/scripts ./scripts
COPY --from=development /app/test-data ./test-data
COPY --from=development /app/playwright.config.js ./
COPY --from=development /app/playwright-tcu.config.js ./

# Install Playwright browsers
RUN npx playwright install --with-deps

# Create non-root user
RUN groupadd -r playwright && useradd -r -g playwright -G audio,video playwright \
    && mkdir -p /home/playwright/Downloads \
    && chown -R playwright:playwright /home/playwright \
    && chown -R playwright:playwright /app

# Switch to non-root user
USER playwright

# Expose port for test results server
EXPOSE 9323

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "console.log('Health check passed')" || exit 1

# Default command
CMD ["npm", "test"]

# Test runner stage
FROM production as test-runner

# Copy test configuration
COPY --from=development /app/playwright.config.js ./

# Set environment variables
ENV CI=true
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Run tests
CMD ["npm", "test", "--", "--reporter=html"]

# Performance testing stage
FROM production as performance

# Copy performance test configuration
COPY --from=development /app/tests/performance.spec.js ./tests/
COPY --from=development /app/utils/performanceMonitor.js ./utils/

# Set environment variables
ENV CI=true
ENV NODE_ENV=performance

# Run performance tests
CMD ["npm", "run", "test:performance"]

# Data management stage
FROM production as data-management

# Copy data management files
COPY --from=development /app/tests/testDataManagement.spec.js ./tests/
COPY --from=development /app/utils/testDataManager.js ./utils/
COPY --from=development /app/fixtures/dataDrivenFixture.js ./fixtures/

# Set environment variables
ENV CI=true
ENV NODE_ENV=test

# Run data management tests
CMD ["npm", "run", "test:data-management"]
