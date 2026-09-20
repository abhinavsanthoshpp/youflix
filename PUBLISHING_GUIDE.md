# 🚀 Complete Store Publishing Guide: YouFlix

This guide covers everything you need to package, submit, and publish **YouFlix** to the **Google Chrome Web Store**, **Microsoft Edge Add-ons**, and **Mozilla Firefox Add-ons**.

---

## 📋 Table of Contents
1. [Pre-Flight Checklist](#1-pre-flight-checklist)
2. [Google Chrome Web Store Step-by-Step](#2-google-chrome-web-store-step-by-step)
3. [Store Listing Metadata (Copy & Paste)](#3-store-listing-metadata-copy--paste)
4. [Privacy & Permissions Justification (Critical for Approval)](#4-privacy--permissions-justification)
5. [Free Privacy Policy Template](#5-free-privacy-policy-template)
6. [Publishing to Microsoft Edge Add-ons (Free)](#6-publishing-to-microsoft-edge-add-ons)
7. [Publishing to Mozilla Firefox Add-ons (Free)](#7-publishing-to-mozilla-firefox-add-ons)
8. [Common Rejection Reasons & How We Prevent Them](#8-common-rejection-reasons--how-we-prevent-them)

---

## 1. Pre-Flight Checklist

Before submitting, your extension package has already been built and verified:
- ✅ **ZIP File**: `youflix-extension.zip` (generated via `./build.sh`)
- ✅ **Manifest**: Manifest V3 compliant, zero deprecated APIs
- ✅ **Icons Included**: 16x16, 32x32, 48x48, 128x128 in `assets/`
- ✅ **Promo Tiles**: `assets/promo/promo_small_440x280.png` and `promo_marquee_1400x560.png`
- ✅ **Zero Remote Scripts**: No `eval()`, CDN scripts, or external libraries (100% compliant with Google Manifest V3 security rules).

---

## 2. Google Chrome Web Store Step-by-Step

### Step 1: Register as a Chrome Web Store Developer
1. Go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).
2. Sign in with your Google Account.
3. Pay the **$5 USD one-time developer registration fee** (required by Google to prevent spam).
4. Fill in your Developer Name and Email.

### Step 2: Upload Your ZIP Package
1. On your dashboard, click the **"+ New Item"** button.
2. Drag and drop the file `youflix-extension.zip` (located in your project root).
3. The console will automatically parse `manifest.json` and create your draft listing.

### Step 3: Fill in Store Listing Details
Navigate through the left tabs:
- **Package**: Confirms Manifest V3 and version `1.0.0`.
- **Store Listing**: Enter Title, Description, Category, and upload graphics (see [Section 3](#3-store-listing-metadata-copy--paste)).
- **Privacy**: Provide Single Purpose and Permission Justifications (see [Section 4](#4-privacy--permissions-justification)).

### Step 4: Submit for Review
1. Click **"Submit for Review"** at the top right.
2. Select **"Publish automatically after review"**.
3. **Review Timeline**: Typically takes between **24 to 72 hours**. You will receive an email once approved!

---

## 3. Store Listing Metadata (Copy & Paste)

Use these pre-written fields optimized for Chrome Web Store search ranking (ASO):

### Extension Name:
```
YouFlix - Cinematic UI for YouTube™
```
> [!NOTE]
> Google Web Store policy requires using `"for YouTube™"` instead of putting "YouTube" at the start of the title, to prevent trademark infringement.

### Summary / Short Description (under 132 chars):
```
Transforms YouTube into an immersive Netflix-style streaming experience with spotlight billboard trailers, rows, and cinema mode.
```

### Detailed Description:
```markdown
Transform your YouTube experience into a cinema-grade streaming platform with YouFlix!

YouFlix completely redesigns YouTube's interface into a sleek, dark Netflix-inspired layout packed with premium features:

✨ KEY FEATURES:
• 🎬 Dynamic Hero Billboard: Showcases the top spotlight video with full-screen cinema gradients, synopsis, and instant playback.
• 🍿 Horizontal Browse Rows: Organizes content into Netflix-style categories (Trending, Recommendations, Subscriptions, Entertainment, Tech).
• 🔍 Smooth Hover Zoom: Hovering over any card smoothly expands the preview with match scores (98% Match), duration, and quick action buttons.
• ℹ Detail Modal: View video descriptions, creator details, audio/subtitle information, and more like this in a Netflix popover window.
• 🎥 Cinema Watch Mode: Clean, distraction-free player styling with Netflix red progress bar.
• ⏳ Post-Play Countdown: Netflix-style "Next video in 8s..." overlay when a video finishes.
• 🎵 Web Audio Ta-Dum Chime: Enjoy the iconic intro chime synthesized right in your browser.
• ⚡ 1-Click Toggle: Switch between YouFlix and native YouTube anytime.

🔒 PRIVACY & SAFETY:
• 100% Client-side: No external tracking, no data harvesting.
• Manifest V3 Compliant: Adheres to the latest security standards.

Disclaimer: YouFlix is an independent open-source project and is not affiliated with, endorsed by, or sponsored by YouTube, LLC or Netflix, Inc.
```

### Category:
- **Primary Category**: `Photos & Media` or `Fun`

### Graphic Assets to Upload:
1. **Store Icon**: `assets/icon128.png` (128x128 px)
2. **Small Promo Tile**: `assets/promo/promo_small_440x280.png` (440x280 px)
3. **Marquee Banner** (optional): `assets/promo/promo_marquee_1400x560.png` (1400x560 px)
4. **Screenshots**: Take 2 to 3 screenshots of YouTube while YouFlix is running locally (`1280x800` or `1920x1080` resolution).

---

## 4. Privacy & Permissions Justification

Google requires specific justifications for every permission requested. Paste these exact responses:

### 1. Single Purpose Description:
```
YouFlix has a single purpose: to redesign the user interface of YouTube into a cinematic, Netflix-style layout with horizontal category carousels and a spotlight hero banner.
```

### 2. Host Permission Justification (`*://*.youtube.com/*`):
```
Host permission for youtube.com is strictly required to inject the CSS stylesheet and content script that restructures YouTube's homepage and watch page into the Netflix layout.
```

### 3. Storage Permission Justification (`storage`):
```
The storage API is used exclusively to save user settings and interface preferences (such as toggling the hero banner, cinema mode, and audio effects) across browser sessions.
```

### 4. Data Usage Questionnaire:
- **Does your product collect user data?** Select **"No"** (YouFlix collects zero personal data).
- Check the box certifying that you comply with the Developer Program Policies.

---

## 5. Free Privacy Policy Template

Every Chrome Web Store item requires a public Privacy Policy URL. You can host this for free on **GitHub Pages** or as a **GitHub Gist**:

```markdown
# Privacy Policy for YouFlix

Last updated: September 2026

YouFlix ("we", "our", or "the extension") is committed to protecting your privacy.

1. Information We Do Not Collect:
YouFlix does not collect, transmit, sell, or store any personally identifiable information, browsing history, cookies, or video viewing activity.

2. Local Storage:
YouFlix uses the browser's local storage API exclusively to remember user preferences (such as UI feature toggles). This data remains strictly on your device and is never sent to external servers.

3. Third-Party Services:
YouFlix does not connect to any third-party analytics, tracking pixels, or remote servers. All styles and scripts run entirely within your local browser.

4. Contact:
If you have questions about this Privacy Policy, please open an issue on our GitHub repository.
```

---

## 6. Publishing to Microsoft Edge Add-ons (100% Free)

Microsoft Edge uses the Chromium engine and accepts the exact same Manifest V3 package:
1. Go to the [Microsoft Partner Center](https://partner.microsoft.com/dashboard/microsoftedge).
2. Sign in with a Microsoft Account (Developer registration is **FREE**).
3. Click **"Create new extension"**.
4. Upload `youflix-extension.zip`.
5. Fill in the same store description and graphic assets.
6. Submit for review (Approval usually takes **24–48 hours**).

---

## 7. Publishing to Mozilla Firefox Add-ons (100% Free)

Firefox supports Manifest V3 extensions:
1. Go to [Firefox Add-on Developer Hub](https://addons.mozilla.org/developers/).
2. Sign in or create a Mozilla account (Free).
3. Click **"Submit a New Add-on"**.
4. Upload `youflix-extension.zip`.
5. Firefox automated validation will scan the zip file.
6. Provide listing description and submit for signing.

---

## 8. Common Rejection Reasons & Prevention

| Common Rejection Reason | How YouFlix Handles It |
| :--- | :--- |
| **Trademark Violation** (e.g. naming it "Netflix for YouTube") | Named `"YouFlix - Cinematic UI for YouTube™"` with standard disclaimer in the description. |
| **Over-broad Permissions** (`<all_urls>` or webRequest) | Limited strictly to `*://*.youtube.com/*` and `storage`. |
| **Remote Code Execution** (loading external JS/CDN) | 100% self-contained code. Zero external dependencies. |
| **Single Purpose Policy** | Strictly visual and navigational overhaul of YouTube. |

Once submitted, monitoring the developer console will show review status. Reviews typically take 1 to 3 business days.
