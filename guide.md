# CareerLens — Complete AWS Deployment Guide (Free Tier)

This guide walks you through deploying the **CareerLens** application on Amazon Web Services (AWS) using **100% Free Tier** eligible services and **Terraform Infrastructure as Code (IaC)**.

---

## Architecture Overview

```
                      +---------------------------------------+
                      |             User Browser              |
                      +-------------------+-------------------+
                                          |
                +-------------------------+-------------------------+
                |                         |                         |
                v                         v                         v
       +-----------------+       +-----------------+       +-----------------+
       |  Amazon Cognito |       |     AWS EC2     |       | Amazon DynamoDB |
       |   User Pools    |       |    (t3.micro)   |       |   (8 Tables)    |
       | (50k MAUs Free) |       |  (750 hrs/mo)   |       |  (25 GB Free)   |
       +-----------------+       +--------+--------+       +-----------------+
                                          |
                        +-----------------+-----------------+
                        |          Docker Compose           |
                        |                                   |
                        |  +-----------------------------+  |
                        |  | Next.js App (:3000)         |  |
                        |  +-----------------------------+  |
                        |  | BullMQ Worker (tsx)         |  |
                        |  +-----------------------------+  |
                        |  | Socket.IO Server (:3001)    |  |
                        |  +-----------------------------+  |
                        |  | Redis Alpine (:6379)        |  |
                        |  +-----------------------------+  |
                        +-----------------------------------+
```

### Free Tier Safeguards
- **Compute**: Single `t3.micro` (or `t2.micro`) running Docker Compose (750 free hours/month).
- **Database**: 8 DynamoDB tables with **Provisioned 1 RCU / 1 WCU** (well within the 25 RCU/WCU Free Tier limit).
- **Authentication**: Amazon Cognito User Pool (50,000 monthly active users free).
- **AI Inference**: Powered by Google Gemini Free API key (saves ~$25-$50/month over Amazon Bedrock).
- **No Costly Services**: No ElastiCache (~$30/mo avoided via local Redis), No Application Load Balancer (~$20/mo avoided), No Bedrock, No Location Service.

---

## Prerequisites

Before starting, ensure you have:
1. **AWS CLI configured** on your local machine:
   ```bash
   aws sts get-caller-identity
   ```
2. **Terraform installed** (v1.10+):
   ```bash
   terraform -version
   ```
3. **An SSH key pair** (e.g. `~/.ssh/id_ed25519.pub` or `~/.ssh/id_rsa.pub`).

---

## Step 1: Configure Terraform Variables

1. Navigate to the `terraform/` directory:
   ```bash
   cd terraform
   ```

2. Verify or edit your `terraform.tfvars` file:
   ```hcl
   aws_region    = "ap-south-2"       # Or "ap-south-1" / "us-east-1"
   environment   = "prod"
   app_name      = "careerlens"
   instance_type = "t3.micro"

   # Attach your downloaded AWS Key Pair:
   key_name      = "key1"
   ```

---

## Step 2: Provision AWS Infrastructure with Terraform

1. **Initialize Terraform**:
   ```bash
   terraform init
   ```

2. **Preview the deployment**:
   ```bash
   terraform plan
   ```
   *(Terraform will plan to create 1 Cognito User Pool, 1 User Pool Client, 8 DynamoDB tables, 1 EC2 Security Group, and 1 EC2 Instance attached to your `key1` key).*

3. **Apply and build resources**:
   ```bash
   terraform apply
   ```
   Type `yes` when prompted.

4. **Copy the Terraform Outputs**:
   Once complete, Terraform will display:
   - `ec2_public_ip` (e.g., `13.232.xxx.xxx`)
   - `ssh_command` (e.g., `ssh -i /path/to/key ubuntu@13.232.xxx.xxx`)
   - `cognito_user_pool_id` (e.g., `ap-south-2_xxxxxxxxx`)
   - `cognito_client_id` (e.g., `3n8bc0xxxxxxxxxxxxxxxxx`)
   - `env_file_template` (A ready-to-copy `.env` block)

---

## Step 3: Connect to Your AWS EC2 Instance Using `key1.pem`

Your private key is located at:
```text
/home/bharath/Downloads/key1.pem
```

### 1. Set Required Private Key Permissions
SSH requires your private key to have restricted permissions (`400` or `600`), otherwise it will reject the key with a `Permissions are too open` error:

```bash
chmod 400 /home/bharath/Downloads/key1.pem
```

### 2. Connect via SSH
Use the `-i` flag to specify your `key1.pem` file:

```bash
ssh -i /home/bharath/Downloads/key1.pem ubuntu@<EC2_PUBLIC_IP>
```
*(Replace `<EC2_PUBLIC_IP>` with the public IP printed by Terraform in Step 2).*

> [!TIP]
> **Optional Shortcut**: To connect by simply typing `ssh careerlens`, add this to your `~/.ssh/config`:
> ```bash
> cat << 'EOF' >> ~/.ssh/config
> Host careerlens
>     HostName <EC2_PUBLIC_IP>
>     User ubuntu
>     IdentityFile /home/bharath/Downloads/key1.pem
> EOF
> ```
> Then you can connect anytime with just:
> ```bash
> ssh careerlens
> ```

