#!/bin/bash

# Emobile Specialist Hospital - Deployment Script
# This script prepares and deploys the website to Firebase Hosting
# Usage: ./deploy.sh [-y|--yes] to skip confirmation prompt

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Parse arguments
AUTO_DEPLOY=false
if [[ "$1" == "-y" || "$1" == "--yes" ]]; then
    AUTO_DEPLOY=true
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Emobile Hospital Deployment Script${NC}"
echo -e "${GREEN}========================================${NC}\n"

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PUBLIC_DIR="$SCRIPT_DIR/public"

# Step 1: Clean public directory
echo -e "${YELLOW}Step 1: Cleaning public directory...${NC}"
if [ -d "$PUBLIC_DIR" ]; then
    # Remove everything except 404.html
    find "$PUBLIC_DIR" -mindepth 1 ! -name '404.html' -delete
    echo -e "${GREEN}✓ Public directory cleaned${NC}\n"
else
    mkdir -p "$PUBLIC_DIR"
    echo -e "${GREEN}✓ Public directory created${NC}\n"
fi

# Step 2: Copy HTML files
echo -e "${YELLOW}Step 2: Copying HTML files...${NC}"
html_files=(
    "index.html"
    "about.html"
    "services.html"
    "contact.html"
    "foundation.html"
    "appointment.html"
    "gallery.html"
    "blog.html"
    "blog-admin.html"
    "blog-post.html"
    "submit-post.html"
)

for file in "${html_files[@]}"; do
    if [ -f "$SCRIPT_DIR/$file" ]; then
        cp "$SCRIPT_DIR/$file" "$PUBLIC_DIR/"
        echo -e "  ✓ Copied $file"
    else
        echo -e "${RED}  ✗ Warning: $file not found${NC}"
    fi
done
echo -e "${GREEN}✓ HTML files copied${NC}\n"

# Step 3: Copy SEO files
echo -e "${YELLOW}Step 3: Copying SEO files...${NC}"
seo_files=(
    "robots.txt"
    "sitemap.xml"
)

for file in "${seo_files[@]}"; do
    if [ -f "$SCRIPT_DIR/$file" ]; then
        cp "$SCRIPT_DIR/$file" "$PUBLIC_DIR/"
        echo -e "  ✓ Copied $file"
    else
        echo -e "${RED}  ✗ Warning: $file not found${NC}"
    fi
done
echo -e "${GREEN}✓ SEO files copied${NC}\n"

# Step 4: Copy assets directory
echo -e "${YELLOW}Step 4: Copying assets directory...${NC}"
if [ -d "$SCRIPT_DIR/assets" ]; then
    cp -R "$SCRIPT_DIR/assets" "$PUBLIC_DIR/"
    echo -e "${GREEN}✓ Assets directory copied${NC}\n"
else
    echo -e "${RED}✗ Error: assets directory not found${NC}\n"
    exit 1
fi

# Step 5: Summary
echo -e "${YELLOW}Step 5: Deployment summary...${NC}"
echo -e "  HTML files: $(ls -1 "$PUBLIC_DIR"/*.html 2>/dev/null | wc -l | tr -d ' ')"
echo -e "  SEO files:"
echo -e "    - robots.txt: $([ -f "$PUBLIC_DIR/robots.txt" ] && echo "✓" || echo "✗")"
echo -e "    - sitemap.xml: $([ -f "$PUBLIC_DIR/sitemap.xml" ] && echo "✓" || echo "✗")"
echo -e "  Assets:"
echo -e "    - CSS files: $(find "$PUBLIC_DIR/assets/css" -name "*.css" 2>/dev/null | wc -l | tr -d ' ')"
echo -e "    - JS files: $(find "$PUBLIC_DIR/assets/js" -name "*.js" 2>/dev/null | wc -l | tr -d ' ')"
echo -e "    - Images: $(find "$PUBLIC_DIR/assets/images" -type f 2>/dev/null | wc -l | tr -d ' ')"
echo -e "    - Favicons: $(find "$PUBLIC_DIR/assets/images/favicon" -type f 2>/dev/null | wc -l | tr -d ' ')"
echo -e "${GREEN}✓ All files prepared for deployment${NC}\n"

# Step 6: Deploy to Firebase
if [ "$AUTO_DEPLOY" = true ]; then
    echo -e "${YELLOW}Deploying to Firebase...${NC}"
    firebase deploy
    echo -e "\n${GREEN}========================================${NC}"
    echo -e "${GREEN}✓ Deployment completed successfully!${NC}"
    echo -e "${GREEN}========================================${NC}"
else
    echo -e "${YELLOW}Ready to deploy to Firebase?${NC}"
    read -p "Deploy now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "\n${YELLOW}Deploying to Firebase...${NC}"
        firebase deploy
        echo -e "\n${GREEN}========================================${NC}"
        echo -e "${GREEN}✓ Deployment completed successfully!${NC}"
        echo -e "${GREEN}========================================${NC}"
    else
        echo -e "\n${YELLOW}Deployment skipped. Files are ready in the public directory.${NC}"
        echo -e "${YELLOW}Run 'firebase deploy' manually when ready.${NC}"
    fi
fi
