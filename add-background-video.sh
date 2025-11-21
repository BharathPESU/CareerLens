#!/bin/bash

# CareerLens Background Video Setup Script
# This script helps you add your background video to the CareerLens app

echo "🎥 CareerLens Background Video Setup"
echo "===================================="
echo ""

# Check if video file is provided
if [ -z "$1" ]; then
    echo "Usage: ./add-background-video.sh /path/to/your/video.mp4"
    echo ""
    echo "Example:"
    echo "  ./add-background-video.sh ~/Downloads/Video_Generation_From_Image.mp4"
    echo "  ./add-background-video.sh /mnt/data/Video_Generation_From_Image.mp4"
    echo ""
    exit 1
fi

VIDEO_SOURCE="$1"
VIDEO_DEST="public/background-video.mp4"

# Check if source file exists
if [ ! -f "$VIDEO_SOURCE" ]; then
    echo "❌ Error: Video file not found at: $VIDEO_SOURCE"
    echo ""
    echo "Please check the file path and try again."
    exit 1
fi

# Get file size
FILE_SIZE=$(du -h "$VIDEO_SOURCE" | cut -f1)

echo "Source video: $VIDEO_SOURCE"
echo "File size: $FILE_SIZE"
echo ""

# Check if destination already exists
if [ -f "$VIDEO_DEST" ]; then
    echo "⚠️  Warning: A background video already exists."
    read -p "Do you want to replace it? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Cancelled."
        exit 0
    fi
fi

# Copy the video
echo "Copying video..."
cp "$VIDEO_SOURCE" "$VIDEO_DEST"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Success! Video copied to: $VIDEO_DEST"
    echo ""
    echo "Next steps:"
    echo "1. Refresh your browser (Ctrl+R or Cmd+R)"
    echo "2. The video should start playing automatically"
    echo "3. Navigate between pages to verify it doesn't restart"
    echo ""
    echo "Troubleshooting:"
    echo "- If video doesn't play, check browser console (F12)"
    echo "- Make sure video is in MP4 format (H.264 codec)"
    echo "- Try clearing browser cache (Ctrl+Shift+R)"
    echo ""
    echo "For more help, see: BACKGROUND_VIDEO_GUIDE.md"
else
    echo ""
    echo "❌ Error: Failed to copy video file"
    exit 1
fi
