# Workspace configuration to isolate this project
# This ensures no conflicts with other Terraform projects

# Local values for project isolation
locals {
  project_name = "scm-max-react-app"
  workspace_id = "${var.project_name}-${var.environment}-${random_id.workspace.hex}"
}

# Random ID for workspace isolation
resource "random_id" "workspace" {
  byte_length = 4
}

# Workspace-specific tags
locals {
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    Workspace   = local.workspace_id
    ManagedBy   = "terraform"
    CreatedBy   = "scm-max-team"
  }
}
