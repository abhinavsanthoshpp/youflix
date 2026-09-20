# YouFlix

A clean browser extension that gives YouTube a Netflix-inspired interface with category rows, a featured hero billboard, quick hover previews, and an authentic watch experience.

## Overview

YouFlix rebuilds YouTube's browse and watch experience:
- **Hero Billboard**: Featured spotlight video with title, description, play button, and trailer preview.
- **Horizontal Rows**: Content organized into browsable rows (Trending, Subscriptions, Library, etc.) with pagination arrows.
- **Card Hover Preview**: Hovering a card enlarges the thumbnail and shows quick actions (play, save to list, like).
- **Detail Modal**: View video synopsis, creator info, and recommendations without leaving the feed.
- **Watch Experience**: Theater-width player, auto-hiding controls and cursor on inactivity, "Skip Intro" shortcut, and custom red scrubber bar.
- **Intro Sound**: Plays the familiar intro chime on first load (toggleable).
- **Mode Switcher**: Quick toggle between YouFlix and standard YouTube via the header button or popup.

## Installation (Local / Developer Mode)

Works on any Chromium browser (Chrome, Brave, Edge, Opera) and Firefox.

1. Open your browser's extension page:
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
   - Brave: `brave://extensions/`
2. Enable **Developer mode** (toggle in top-right).
3. Click **Load unpacked** and select this directory.
4. Navigate to [youtube.com](https://www.youtube.com).

## Project Structure

```
├── manifest.json         # Manifest V3 extension config
├── content.js            # Main content script (DOM parser, UI injection)
├── styles.css            # Stylesheet for Netflix layout, rows & watch player
├── popup.html            # Extension popup markup
├── popup.js              # Settings controller & audio test
├── popup.css             # Popup styles
├── donate.html           # Standalone donation page (UPI direct bank, Buy Me a Coffee, Ko-fi)
├── build.sh              # Bash script to package extension into zip
├── youflix-extension.zip # Built extension ready for store upload
└── assets/               # Extension icons and intro audio
```

## Donation & Support Setup

YouFlix includes a built-in donation page (`donate.html`) and quick donation buttons in the extension popup and header.

To configure your payment handles:
1. Open `donate.html`.
2. Locate the `DONATION_CONFIG` block:
   ```javascript
   const DONATION_CONFIG = {
     upiId: 'abhinava6525@naviaxis',              // Your UPI ID (GPay, PhonePe, Paytm, BHIM, Navi)
     buyMeACoffeeUsername: 'abhinavsanthoshpp',  // buymeacoffee.com/abhinavsanthoshpp
     kofiUsername: 'your_username',               // ko-fi.com/your_username
     githubUsername: 'your_username'              // github.com/sponsors/your_username
   };
   ```
3. Replace the placeholder values with your accounts.
4. Rebuild the extension package by running `./build.sh`.

You can also host `donate.html` directly on GitHub Pages, Vercel, or Netlify to share as a standalone donation link.

## Building for the Store

To create a clean ZIP package for the Chrome Web Store or Firefox Add-ons:

```bash
chmod +x build.sh
./build.sh
```

This validates `manifest.json`, checks all required files, and outputs `youflix-extension.zip`.

## Privacy

- No third-party network requests or telemetry.
- Preferences are saved locally via `chrome.storage.sync`.
- Only runs on `*://*.youtube.com/*`.

## License

MIT License. Feel free to fork, modify, and distribute.
