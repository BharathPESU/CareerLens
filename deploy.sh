#!/bin/bash

# 🚀 CareerLens Firebase Deployment Script
# This script automates the deployment process with safety checks

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Header
echo ""
echo "╔════════════════════════════════════════╗"
echo "║   🚀 CareerLens Deployment Script     ║"
echo "║   Firebase App Hosting Rollout        ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Check prerequisites
print_status "Checking prerequisites..."

if ! command_exists npm; then
    print_error "npm is not installed. Please install Node.js and npm first."
    exit 1
fi

if ! command_exists firebase; then
    print_error "Firebase CLI is not installed. Install with: npm install -g firebase-tools"
    exit 1
fi

if ! command_exists git; then
    print_error "git is not installed. Please install git first."
    exit 1
fi

print_success "All prerequisites met!"

# Check if .env.local exists
if [ ! -f .env.local ]; then
    print_warning ".env.local not found!"
    print_status "Creating .env.local from template..."
    
    cat > .env.local << 'EOF'
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Google AI (Gemini)
GEMINI_API_KEY=
NEXT_PUBLIC_GEMINI_API_KEY=

# Google Cloud Platform
GCP_PROJECT_ID=
BIGQUERY_DATASET_ID=career_data

# News & Search APIs
NEWS_API_KEY=
GOOGLE_CUSTOM_SEARCH_API_KEY=
GOOGLE_CUSTOM_SEARCH_ENGINE_ID=

# Redis (for Background Jobs)
REDIS_HOST=
REDIS_PORT=6379
REDIS_PASSWORD=
EOF
    
    print_warning "Please edit .env.local with your actual values before continuing!"
    read -p "Press Enter when ready to continue..."
fi

# Step 1: Git status check
print_status "Checking git status..."
if [[ -n $(git status -s) ]]; then
    print_warning "You have uncommitted changes!"
    git status -s
    read -p "Do you want to commit these changes? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter commit message: " commit_msg
        git add .
        git commit -m "$commit_msg"
        print_success "Changes committed!"
    else
        print_warning "Proceeding with uncommitted changes..."
    fi
fi

# Step 2: Install dependencies
print_status "Installing dependencies..."
npm install
print_success "Dependencies installed!"

# Step 3: Type checking
print_status "Running TypeScript type check..."
if npm run typecheck; then
    print_success "Type check passed!"
else
    print_error "Type check failed! Please fix TypeScript errors before deploying."
    exit 1
fi

# Step 4: Linting (optional)
print_status "Running linter..."
if npm run lint; then
    print_success "Linting passed!"
else
    print_warning "Linting found issues. Review them before deploying."
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Step 5: Build
print_status "Building Next.js application..."
if npm run build; then
    print_success "Build successful!"
else
    print_error "Build failed! Please fix build errors before deploying."
    exit 1
fi

# Step 6: Choose deployment type
echo ""
echo "Select deployment type:"
echo "1) Preview Channel (Safe - Test first)"
echo "2) Production (Live deployment)"
echo "3) Both (Preview then Production)"
echo "4) Cancel"
echo ""
read -p "Enter choice [1-4]: " choice

case $choice in
    1)
        # Preview deployment
        print_status "Deploying to preview channel..."
        PREVIEW_CHANNEL="preview-$(date +%Y%m%d-%H%M%S)"
        firebase hosting:channel:deploy $PREVIEW_CHANNEL
        print_success "Preview deployed!"
        echo ""
        print_status "Preview URL: Check Firebase Console for the URL"
        echo ""
        ;;
    
    2)
        # Production deployment
        print_warning "You are about to deploy to PRODUCTION!"
        read -p "Are you absolutely sure? (type 'yes' to continue): " confirm
        if [ "$confirm" = "yes" ]; then
            print_status "Deploying to production..."
            
            # Deploy Firestore rules and indexes first
            print_status "Deploying Firestore rules and indexes..."
            firebase deploy --only firestore
            
            # Deploy hosting
            print_status "Deploying hosting..."
            firebase deploy --only hosting
            
            print_success "Production deployment complete! 🎉"
            echo ""
            print_status "Live URL: https://careerlens-1.web.app"
        else
            print_error "Production deployment cancelled."
            exit 1
        fi
        ;;
    
    3)
        # Both preview and production
        print_status "Deploying to preview channel first..."
        PREVIEW_CHANNEL="preview-$(date +%Y%m%d-%H%M%S)"
        firebase hosting:channel:deploy $PREVIEW_CHANNEL
        print_success "Preview deployed!"
        
        echo ""
        print_status "Please test the preview URL thoroughly."
        read -p "Ready to deploy to production? (type 'yes' to continue): " confirm
        
        if [ "$confirm" = "yes" ]; then
            print_status "Deploying to production..."
            
            # Deploy Firestore rules and indexes
            firebase deploy --only firestore
            
            # Deploy hosting
            firebase deploy --only hosting
            
            print_success "Production deployment complete! 🎉"
        else
            print_error "Production deployment cancelled."
            exit 1
        fi
        ;;
    
    4)
        print_error "Deployment cancelled."
        exit 0
        ;;
    
    *)
        print_error "Invalid choice. Deployment cancelled."
        exit 1
        ;;
esac

# Step 7: Post-deployment checks
echo ""
print_status "Running post-deployment checks..."

# Test if site is accessible
print_status "Testing site accessibility..."
if curl -f -s https://careerlens-1.web.app/ > /dev/null; then
    print_success "Site is accessible!"
else
    print_warning "Site may not be accessible yet. Give it a few minutes."
fi

# Final summary
echo ""
echo "╔════════════════════════════════════════╗"
echo "║   ✅ Deployment Complete!              ║"
echo "╚════════════════════════════════════════╝"
echo ""
print_status "Next steps:"
echo "  1. Test all API endpoints"
echo "  2. Verify frontend functionality"
echo "  3. Monitor Firebase Console for errors"
echo "  4. Check Performance metrics"
echo "  5. Review user feedback"
echo ""
print_status "Monitoring URLs:"
echo "  - Firebase Console: https://console.firebase.google.com"
echo "  - Live Site: https://careerlens-1.web.app"
echo "  - Performance: https://console.firebase.google.com/u/0/project/_/performance"
echo ""
print_success "Happy deploying! 🚀"
echo ""
