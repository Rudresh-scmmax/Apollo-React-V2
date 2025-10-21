#!/bin/bash
# SCM-MAX React Application - Terraform Deployment Script

set -e  # Exit on any error

echo "🚀 SCM-MAX React Application - Terraform Deployment"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if terraform is installed
    if ! command -v terraform &> /dev/null; then
        print_error "Terraform is not installed. Please install Terraform >= 1.0"
        exit 1
    fi
    
    # Check if aws cli is installed
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install AWS CLI"
        exit 1
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install Node.js and npm"
        exit 1
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials not configured. Please run 'aws configure'"
        exit 1
    fi
    
    print_success "All prerequisites met!"
}

# Initialize Terraform
init_terraform() {
    print_status "Initializing Terraform..."
    terraform init
    print_success "Terraform initialized!"
}

# Plan deployment
plan_deployment() {
    print_status "Planning Terraform deployment..."
    terraform plan -out=tfplan
    print_success "Deployment plan created!"
}

# Deploy infrastructure
deploy_infrastructure() {
    print_status "Deploying infrastructure..."
    terraform apply -auto-approve tfplan
    print_success "Infrastructure deployed!"
}

# Build React application
build_application() {
    print_status "Building React application..."
    cd ..
    npm run build:aws
    if [ $? -eq 0 ]; then
        print_success "React application built successfully!"
    else
        print_error "Failed to build React application"
        exit 1
    fi
    cd terraform
}

# Upload to S3
upload_to_s3() {
    print_status "Uploading files to S3..."
    BUCKET_NAME=$(terraform output -raw s3_bucket_name)
    aws s3 sync ../build/ s3://$BUCKET_NAME --delete
    print_success "Files uploaded to S3!"
}

# Invalidate CloudFront cache
invalidate_cache() {
    print_status "Invalidating CloudFront cache..."
    DISTRIBUTION_ID=$(terraform output -raw cloudfront_distribution_id)
    aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"
    print_success "CloudFront cache invalidated!"
}

# Display deployment summary
show_summary() {
    echo ""
    echo "🎉 Deployment Complete!"
    echo "====================="
    echo ""
    echo "🌐 Website URL: $(terraform output -raw website_url)"
    echo "📊 CloudFront ID: $(terraform output -raw cloudfront_distribution_id)"
    echo "🪣 S3 Bucket: $(terraform output -raw s3_bucket_name)"
    echo "🔗 API URL: $(terraform output -raw api_url)"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Test your application at the URL above"
    echo "2. Configure CORS on your backend API"
    echo "3. Set up monitoring and alerts"
    echo ""
}

# Main deployment function
main() {
    check_prerequisites
    init_terraform
    plan_deployment
    deploy_infrastructure
    build_application
    upload_to_s3
    invalidate_cache
    show_summary
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "destroy")
        print_warning "This will destroy all infrastructure!"
        read -p "Are you sure? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            terraform destroy -auto-approve
            print_success "Infrastructure destroyed!"
        else
            print_status "Destruction cancelled."
        fi
        ;;
    "plan")
        check_prerequisites
        init_terraform
        terraform plan
        ;;
    "output")
        terraform output
        ;;
    "help")
        echo "Usage: $0 [deploy|destroy|plan|output|help]"
        echo ""
        echo "Commands:"
        echo "  deploy  - Deploy infrastructure and application (default)"
        echo "  destroy - Destroy all infrastructure"
        echo "  plan    - Show deployment plan"
        echo "  output  - Show Terraform outputs"
        echo "  help    - Show this help message"
        ;;
    *)
        print_error "Unknown command: $1"
        echo "Use '$0 help' for available commands"
        exit 1
        ;;
esac
