#!/bin/bash

# BigQuery Setup Script for CareerLens
# This script helps set up BigQuery for the Resume Builder

set -e

echo "🚀 CareerLens BigQuery Setup Script"
echo "===================================="
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud SDK (gcloud) is not installed"
    echo "📥 Install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

echo "✅ Google Cloud SDK found"
echo ""

# Get project ID
read -p "Enter your Google Cloud / Firebase Project ID: " PROJECT_ID

if [ -z "$PROJECT_ID" ]; then
    echo "❌ Project ID is required"
    exit 1
fi

echo ""
echo "🔧 Setting up project: $PROJECT_ID"
echo ""

# Set the project
gcloud config set project "$PROJECT_ID"

# Enable BigQuery API
echo "📡 Enabling BigQuery API..."
gcloud services enable bigquery.googleapis.com

echo "✅ BigQuery API enabled"
echo ""

# Create dataset
echo "📊 Creating BigQuery dataset: career_lens_data"
bq mk --dataset --location=US "$PROJECT_ID:career_lens_data" || echo "Dataset may already exist"

echo "✅ Dataset created"
echo ""

# Ask if user wants to create tables now
read -p "Do you want to create the BigQuery tables now? (y/n): " CREATE_TABLES

if [ "$CREATE_TABLES" = "y" ] || [ "$CREATE_TABLES" = "Y" ]; then
    echo ""
    echo "📋 Creating tables from schema..."
    
    # Check if schema file exists
    if [ -f "src/lib/bigquery/schemas.sql" ]; then
        echo "Found schema file. Please run the SQL manually in BigQuery Console:"
        echo "1. Go to: https://console.cloud.google.com/bigquery?project=$PROJECT_ID"
        echo "2. Click 'Compose new query'"
        echo "3. Copy/paste the contents of: src/lib/bigquery/schemas.sql"
        echo "4. Click 'Run'"
    else
        echo "⚠️  Schema file not found at src/lib/bigquery/schemas.sql"
    fi
fi

echo ""
echo "🔐 Authenticating for local development..."
gcloud auth application-default login

echo ""
echo "📝 Updating .env.local file..."

# Create or update .env.local
if [ ! -f ".env.local" ]; then
    cp .env.local.example .env.local
fi

# Add or update BigQuery config in .env.local
if grep -q "GOOGLE_CLOUD_PROJECT_ID" .env.local; then
    # Update existing
    sed -i.bak "s/GOOGLE_CLOUD_PROJECT_ID=.*/GOOGLE_CLOUD_PROJECT_ID=$PROJECT_ID/" .env.local
    echo "✅ Updated GOOGLE_CLOUD_PROJECT_ID in .env.local"
else
    # Add new
    echo "" >> .env.local
    echo "# BigQuery Configuration" >> .env.local
    echo "GOOGLE_CLOUD_PROJECT_ID=$PROJECT_ID" >> .env.local
    echo "BIGQUERY_DATASET=career_lens_data" >> .env.local
    echo "✅ Added BigQuery config to .env.local"
fi

echo ""
echo "============================================"
echo "✅ BigQuery Setup Complete!"
echo "============================================"
echo ""
echo "Next Steps:"
echo "1. ⚠️  If you haven't already, run the SQL from src/lib/bigquery/schemas.sql in BigQuery Console"
echo "2. 🧪 Test the integration:"
echo "   npm run dev"
echo "   Open http://localhost:3000/resume"
echo "   Try the 'Optimize' or 'Skills' tab"
echo ""
echo "📚 Documentation:"
echo "   - Quick Start: BIGQUERY_QUICKSTART.md"
echo "   - Full Guide: BIGQUERY_INTEGRATION_GUIDE.md"
echo "   - Features: BIGQUERY_FEATURES.md"
echo ""
echo "Happy Building! 🎉"
