# Outputs for SCM-MAX React Application Infrastructure

output "website_url" {
  description = "Complete website URL with HTTPS"
  value       = "https://${aws_cloudfront_distribution.website.domain_name}"
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.website.domain_name
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID for cache invalidation"
  value       = aws_cloudfront_distribution.website.id
}

output "cloudfront_arn" {
  description = "CloudFront distribution ARN"
  value       = aws_cloudfront_distribution.website.arn
}

output "s3_bucket_name" {
  description = "S3 bucket name for file uploads"
  value       = data.aws_s3_bucket.website.bucket
}

output "s3_bucket_arn" {
  description = "S3 bucket ARN"
  value       = data.aws_s3_bucket.website.arn
}

output "s3_bucket_domain_name" {
  description = "S3 bucket domain name"
  value       = data.aws_s3_bucket.website.bucket_domain_name
}

output "origin_access_control_id" {
  description = "Origin Access Control ID"
  value       = aws_cloudfront_origin_access_control.website.id
}

output "api_url" {
  description = "Backend API URL"
  value       = var.api_url
}

output "deployment_summary" {
  description = "Deployment summary information"
  value = {
    website_url           = "https://${aws_cloudfront_distribution.website.domain_name}"
    cloudfront_id         = aws_cloudfront_distribution.website.id
    s3_bucket            = data.aws_s3_bucket.website.bucket
    api_url              = var.api_url
    region               = var.aws_region
    deployment_timestamp = timestamp()
  }
}
