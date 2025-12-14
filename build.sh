#!/bin/bash
set -e

echo "🚀 Starting build process..."

# Navigate to frontend directory
cd frontend

echo "📦 Installing dependencies..."
npm ci --legacy-peer-deps --prefer-offline --no-audit || npm install --legacy-peer-deps --prefer-offline --no-audit

echo "🔨 Building React app..."
CI=false npm run build

echo "✅ Build complete!"
ls -la build/
