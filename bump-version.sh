#!/usr/bin/env bash
set -e

# bump-version.sh - Quick version bump and release helper for YouFlix
# Usage:
#   ./bump-version.sh 1.0.1
#   ./bump-version.sh patch
#   ./bump-version.sh minor
#   ./bump-version.sh major

CURRENT_VERSION=$(python3 -c "import json; print(json.load(open('manifest.json'))['version'])")
TARGET="$1"

if [ -z "$TARGET" ]; then
  echo "Current version: $CURRENT_VERSION"
  echo "Usage: ./bump-version.sh <new_version | patch | minor | major>"
  exit 1
fi

NEW_VERSION=$(python3 -c "
import sys

cur = '$CURRENT_VERSION'
target = '$TARGET'
parts = [int(p) for p in cur.split('.')]
while len(parts) < 3:
    parts.append(0)

if target == 'patch':
    parts[2] += 1
    print(f'{parts[0]}.{parts[1]}.{parts[2]}')
elif target == 'minor':
    parts[1] += 1
    parts[2] = 0
    print(f'{parts[0]}.{parts[1]}.{parts[2]}')
elif target == 'major':
    parts[0] += 1
    parts[1] = 0
    parts[2] = 0
    print(f'{parts[0]}.{parts[1]}.{parts[2]}')
else:
    print(target.lstrip('v'))
")

echo "Bumping version: $CURRENT_VERSION -> $NEW_VERSION"

# Update manifest.json
python3 -c "
import json
with open('manifest.json', 'r') as f:
    data = json.load(f)
data['version'] = '$NEW_VERSION'
with open('manifest.json', 'w') as f:
    json.dump(data, f, indent=2)
"

# Rebuild extension package
./build.sh

# Git commit and tag if inside git repo
if [ -d ".git" ]; then
  git add manifest.json youflix-extension.zip
  git commit -m "chore(release): v$NEW_VERSION" || true
  git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION" || true
  echo ""
  echo "✅ Version bumped to $NEW_VERSION and tagged v$NEW_VERSION"
  echo "To push to GitHub and trigger automatic deployment:"
  echo "  git push origin main --tags"
else
  echo ""
  echo "✅ Version bumped to $NEW_VERSION in manifest.json and youflix-extension.zip rebuilt."
fi
