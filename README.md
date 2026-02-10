# YouTube Actual Runtime

A Firefox extension that shows **real** (wall-clock) time remaining and total when you change playback speed on YouTube.

YouTube’s built-in timer doesn’t account for playback speed, so at 1.5× a “10 minutes left” video actually has about 6–7 minutes of real time. This add-on displays the corrected values next to the player’s time bar.

## Features

- **Real time at any speed** – Remaining and total time adjusted for playback rate (e.g. 1.25×, 1.5×, 2×).
- **Hidden at 1×** – The extra timer is hidden at normal speed so it doesn’t duplicate YouTube’s display.
- **Hover tooltip** – Shows the current playback speed (e.g. “Actual time remaining at 1.5× speed”).
- **Works with playlists and navigation** – Timer re-attaches when you switch videos in a playlist or change pages.

## Installation (Firefox)

https://addons.mozilla.org/en-US/firefox/addon/youtube-actual-runtime/

OR

1. Open `about:debugging` in Firefox.
2. Click **This Firefox** → **Load Temporary Add-on…**.
3. Select the extension folder (or the `manifest.json` file inside it).

**Note:** Temporary add-ons are removed when Firefox restarts. To keep it, use **Permanent installation** from the link above.

## Screenshot

Example of the add-on in use at 1.75x speed.

![Example of the addon in use at 1.75x speed](docs/addon-screenshot.png)

## Tech

- **Firefox** only (Manifest V3, `browser_specific_settings.gecko`).
- **Content script** – runs on `*://www.youtube.com/*`; no background script.
- **Vanilla JS** – no build step, no dependencies.

## License

MIT. See [LICENSE](LICENSE) for details.
