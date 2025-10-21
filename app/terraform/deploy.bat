@echo off
REM SCM-MAX React Application - Terraform Deployment Script (Windows)

echo 🚀 SCM-MAX React Application - Terraform Deployment
echo ==================================================

REM Check prerequisites
echo 📋 Checking prerequisites...

where terraform >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Terraform is not installed. Please install Terraform ^>= 1.0
    exit /b 1
)

where aws >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ AWS CLI is not installed. Please install AWS CLI
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install Node.js and npm
    exit /b 1
)

aws sts get-caller-identity >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ AWS credentials not configured. Please run 'aws configure'
    exit /b 1
)

echo ✅ All prerequisites met!

REM Initialize Terraform with local state
echo 🏗️ Initializing Terraform...
terraform init -backend=false
if %errorlevel% neq 0 (
    echo ❌ Failed to initialize Terraform
    exit /b 1
)

REM Plan deployment
echo 📋 Planning deployment...
terraform plan -out=tfplan
if %errorlevel% neq 0 (
    echo ❌ Failed to create deployment plan
    exit /b 1
)

REM Deploy infrastructure
echo 🚀 Deploying infrastructure...
terraform apply -auto-approve tfplan
if %errorlevel% neq 0 (
    echo ❌ Failed to deploy infrastructure
    exit /b 1
)

REM Build React application
echo 📦 Building React application...
cd ..
call npm run build:aws
if %errorlevel% neq 0 (
    echo ❌ Failed to build React application
    exit /b 1
)
cd terraform

REM Upload to S3
echo 📤 Uploading files to existing S3 bucket...
for /f "tokens=*" %%i in ('terraform output -raw s3_bucket_name') do set BUCKET_NAME=%%i
echo 🪣 Using bucket: %BUCKET_NAME%
aws s3 sync ..\..\build\ s3://%BUCKET_NAME% --delete
if %errorlevel% neq 0 (
    echo ❌ Failed to upload files to S3
    exit /b 1
)

REM Invalidate CloudFront cache
echo 🔄 Invalidating CloudFront cache...
for /f "tokens=*" %%i in ('terraform output -raw cloudfront_distribution_id') do set DISTRIBUTION_ID=%%i
aws cloudfront create-invalidation --distribution-id %DISTRIBUTION_ID% --paths "/*"
if %errorlevel% neq 0 (
    echo ⚠️ Failed to invalidate CloudFront cache (non-critical)
)

REM Display deployment summary
echo.
echo 🎉 Deployment Complete!
echo =====================
echo.
for /f "tokens=*" %%i in ('terraform output -raw website_url') do echo 🌐 Website URL: %%i
for /f "tokens=*" %%i in ('terraform output -raw cloudfront_distribution_id') do echo 📊 CloudFront ID: %%i
for /f "tokens=*" %%i in ('terraform output -raw s3_bucket_name') do echo 🪣 S3 Bucket: %%i
for /f "tokens=*" %%i in ('terraform output -raw api_url') do echo 🔗 API URL: %%i
echo.
echo 📋 Next Steps:
echo 1. Test your application at the URL above
echo 2. Configure CORS on your backend API
echo 3. Set up monitoring and alerts
echo.

pause
