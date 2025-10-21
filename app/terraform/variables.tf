# Variables for SCM-MAX React Application Infrastructure

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "bucket_name" {
  description = "S3 bucket name for hosting the React app (must be globally unique)"
  type        = string
  default     = "scm-max-react-app-v2"
}

variable "domain_name" {
  description = "Optional custom domain name for the application"
  type        = string
  default     = ""
}

variable "api_url" {
  description = "Backend API URL"
  type        = string
  default     = "http://apollo-v2-alb-977636636.us-east-1.elb.amazonaws.com"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Project name for tagging"
  type        = string
  default     = "scm-max"
}

variable "price_class" {
  description = "CloudFront price class"
  type        = string
  default     = "PriceClass_100"
  validation {
    condition = contains(["PriceClass_All", "PriceClass_200", "PriceClass_100"], var.price_class)
    error_message = "Price class must be one of: PriceClass_All, PriceClass_200, PriceClass_100."
  }
}

variable "enable_https" {
  description = "Enable HTTPS for the distribution"
  type        = bool
  default     = true
}

variable "cache_ttl" {
  description = "Default cache TTL in seconds"
  type        = number
  default     = 86400
}

variable "tags" {
  description = "Additional tags for resources"
  type        = map(string)
  default     = {}
}
