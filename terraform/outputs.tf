output "ec2_public_ip" {
  description = "Public IP address of the deployed EC2 instance"
  value       = aws_instance.web.public_ip
}

output "ec2_public_dns" {
  description = "Public DNS of the EC2 instance"
  value       = aws_instance.web.public_dns
}

output "app_url" {
  description = "Direct URL to access the deployed CareerLens web application"
  value       = "http://${aws_instance.web.public_ip}"
}

output "cognito_user_pool_id" {
  description = "Cognito User Pool ID"
  value       = aws_cognito_user_pool.auth.id
}

output "cognito_client_id" {
  description = "Cognito App Client ID (without client secret)"
  value       = aws_cognito_user_pool_client.web.id
}

output "ssh_command" {
  description = "Command to SSH into the EC2 instance"
  value       = "ssh -i <YOUR_KEY_FILE>.pem ubuntu@${aws_instance.web.public_ip}"
}

output "env_file_template" {
  description = "Ready-to-use .env configuration for the EC2 instance"
  value       = <<-EOT
    # ==========================================================
    # Copy this into the .env file on your EC2 instance:
    # ==========================================================
    NODE_ENV=production
    AWS_REGION=${var.aws_region}
    NEXT_PUBLIC_AWS_REGION=${var.aws_region}
    
    NEXT_PUBLIC_COGNITO_USER_POOL_ID=${aws_cognito_user_pool.auth.id}
    NEXT_PUBLIC_COGNITO_CLIENT_ID=${aws_cognito_user_pool_client.web.id}
    
    DYNAMODB_TABLE_USERS=CareerLens_Users
    DYNAMODB_TABLE_ACTIVITIES=CareerLens_Activities
    DYNAMODB_TABLE_GRAPHS=CareerLens_CareerGraphs
    DYNAMODB_TABLE_COLLEGES=CareerLens_Colleges
    DYNAMODB_TABLE_UPDATES=CareerLens_CareerUpdates
    DYNAMODB_TABLE_MARKET_DATA=CareerLens_MarketData
    DYNAMODB_TABLE_RESOURCES=CareerLens_Resources
    DYNAMODB_TABLE_REVIEWS=CareerLens_Reviews
    
    REDIS_HOST=redis
    REDIS_PORT=6379
    JWT_SECRET=super_secure_jwt_careerlens_prod_key
    
    # Fill in your external API keys:
    AWS_ACCESS_KEY_ID=
    AWS_SECRET_ACCESS_KEY=
    NEXT_PUBLIC_GEMINI_API_KEY=
    GOOGLE_GENAI_API_KEY=
  EOT
}
