# SCM-MAX React Application - Terraform Infrastructure

This Terraform configuration deploys a complete infrastructure for the SCM-MAX React application on AWS, including S3, CloudFront, and automatic cache invalidation.

## 🔒 Project Isolation

This Terraform configuration is designed to be completely isolated from your other Terraform projects:
- ✅ **Unique workspace ID**: Prevents resource conflicts
- ✅ **Isolated state**: Separate state file
- ✅ **Project-specific tags**: Easy resource identification
- ✅ **No global dependencies**: Self-contained configuration

## 🏗️ Infrastructure Components

- **Existing S3 Bucket**: Uses `scm-max-react-app-v2` bucket for static website hosting
- **CloudFront Distribution**: Global CDN with HTTPS
- **Origin Access Control**: Secure S3 access
- **Custom Error Pages**: React Router support
- **Automatic Invalidation**: Cache clearing on deployment

## 🚀 Quick Start

### Prerequisites

1. **Terraform installed** (>= 1.0)
2. **AWS CLI configured** with appropriate permissions
3. **Node.js and npm** for building the React app

### Step 1: Initialize Project

```bash
# Initialize with project isolation
cd terraform
./init.sh  # Linux/Mac
# or
init.bat   # Windows
```

### Step 2: Configure Variables

```bash
# Variables are pre-configured in terraform.tfvars
# Edit if needed for your environment
nano terraform.tfvars
```

### Step 3: Deploy Infrastructure

```bash
# Plan the deployment
terraform plan

# Deploy the infrastructure
terraform apply
```

### Step 3: Build and Deploy Application

```bash
# Build the React app
cd ..
npm run build:aws

# Upload files to S3
aws s3 sync ../build/ s3://$(terraform output -raw s3_bucket_name) --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id $(terraform output -raw cloudfront_distribution_id) --paths "/*"
```

## 📋 Configuration Options

### Variables (terraform.tfvars)

```hcl
# Required
bucket_name = "your-unique-bucket-name"
api_url     = "http://your-backend-api.com"

# Optional
aws_region    = "us-east-1"
domain_name   = "your-domain.com"
price_class   = "PriceClass_100"
environment   = "production"
```

### Custom Domain Setup

To use a custom domain:

1. **Add domain to variables**:
   ```hcl
   domain_name = "your-domain.com"
   ```

2. **Request SSL certificate** in AWS Certificate Manager

3. **Update CloudFront distribution** with certificate

## 🔧 Outputs

After deployment, you'll get:

- **website_url**: Complete HTTPS URL for your application
- **cloudfront_distribution_id**: For cache invalidation
- **s3_bucket_name**: For file uploads
- **deployment_summary**: Complete deployment information

## 🚀 Deployment Script

Create a deployment script:

```bash
#!/bin/bash
# deploy.sh

echo "🏗️ Deploying infrastructure..."
terraform apply -auto-approve

echo "📦 Building React application..."
npm run build:aws

echo "📤 Uploading to S3..."
aws s3 sync ../build/ s3://$(terraform output -raw s3_bucket_name) --delete

echo "🔄 Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id $(terraform output -raw cloudfront_distribution_id) --paths "/*"

echo "✅ Deployment complete!"
echo "🌐 Website URL: $(terraform output -raw website_url)"
```

## 🔄 Cache Invalidation

### Automatic Invalidation
Terraform automatically creates invalidation on deployment.

### Manual Invalidation
```bash
# Invalidate specific paths
aws cloudfront create-invalidation --distribution-id $(terraform output -raw cloudfront_distribution_id) --paths "/index.html" "/assets/*"

# Invalidate everything
aws cloudfront create-invalidation --distribution-id $(terraform output -raw cloudfront_distribution_id) --paths "/*"
```

## 🏷️ Cost Optimization

### Price Classes
- **PriceClass_All**: Global (most expensive)
- **PriceClass_200**: US, Europe, Asia, Middle East, Africa
- **PriceClass_100**: US, Canada, Europe (recommended)

### Cache Settings
- **Default TTL**: 24 hours
- **Max TTL**: 1 year
- **Compression**: Enabled

## 🔒 Security Features

- **Origin Access Control**: Secure S3 access
- **HTTPS Only**: Automatic SSL redirect
- **No Public S3 Access**: CloudFront only
- **Proper CORS**: Configured for API access

## 📊 Monitoring

### CloudWatch Metrics
- Cache hit ratio
- Request count
- Error rates
- Data transfer

### Alarms
Set up CloudWatch alarms for:
- High error rates
- Low cache hit ratio
- Unusual traffic patterns

## 🧹 Cleanup

To destroy the infrastructure:

```bash
terraform destroy
```

**Warning**: This will delete all resources including the S3 bucket and all files.

## 🐛 Troubleshooting

### Common Issues

1. **Bucket name conflicts**: Use a globally unique bucket name
2. **Permission errors**: Ensure AWS credentials have required permissions
3. **Cache issues**: Use invalidation to clear CloudFront cache
4. **CORS errors**: Check backend API CORS configuration

### Debug Commands

```bash
# Check Terraform state
terraform show

# List all resources
terraform state list

# Get specific output
terraform output website_url

# Validate configuration
terraform validate
```

## 📚 Additional Resources

- [Terraform AWS Provider Documentation](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [S3 Static Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
