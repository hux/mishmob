#!/bin/bash

# Fix Expo SDK 54 upgrade issues
set -e

echo "=== Fixing Expo SDK 54 Upgrade ==="
echo ""

cd mobile

echo "1. Cleaning all caches..."
rm -rf node_modules
rm -rf .expo
rm -rf $TMPDIR/react-*
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-*
rm -f package-lock.json

echo "2. Clearing watchman..."
watchman watch-del-all 2>/dev/null || true

echo "3. Installing fresh dependencies..."
npm install

echo "4. Clearing Metro bundler cache..."
npx expo start --clear &
sleep 5
kill $! 2>/dev/null || true

echo ""
echo "=== Fix Complete ==="
echo "Now try running: make mobile or make mobile-android"