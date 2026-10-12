# YouFlix

YouFlix is a Manifest V3 browser extension that transforms YouTube into a cinematic, Netflix-inspired browsing and watching experience.

**Live page:** https://abhinavsanthoshpp.github.io/youflix/

## Why YouFlix

YouFlix is designed for users who want a cleaner, more immersive YouTube interface with structured discovery and a polished watch layout.

## Core Features

- **Hero Billboard** for featured content with title, context, and quick actions
- **Horizontal Content Rows** for category-style browsing
- **Interactive Hover Previews** with quick visual context
- **Enhanced Watch Experience** with theater-style presentation
- **Intro Sound Experience** (toggleable)
- **Fast Mode Switcher** between YouFlix mode and default YouTube
- **Privacy-First Design** with local preferences and no telemetry

## Compatibility

- Chromium browsers: Chrome, Brave, Edge, Opera, Vivaldi
- Firefox (via `browser_specific_settings` in manifest)

## Installation (Developer Mode)

1. Download or clone this repository.
2. Open your browser extensions page:
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
   - Brave: `brave://extensions/`
3. Enable **Developer mode**.
4. Click **Load unpacked** and select the repository folder.
5. Open [youtube.com](https://www.youtube.com).

## Project Layout

```text
manifest.json   # Extension manifest (MV3)
content.js      # Main content script and UI behavior
styles.css      # YouFlix mode styling
popup.html      # Extension popup markup
popup.js        # Popup logic and settings actions
popup.css       # Popup styling
donate.html     # Standalone donation/support page
build.sh        # Packaging and validation script
assets/         # Icons, audio, and promo assets
```

## Build Package

To generate the distributable extension package:

```bash
chmod +x build.sh
./build.sh
```

The build script validates the manifest, checks required files, and generates `youflix-extension.zip`.

## Support & Donations

You can support development through the built-in donation page:

- Open `donate.html` for direct support options
- Use the support links in the popup and landing page
- Submit bug reports or feature requests via GitHub Issues

## Privacy

- No third-party analytics or tracking
- Preferences stored locally using browser extension storage
- Runs only on `*://*.youtube.com/*`

## License

Released under the **MIT License**.
