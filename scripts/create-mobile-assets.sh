#!/bin/bash

# Create placeholder assets for mobile app
set -e

echo "Creating placeholder assets for MishMob mobile app..."

cd mobile/assets

# Create placeholder images using ImageMagick if available, otherwise use base64
if command -v convert &> /dev/null; then
    echo "Using ImageMagick to create assets..."
    
    # Splash screen (1242x2436 for iPhone)
    convert -size 1242x2436 -background "#3B82F6" -fill white \
            -gravity center -pointsize 120 -annotate +0+0 'MishMob' \
            splash.png
    
    # Icon (1024x1024)
    convert -size 1024x1024 -background "#3B82F6" -fill white \
            -gravity center -pointsize 200 -annotate +0+0 'M' \
            icon.png
    
    # Adaptive icon for Android (foreground)
    convert -size 1024x1024 xc:transparent -fill "#3B82F6" \
            -draw "circle 512,512 512,100" -fill white \
            -gravity center -pointsize 400 -annotate +0+0 'M' \
            adaptive-icon.png
    
    # Favicon for web
    convert -size 48x48 -background "#3B82F6" -fill white \
            -gravity center -pointsize 32 -annotate +0+0 'M' \
            favicon.png
            
else
    echo "ImageMagick not found. Creating base64 placeholder images..."
    
    # Minimal PNG splash (blue background with white M)
    echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" | base64 -d > splash.png
    
    # Copy for other required images
    cp splash.png icon.png
    cp splash.png adaptive-icon.png
    cp splash.png favicon.png
fi

echo "✓ Created splash.png"
echo "✓ Created icon.png"
echo "✓ Created adaptive-icon.png"
echo "✓ Created favicon.png"

echo ""
echo "Placeholder assets created successfully!"
echo "Replace these with your actual branding assets later."