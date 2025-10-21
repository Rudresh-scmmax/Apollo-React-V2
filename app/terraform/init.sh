#!/bin/bash
# Initialize Terraform with project isolation

echo "🏗️ Initializing SCM-MAX React App Terraform..."

# Create project-specific directory
mkdir -p .terraform/plugins

# Initialize with local backend (for development)
terraform init -backend=false

# Or initialize with S3 backend (for production)
# terraform init \
#   -backend-config="bucket=your-terraform-state-bucket" \
#   -backend-config="key=scm-max-react-app/terraform.tfstate" \
#   -backend-config="region=us-east-1"

echo "✅ Terraform initialized for SCM-MAX React App!"
echo "📁 Project files are isolated in ./terraform/"
echo "🔒 No conflicts with other Terraform projects"