---

## Step 4: Install Docker & Docker Compose on the Server

Run these commands on your EC2 instance to install Docker:

```bash
# 1. Update system packages
sudo apt-get update -y && sudo apt-get upgrade -y

# 2. Install Docker
sudo apt-get install -y ca-certificates curl gnupg lsb-release
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 3. Allow ubuntu user to run Docker without sudo
sudo usermod -aG docker ubuntu
newgrp docker
```

---

## Step 5: Clone CareerLens & Configure `.env`

1. Clone your project repository onto the server:
   ```bash
   git clone https://github.com/BharathPESU/CareerLens.git
   cd CareerLens
   ```

2. Create the production `.env` file:
   ```bash
   nano .env
   ```

3. Paste the configuration with your Terraform outputs and Gemini API key:
   ```env
   NODE_ENV=production
   PORT=3000

   # AWS Configuration
   AWS_REGION=ap-south-1
   AWS_ACCESS_KEY_ID=<YOUR_IAM_ACCESS_KEY_ID>
   AWS_SECRET_ACCESS_KEY=<YOUR_IAM_SECRET_ACCESS_KEY>

   # Amazon Cognito Auth
   NEXT_PUBLIC_AWS_REGION=ap-south-1
   NEXT_PUBLIC_COGNITO_USER_POOL_ID=<OUTPUT_COGNITO_USER_POOL_ID>
   NEXT_PUBLIC_COGNITO_CLIENT_ID=<OUTPUT_COGNITO_CLIENT_ID>

   # DynamoDB Table Names
   DYNAMODB_TABLE_USERS=careerlens-prod-users
   DYNAMODB_TABLE_PROFILES=careerlens-prod-profiles
   DYNAMODB_TABLE_CAREER_GRAPHS=careerlens-prod-career-graphs
   DYNAMODB_TABLE_COMMUNITIES=careerlens-prod-communities
   DYNAMODB_TABLE_MENTOR_CHATS=careerlens-prod-mentor-chats
   DYNAMODB_TABLE_RESOURCES=careerlens-prod-resources
   DYNAMODB_TABLE_CAREER_UPDATES=careerlens-prod-career-updates
   DYNAMODB_TABLE_LEARNING_PATHS=careerlens-prod-learning-paths

   # AI & APIs
   GEMINI_API_KEY=<YOUR_GEMINI_API_KEY>

   # Redis & WebSockets (Internal Docker Network)
   REDIS_HOST=redis
   REDIS_PORT=6379
   NEXT_PUBLIC_SOCKET_URL=http://<EC2_PUBLIC_IP>:3001
   ```
   Save and exit (`Ctrl + O`, `Enter`, `Ctrl + X`).

---

## Step 6: Launch CareerLens Stack

Start all services (Next.js, Worker, WebSockets, Redis) using Docker Compose:

```bash
docker compose up -d --build
```

### Check Service Status
```bash
docker compose ps
```
All four services should show status `Up`:
- `careerlens-redis`
- `careerlens-web`
- `careerlens-worker`
- `careerlens-socket`

### View Live Logs
```bash
# View all logs:
docker compose logs -f

# View only the web app logs:
docker compose logs -f web
```

---

## Step 7: Open in Your Browser

Open your browser and navigate to:
```text
http://<EC2_PUBLIC_IP>:3000
```

1. **Sign Up**: Register a new user account (Cognito sends a verification code or auto-confirms).
2. **Dashboard**: Navigate through your profile, career graph, skill recommendations, and roadmaps.
3. **Real-time Updates**: Verify career updates and intelligence feeds backed by DynamoDB.

---

## Maintenance & Useful Commands

### Restart Services
```bash
docker compose restart
```

### Pull Updates & Rebuild
```bash
git pull origin main
docker compose up -d --build
```

### Stop All Services
```bash
docker compose down
```

### Destroy Infrastructure (Clean Teardown)
If you ever want to completely delete all AWS resources so you don't incur any costs:
```bash
cd terraform
terraform destroy -auto-approve
```

---

## Troubleshooting Checklist

| Issue | Cause | Fix |
|---|---|---|
| Cannot connect via SSH | Security Group or wrong key | Ensure port 22 is open in security group and you use `ssh -i ~/.ssh/id_ed25519 ubuntu@<IP>`. |
| Browser cannot reach `:3000` | Port 3000 blocked | Ensure port 3000 is open in `terraform/main.tf` security group (it is allowed by default). |
| DynamoDB `AccessDeniedException` | IAM user missing DynamoDB permissions | Ensure the IAM user has `AmazonDynamoDBFullAccess` or `AdministratorAccess`. |
| `OptInRequired` on Terraform apply | Selected region requires manual opt-in | Use `ap-south-1` (Mumbai) or `us-east-1` (N. Virginia), or enable the region in AWS Console. |
