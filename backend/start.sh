#!/bin/bash

# Portfolio API Quick Start Script
# This script helps you set up and run the API quickly

set -e

echo "╔═══════════════════════════════════════════════╗"
echo "║  Portfolio API - Quick Start Setup           ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node -v) found"
echo ""

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found!"
    echo "Please run this script from the backend directory."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo ""
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  Please edit .env and add your settings:"
    echo "   - FRONTEND_URL (your portfolio URL)"
    echo "   - GITHUB_TOKEN (optional but recommended)"
    echo ""
    read -p "Press Enter to continue or Ctrl+C to exit and edit .env first..."
fi

echo ""
echo "🚀 Starting server..."
echo ""
echo "Your API will be available at: http://localhost:3000"
echo ""
echo "Test endpoints:"
echo "  http://localhost:3000/"
echo "  http://localhost:3000/api/leetcode/AaravKashyap"
echo "  http://localhost:3000/api/github/AaravKashyap12"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server
npm start
