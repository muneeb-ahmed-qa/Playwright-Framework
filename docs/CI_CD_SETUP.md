# CI/CD Setup Guide

This guide covers the complete CI/CD setup for the Playwright Test Framework, including GitHub Actions, Docker containerization, Kubernetes deployment, and Helm charts.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker
- kubectl (for Kubernetes)
- Helm (for Helm charts)
- GitHub repository with Actions enabled

### Basic Setup

1. **Clone and install dependencies:**
   ```bash
   git clone <your-repo>
   cd playwright-automation-framework
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Run tests locally:**
   ```bash
   npm test
   ```

## 🔧 GitHub Actions

### Workflows Overview

- **`ci.yml`** - Continuous Integration pipeline
- **`cd.yml`** - Continuous Deployment pipeline  
- **`security.yml`** - Security scanning pipeline

### CI Pipeline Features

- **Multi-browser testing** (Chromium, Firefox, WebKit)
- **Multi-Node.js version testing** (18, 20)
- **Parallel test execution**
- **Performance testing**
- **Data management testing**
- **Security scanning**
- **Test result reporting**

### CD Pipeline Features

- **Multi-environment deployment** (staging, production)
- **Docker image building and pushing**
- **Kubernetes deployment**
- **Helm chart deployment**
- **Smoke testing**
- **Rollback capabilities**
- **Slack notifications**

### Setting up GitHub Actions

1. **Enable GitHub Actions** in your repository settings

2. **Set up secrets** in repository settings:
   ```
   DOCKER_USERNAME - Docker registry username
   DOCKER_PASSWORD - Docker registry password
   SLACK_WEBHOOK - Slack webhook URL for notifications
   SEMGREP_APP_TOKEN - Semgrep security scanning token
   ```

3. **Configure environment protection rules:**
   - Set up staging and production environments
   - Add required reviewers for production deployments
   - Configure deployment branches

## 🐳 Docker Setup

### Multi-stage Dockerfile

The Dockerfile includes multiple stages for different use cases:

- **`base`** - Base image with system dependencies
- **`development`** - Development environment with dev dependencies
- **`production`** - Production-ready image
- **`test-runner`** - Test execution environment
- **`performance`** - Performance testing environment
- **`data-management`** - Data management testing environment

### Building Images

```bash
# Build all stages
docker build -t playwright-test-framework .

# Build specific stage
docker build --target production -t playwright-test-framework:prod .

# Build with build args
docker build --build-arg NODE_ENV=production -t playwright-test-framework .
```

### Running Containers

```bash
# Run basic container
docker run -p 9323:9323 playwright-test-framework

# Run with environment variables
docker run -e NODE_ENV=test -e CI=true playwright-test-framework

# Run with volume mounts
docker run -v $(pwd)/test-results:/app/test-results playwright-test-framework
```

### Docker Compose

```bash
# Start all services
docker-compose up -d

# Start specific services
docker-compose up -d playwright-tests test-app

# View logs
docker-compose logs -f playwright-tests

# Stop services
docker-compose down
```

## ☸️ Kubernetes Deployment

### Prerequisites

- Kubernetes cluster (local or cloud)
- kubectl configured
- Persistent volume provisioner (e.g., NFS)

### Deploy to Kubernetes

1. **Apply manifests:**
   ```bash
   kubectl apply -f k8s/
   ```

2. **Check deployment status:**
   ```bash
   kubectl get pods -n playwright-framework
   kubectl get services -n playwright-framework
   ```

3. **View logs:**
   ```bash
   kubectl logs -f deployment/playwright-framework -n playwright-framework
   ```

4. **Access the application:**
   ```bash
   kubectl port-forward service/playwright-framework-service 8080:80 -n playwright-framework
   ```

### Customizing Kubernetes Deployment

Edit the following files for your environment:

- **`k8s/configmap.yaml`** - Environment configuration
- **`k8s/secret.yaml`** - Secrets (base64 encoded)
- **`k8s/deployment.yaml`** - Deployment configuration
- **`k8s/service.yaml`** - Service configuration
- **`k8s/ingress.yaml`** - Ingress configuration
- **`k8s/pvc.yaml`** - Persistent volume claims

## 🎯 Helm Charts

### Prerequisites

- Helm 3.x installed
- Kubernetes cluster
- PostgreSQL and Redis (optional, can be deployed with Helm)

### Deploy with Helm

1. **Install dependencies:**
   ```bash
   helm dependency update ./helm/playwright-framework
   ```

2. **Deploy to staging:**
   ```bash
   helm install playwright-framework ./helm/playwright-framework \
     --namespace playwright-framework \
     --create-namespace \
     --values ./helm/values-staging.yaml
   ```

3. **Deploy to production:**
   ```bash
   helm install playwright-framework ./helm/playwright-framework \
     --namespace playwright-framework \
     --create-namespace \
     --values ./helm/values-production.yaml
   ```

4. **Upgrade deployment:**
   ```bash
   helm upgrade playwright-framework ./helm/playwright-framework \
     --values ./helm/values-production.yaml
   ```

5. **Uninstall:**
   ```bash
   helm uninstall playwright-framework
   ```

### Helm Values Configuration

- **`values.yaml`** - Default values
- **`values-staging.yaml`** - Staging environment
- **`values-production.yaml`** - Production environment

Key configuration options:

```yaml
# Replica count
replicaCount: 3

