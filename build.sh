#!/usr/bin/env bash
set -e

OUTPUT_ZIP="youflix-extension.zip"
DIST_DIR="dist"

echo "Building YouFlix extension package..."

# Validate manifest
python3 -c "
import json
with open('manifest.json', 'r') as f:
    data = json.load(f)
assert data['manifest_version'] == 3, 'Manifest must be version 3'
print('  [ok] manifest.json is valid MV3')
"

# Check required files
REQUIRED_FILES=(
  "manifest.json"
  "content.js"
  "styles.css"
  "popup.html"
  "popup.js"
  "popup.css"
  "donate.html"
  "donate.js"
  "assets/icon16.png"
  "assets/icon32.png"
  "assets/icon48.png"
  "assets/icon128.png"
  "assets/logo.svg"
  "assets/netflix-sound.mp3"
)

for file in "${REQUIRED_FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo "  [err] missing file: $file"
    exit 1
  fi
done
echo "  [ok] all required files present"

# Clean old artifacts
rm -f "$OUTPUT_ZIP"
rm -rf "$DIST_DIR"

# Package zip
zip -q -r "$OUTPUT_ZIP" \
  manifest.json \
  content.js \
  styles.css \
  popup.html \
  popup.js \
  popup.css \
  donate.html \
  donate.js \
  assets/ \
  -x "assets/promo/*" \
  -x "*.DS_Store" \
  -x "__MACOSX*" \
  -x "*.git*"

ZIP_SIZE=$(ls -lh "$OUTPUT_ZIP" | awk '{print $5}')
echo "Done: $OUTPUT_ZIP ($ZIP_SIZE)"
