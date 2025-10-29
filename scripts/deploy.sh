#!/bin/bash

# Deployment script for Playwright Test Framework
# Usage: ./scripts/deploy.sh [environment] [options]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT=${1:-staging}
DOCKER_IMAGE=${2:-playwright-test-framework}
VERSION=${3:-latest}
REGISTRY=${4:-ghcr.io}
NAMESPACE=${5:-default}

# Configuration
DOCKER_TAG="${REGISTRY}/${DOCKER_IMAGE}:${VERSION}"
HELM_CHART_PATH="./helm/playwright-framework"
VALUES_FILE="./helm/values-${ENVIRONMENT}.yaml"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed or not in PATH"
    fi
    
    # Check if kubectl is installed (for Kubernetes deployment)
    if ! command -v kubectl &> /dev/null; then
        warning "kubectl is not installed. Kubernetes deployment will be skipped."
    fi
    
    # Check if helm is installed (for Helm deployment)
    if ! command -v helm &> /dev/null; then
        warning "helm is not installed. Helm deployment will be skipped."
    fi
    
    success "Prerequisites check completed"
}

# Build Docker image
build_image() {
    log "Building Docker image: ${DOCKER_TAG}"
    
    # Build the image
    docker build -t "${DOCKER_TAG}" .
    
    if [ $? -eq 0 ]; then
        success "Docker image built successfully"
    else
        error "Failed to build Docker image"
    fi
}

# Push Docker image
push_image() {
    log "Pushing Docker image to registry..."
    
    # Login to registry (if needed)
    if [ "${REGISTRY}" != "docker.io" ]; then
        log "Logging in to registry: ${REGISTRY}"
        echo "${DOCKER_PASSWORD}" | docker login "${REGISTRY}" -u "${DOCKER_USERNAME}" --password-stdin
    fi
    
    # Push the image
    docker push "${DOCKER_TAG}"
    
    if [ $? -eq 0 ]; then
        success "Docker image pushed successfully"
    else
        error "Failed to push Docker image"
    fi
}

# Run tests
run_tests() {
    log "Running tests..."
    
    # Run unit tests
    npm test
    
    # Run integration tests
    npm run test:integration
    
    # Run performance tests
    npm run test:performance
    
    success "All tests passed"
}

# Deploy to Kubernetes
deploy_kubernetes() {
    log "Deploying to Kubernetes..."
    
    # Check if kubectl is available
    if ! command -v kubectl &> /dev/null; then
        warning "kubectl not available. Skipping Kubernetes deployment."
        return
    fi
    
    # Create namespace if it doesn't exist
    kubectl create namespace "${NAMESPACE}" --dry-run=client -o yaml | kubectl apply -f -
    
    # Apply Kubernetes manifests
    kubectl apply -f "./k8s/namespace.yaml"
    kubectl apply -f "./k8s/configmap.yaml"
    kubectl apply -f "./k8s/secret.yaml"
    kubectl apply -f "./k8s/deployment.yaml"
    kubectl apply -f "./k8s/service.yaml"
    kubectl apply -f "./k8s/ingress.yaml"
    
    # Wait for deployment to be ready
    kubectl wait --for=condition=available --timeout=300s deployment/playwright-framework -n "${NAMESPACE}"
    
    success "Kubernetes deployment completed"
}

# Deploy with Helm
deploy_helm() {
    log "Deploying with Helm..."
    
    # Check if helm is available
    if ! command -v helm &> /dev/null; then
        warning "helm not available. Skipping Helm deployment."
        return
    fi
    
    # Check if values file exists
    if [ ! -f "${VALUES_FILE}" ]; then
        error "Values file not found: ${VALUES_FILE}"
    fi
    
    # Deploy with Helm
    helm upgrade --install playwright-framework "${HELM_CHART_PATH}" \
        --namespace "${NAMESPACE}" \
        --create-namespace \
        --values "${VALUES_FILE}" \
        --set image.repository="${DOCKER_TAG}" \
        --set environment="${ENVIRONMENT}"
    
    success "Helm deployment completed"
}

# Deploy with Docker Compose
deploy_compose() {
    log "Deploying with Docker Compose..."
    
    # Stop existing containers
    docker-compose down
    
    # Start services
    docker-compose up -d
    
    # Wait for services to be healthy
    docker-compose ps
    
    success "Docker Compose deployment completed"
}

# Run smoke tests
run_smoke_tests() {
    log "Running smoke tests..."
    
    # Wait for services to be ready
    sleep 30
    
    # Run smoke tests
    npm run test:smoke
    
    success "Smoke tests passed"
}

# Rollback deployment
rollback() {
    log "Rolling back deployment..."
    
    if command -v kubectl &> /dev/null; then
        kubectl rollout undo deployment/playwright-framework -n "${NAMESPACE}"
        kubectl rollout status deployment/playwright-framework -n "${NAMESPACE}"
    elif command -v helm &> /dev/null; then
        helm rollback playwright-framework -n "${NAMESPACE}"
    else
        docker-compose down
        docker-compose up -d
    fi
    
    success "Rollback completed"
}

# Cleanup
cleanup() {
    log "Cleaning up..."
    
    # Remove unused Docker images
    docker image prune -f
    
    # Remove unused containers
    docker container prune -f
    
    success "Cleanup completed"
}

# Main deployment function
deploy() {
    log "Starting deployment to ${ENVIRONMENT} environment..."
    
    # Check prerequisites
    check_prerequisites
    
    # Run tests
    run_tests
    
    # Build and push image
    build_image
    push_image
    
    # Deploy based on available tools
    if command -v kubectl &> /dev/null && command -v helm &> /dev/null; then
        deploy_helm
    elif command -v kubectl &> /dev/null; then
        deploy_kubernetes
    else
        deploy_compose
    fi
    
    # Run smoke tests
    run_smoke_tests
    
    # Cleanup
    cleanup
    
    success "Deployment to ${ENVIRONMENT} completed successfully!"
}

# Handle command line arguments
case "${1:-deploy}" in
    "deploy")
        deploy
        ;;
    "rollback")
        rollback
        ;;
    "test")
        run_tests
        ;;
    "smoke")
        run_smoke_tests
        ;;
    "cleanup")
        cleanup
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [command] [environment] [options]"
        echo ""
        echo "Commands:"
        echo "  deploy    Deploy the application (default)"
        echo "  rollback  Rollback the deployment"
        echo "  test      Run tests only"
        echo "  smoke     Run smoke tests only"
        echo "  cleanup   Cleanup resources"
        echo "  help      Show this help message"
        echo ""
        echo "Environment: staging, production (default: staging)"
        echo ""
        echo "Examples:"
        echo "  $0 deploy staging"
        echo "  $0 rollback production"
        echo "  $0 test"
        ;;
    *)
        error "Unknown command: $1"
        ;;
esac
