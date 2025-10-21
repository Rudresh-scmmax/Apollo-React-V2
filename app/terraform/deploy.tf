# Deployment and Invalidation Resources

# Local file for deployment tracking
resource "local_file" "deployment_info" {
  content = jsonencode({
    deployment_timestamp = timestamp()
    website_url         = "https://${aws_cloudfront_distribution.website.domain_name}"
    cloudfront_id       = aws_cloudfront_distribution.website.id
    s3_bucket          = data.aws_s3_bucket.website.bucket
    api_url            = var.api_url
    region             = var.aws_region
  })
  filename = "${path.module}/deployment-info.json"
}

# Note: CloudFront invalidation is handled in the deployment script
# using aws cloudfront create-invalidation command

