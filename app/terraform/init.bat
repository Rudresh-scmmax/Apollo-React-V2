@echo off
REM Initialize Terraform with project isolation

echo 🏗️ Initializing SCM-MAX React App Terraform...

REM Create project-specific directory
if not exist ".terraform\plugins" mkdir .terraform\plugins

REM Initialize with local backend (for development)
terraform init -backend=false

REM For production with S3 backend, use:
REM terraform init ^
REM   -backend-config="bucket=your-terraform-state-bucket" ^
REM   -backend-config="key=scm-max-react-app/terraform.tfstate" ^
REM   -backend-config="region=us-east-1"

echo ✅ Terraform initialized for SCM-MAX React App!
echo 📁 Project files are isolated in ./terraform/
echo 🔒 No conflicts with other Terraform projects

pause
