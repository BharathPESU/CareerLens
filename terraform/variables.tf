variable "aws_region" {
  description = "AWS region to deploy resources in"
  type        = string
  default     = "us-east-1"
}

variable "app_name" {
  description = "Application name prefix for all AWS resources"
  type        = string
  default     = "careerlens"
}

variable "environment" {
  description = "Environment name (e.g. prod, dev)"
  type        = string
  default     = "prod"
}

variable "instance_type" {
  description = "EC2 instance type (Free Tier eligible: t3.micro or t2.micro)"
  type        = string
  default     = "t3.micro"
}

variable "key_name" {
  description = "Name of an existing AWS Key Pair for SSH access (leave empty if creating a new one with public_key)"
  type        = string
  default     = ""
}

variable "public_key" {
  description = "Optional SSH public key (e.g. contents of ~/.ssh/id_rsa.pub or ~/.ssh/id_ed25519.pub) to create a new key pair automatically"
  type        = string
  default     = ""
}
