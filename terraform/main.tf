terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# ==============================================================================
# 1. NETWORKING (Default VPC & Security Group)
# ==============================================================================

data "aws_vpc" "default" {
  default = true
}

resource "aws_security_group" "app_sg" {
  name        = "${var.app_name}-${var.environment}-sg"
  description = "Security group for CareerLens Web and Socket servers"
  vpc_id      = data.aws_vpc.default.id

  # SSH
  ingress {
    description = "SSH access"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTP
  ingress {
    description = "HTTP web traffic"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS
  ingress {
    description = "HTTPS web traffic"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Next.js Port 3000
  ingress {
    description = "Next.js Web Server"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Socket.IO Port 3001
  ingress {
    description = "Socket.IO Realtime Server"
    from_port   = 3001
    to_port     = 3001
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Outbound traffic (allow all)
  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  tags = {
    Name = "${var.app_name}-${var.environment}-sg"
  }
}

# ==============================================================================
# 2. AMAZON COGNITO (50,000 MAUs Always Free)
# ==============================================================================

resource "aws_cognito_user_pool" "auth" {
  name = "${var.app_name}-${var.environment}-user-pool"

  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  password_policy {
    minimum_length    = 8
    require_lowercase = false
    require_numbers   = true
    require_symbols   = false
    require_uppercase = false
  }

  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
    email_subject        = "Your CareerLens Verification Code"
    email_message        = "Your verification code for CareerLens is {####}."
  }

  schema {
    attribute_data_type = "String"
    name                = "email"
    required            = true
    mutable             = true
  }

  tags = {
    Name        = "${var.app_name}-user-pool"
    Environment = var.environment
  }
}

resource "aws_cognito_user_pool_client" "web" {
  name         = "${var.app_name}-web-client"
  user_pool_id = aws_cognito_user_pool.auth.id

  # Critical: Client-side Single Page Apps must not have a client secret
  generate_secret = false

  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_SRP_AUTH"
  ]

  prevent_user_existence_errors = "ENABLED"
}

# ==============================================================================
# 3. AMAZON DYNAMODB TABLES (Strictly AWS Free Tier: 1 RCU / 1 WCU per table)
# ==============================================================================

locals {
  tables = {
    "CareerLens_Users" = {
      hash_key = "userId"
    }
    "CareerLens_Activities" = {
      hash_key = "id"
    }
    "CareerLens_CareerGraphs" = {
      hash_key = "id"
    }
    "CareerLens_Colleges" = {
      hash_key = "id"
    }
    "CareerLens_CareerUpdates" = {
      hash_key = "id"
    }
    "CareerLens_MarketData" = {
      hash_key = "id"
    }
    "CareerLens_Resources" = {
      hash_key = "id"
    }
    "CareerLens_Reviews" = {
      hash_key = "id"
    }
  }
}

resource "aws_dynamodb_table" "tables" {
  for_each = local.tables

  name           = each.key
  billing_mode   = "PROVISIONED"
  read_capacity  = 1
  write_capacity = 1
  hash_key       = each.value.hash_key

  attribute {
    name = each.value.hash_key
    type = "S"
  }

  tags = {
    Name        = each.key
    Environment = var.environment
  }
}

# ==============================================================================
# 4. AMAZON EC2 INSTANCE (750 Hours/Month Free Tier)
# ==============================================================================

# Fetch official Canonical Ubuntu 24.04 LTS AMI
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# Optional Key Pair
resource "aws_key_pair" "ssh" {
  count      = var.public_key != "" ? 1 : 0
  key_name   = "${var.app_name}-${var.environment}-key"
  public_key = var.public_key
}

# EC2 Instance
resource "aws_instance" "web" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.instance_type

  vpc_security_group_ids = [aws_security_group.app_sg.id]
  key_name               = var.public_key != "" ? aws_key_pair.ssh[0].key_name : (var.key_name != "" ? var.key_name : null)

  root_block_device {
    volume_size           = 20 # Free tier allows up to 30 GB
    volume_type           = "gp3"
    delete_on_termination = true
  }

  user_data = <<-EOF
              #!/bin/bash
              set -e

              # Update and install Docker prerequisites
              apt-get update -y
              apt-get install -y ca-certificates curl gnupg git iptables-persistent

              # Install official Docker
              install -m 0755 -d /etc/apt/keyrings
              curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
              chmod a+r /etc/apt/keyrings/docker.gpg

              echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

              apt-get update -y
              apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

              # Enable Docker for ubuntu user
              usermod -aG docker ubuntu
              systemctl enable docker
              systemctl start docker

              # Route port 80 to 3000 so web app opens without :3000 in URL
              iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 3000
              netfilter-persistent save || true
              EOF

  tags = {
    Name        = "${var.app_name}-${var.environment}-server"
    Environment = var.environment
  }
}
