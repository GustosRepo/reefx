#!/bin/bash
# Generate App Icons for AquaXone Mobile
# Requires: ImageMagick (brew install imagemagick) or use online converter

echo "📱 AquaXone Icon Generator"
echo "========================="

# Check if ImageMagick is installed
if command -v convert &> /dev/null; then
    echo "✅ ImageMagick found"
    
    cd "$(dirname "$0")"
    
    # Generate icon sizes
    echo "Generating icons..."
    
    # iOS icons
    convert icon.svg -resize 1024x1024 icon.png
    convert icon.svg -resize 180x180 icon-180.png
    convert icon.svg -resize 167x167 icon-167.png
    convert icon.svg -resize 152x152 icon-152.png
    convert icon.svg -resize 120x120 icon-120.png
    
    # Android adaptive icon
    convert icon.svg -resize 432x432 adaptive-icon.png
    
    # Notification icon (white on transparent)
    convert icon.svg -resize 96x96 -alpha set -channel A -evaluate set 0 +channel \
        -fill white -colorize 100% notification-icon.png
    
    # Favicon
    convert icon.svg -resize 48x48 favicon.png
    
    # Splash screen
    convert splash.svg -resize 1284x2778 splash.png
    
    echo "✅ Icons generated successfully!"
    echo ""
    echo "Generated files:"
    ls -la *.png
    
else
    echo "❌ ImageMagick not found"
    echo ""
    echo "Option 1: Install ImageMagick"
    echo "  brew install imagemagick"
    echo ""
    echo "Option 2: Use online converter"
    echo "  1. Go to https://cloudconvert.com/svg-to-png"
    echo "  2. Upload icon.svg and splash.svg"
    echo "  3. Convert to PNG at these sizes:"
    echo "     - icon.png: 1024x1024"
    echo "     - adaptive-icon.png: 432x432"
    echo "     - splash.png: 1284x2778"
    echo "     - notification-icon.png: 96x96 (white)"
    echo "     - favicon.png: 48x48"
fi
