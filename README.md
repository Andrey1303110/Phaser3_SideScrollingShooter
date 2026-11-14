# Phaser3_SideScrollingShooter

Phaser 3 side-scrolling shooter with a campaign, an endless mode, English and Ukrainian dialogues, and persistent player upgrades.

Use Node.js 22.15.0 or newer and install dependencies with `npm ci`.

- `npm start` starts the Webpack development server.
- `npm run build` creates the production site in `dist/`.

On Windows PowerShell, use `npm.cmd` if execution policy blocks `npm.ps1`.

Progress is stored in browser local storage. When storage is unavailable, the game continues with in-memory progress.

The repository currently tracks `dist/`, and the Pages workflow publishes that directory directly. Rebuild before deploying source changes. See [REVIEW.md](REVIEW.md) for the code review, fixes and remaining limitations.
