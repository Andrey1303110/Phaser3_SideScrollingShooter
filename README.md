# Phaser3_SideScrollingShooter

Phaser 3 side-scrolling shooter with a campaign, an endless mode, English and Ukrainian dialogues, and persistent player upgrades.

Designed for Android phones in landscape orientation only, running inside a WebView in the packaged app. Move with the left joystick and hold the fire button on the right; use two fingers to move and shoot simultaneously.

Use Node.js 22.15.0 or newer and install dependencies with `npm ci`.

- `npm start` starts the Webpack development server.
- `npm run build` creates the production site in `dist/`.

On Windows PowerShell, use `npm.cmd` if execution policy blocks `npm.ps1`.

Progress is stored locally on the device using WebView local storage. Clearing the app data removes the save. When storage is unavailable, the game continues with in-memory progress.

Choose **About the game** in the main menu for a short guide to the story, touch controls, game modes, combat and upgrades. Swipe horizontally or tap the large tabs/arrows to change sections; drag vertically to scroll. The guide follows the selected English or Ukrainian language and adapts to different landscape screen sizes.

The repository currently tracks `dist/`, and the Pages workflow publishes that directory directly. Rebuild before deploying source changes. See [REVIEW.md](REVIEW.md) for the code review, fixes and remaining limitations.