# Image configuration
image:
  repository: ghcr.io/your-username/playwright-test-framework
  tag: "latest"
  pullPolicy: IfNotPresent

# Resource limits
resources:
  limits:
    cpu: 1000m
    memory: 2Gi
  requests:
    cpu: 250m
    memory: 512Mi

# Autoscaling
autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10
  targetCPUUtilizationPercentage: 80

# Environment variables
env:
  NODE_ENV: "production"
  BASE_URL: "https://your-app.com"
  API_BASE_URL: "https://api.your-app.com"
```

## 🚀 Deployment Scripts

### Using the Deployment Script

```bash
# Deploy to staging
./scripts/deploy.sh deploy staging

# Deploy to production
./scripts/deploy.sh deploy production

# Rollback deployment
./scripts/deploy.sh rollback

# Run tests only
./scripts/deploy.sh test

# Run smoke tests
./scripts/deploy.sh smoke

# Cleanup resources
./scripts/deploy.sh cleanup
```

### Script Features

- **Automatic prerequisite checking**
- **Multi-platform deployment** (Kubernetes, Docker Compose)
- **Smoke testing**
- **Rollback capabilities**
- **Resource cleanup**
- **Colored output and logging**

## 🔒 Security

### Security Scanning

The security pipeline includes:

- **Dependency vulnerability scanning** (npm audit, audit-ci)
- **Code security scanning** (ESLint security rules, Semgrep)
- **Container security scanning** (Trivy)
- **Secrets scanning** (TruffleHog)
- **License compliance scanning**

### Security Configuration

1. **ESLint security rules** (`.eslintrc.security.js`)
2. **Audit configuration** (`.audit-ci.json`)
3. **Container scanning** (Trivy)
4. **Secrets management** (Kubernetes secrets, GitHub secrets)

## 📊 Monitoring and Observability

### Health Checks

- **Liveness probe** - Container health
- **Readiness probe** - Service readiness
- **Startup probe** - Application startup

### Metrics and Logging

- **Prometheus metrics** (if monitoring enabled)
- **Structured logging**
- **Test result reporting**
- **Performance metrics**

### Alerting

- **Slack notifications** for deployments
- **GitHub status checks**
- **Email notifications** (configurable)

## 🧪 Testing in CI/CD

### Test Types

1. **Unit Tests** - Fast, isolated tests
2. **Integration Tests** - API and service integration
3. **E2E Tests** - Full user journey tests
4. **Performance Tests** - Load and performance testing
5. **Smoke Tests** - Basic functionality verification

### Test Execution

```bash
# Run all tests
npm test

# Run specific test types
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:performance
npm run test:smoke

# Run tests in parallel
npm run test:parallel
```

### Test Reporting

- **HTML reports** (Playwright HTML reporter)
- **JUnit XML** (for CI integration)
- **JSON reports** (for programmatic processing)
- **Screenshots and videos** (on failure)

## 🔄 Environment Management

### Environment Configuration

Each environment has its own configuration:

- **Development** - Local development
- **Staging** - Pre-production testing
- **Production** - Live environment

### Environment Variables

```bash
# Development
NODE_ENV=development
BASE_URL=http://localhost:3000

# Staging
NODE_ENV=staging
BASE_URL=https://staging.your-app.com

# Production
NODE_ENV=production
BASE_URL=https://your-app.com
```

## 🛠️ Troubleshooting

### Common Issues

1. **Docker build failures**
   - Check Dockerfile syntax
   - Verify base image availability
   - Check resource limits

2. **Kubernetes deployment issues**
   - Check pod logs: `kubectl logs <pod-name>`
   - Verify resource quotas
   - Check persistent volume claims

3. **Helm deployment issues**
   - Check values file syntax
   - Verify chart dependencies
   - Check namespace permissions

4. **Test failures in CI**
   - Check test environment setup
   - Verify test data availability
   - Check browser installation

### Debug Commands

```bash
# Docker
docker logs <container-id>
docker exec -it <container-id> /bin/bash

# Kubernetes
kubectl describe pod <pod-name>
kubectl logs -f <pod-name>
kubectl exec -it <pod-name> -- /bin/bash

# Helm
helm status <release-name>
helm get values <release-name>
helm rollback <release-name> <revision>
```

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Helm Documentation](https://helm.sh/docs/)
- [Playwright Documentation](https://playwright.dev/)

## 🤝 Contributing

When contributing to CI/CD configurations:

1. Test changes in a development environment
2. Update documentation
3. Follow security best practices
4. Use semantic versioning for releases
5. Update changelog

## 📄 License

This CI/CD setup is part of the Playwright Test Framework and follows the same license terms.