<div align="center">
  <img src=".github/README.png" alt="hallin.media Banner" width="100%" />
</div>

<div align="left">
  <br />
  <!-- REPLACE ALL INSTANCES OF "repo-name" with the repository name -->
  <h1>whallin/spotify-last-played</h1>
  <!-- REPLACE "The repository description" with the repository description -->
  <p>A Cloudflare Worker for fetching the last played track from Spotify.</p>
</div>

<!-- ALWAYS KEEP "Table of Contents" up to date if sections are added or removed -->

## 📋 Table of Contents

- [🚀 Overview](#-overview)
- [🏁 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [🔑 Environment Variables](#-environment-variables)
- [⚙️ Configuration](#%EF%B8%8F-configuration)
- [📖 Usage](#-usage)
- [📦 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)
- [🔒 Security](#-security)
- [📄 License](#-license)
- [👏 Acknowledgements](#-acknowledgements)

<!-- END "Table of Contents" section -->

## 🚀 Overview

spotify-last-played is a Cloudflare Worker that periodically refreshes Spotify access tokens, fetches recently played tracks for one or more accounts, and exposes the most recently played track as a JSON endpoint.

## 🏁 Getting Started

### Prerequisites

- Node.js v18 or higher
- Wrangler CLI (`npm install -g wrangler`)

### Installation

1. Clone the repository:
   ```powershell
   git clone https://github.com/whallin/spotify-last-played.git
   cd spotify-last-played
   ```
2. Install dependencies:
   ```powershell
   npm install
   ```
3. Authenticate Wrangler:
   ```powershell
   wrangler login
   ```

## 🔑 Environment Variables

**Required** environment variables:

- `SPOTIFY_ACCOUNTS`: JSON array of account objects with `refreshToken` and `clientAuth` fields. Example:
  ```powershell
  $Env:SPOTIFY_ACCOUNTS='[{"refreshToken":"<REFRESH_TOKEN>","clientAuth":"<BASE64(clientId:clientSecret)>"}]'
  ```

## ⚙️ Configuration

Configuration options can be set in `wrangler.json`:

- `triggers.crons`: Cron schedules for token refresh (hourly) and track fetch (every 10 minutes).
- KV Namespace Bindings:
  - `spotifyAccessToken`: Namespace for storing Spotify access tokens.
  - `lastPlayedJSON`: Namespace for storing the last played track JSON.

## 📖 Usage

To run locally:
```powershell
npm run dev
```

Fetch the last played track:
```bash
curl https://<YOUR_WORKER_SUBDOMAIN>.workers.dev/
```

Response:
```json
{
  "accountIndex": 0,
  "timestamp": "2025-04-29T12:00:00Z",
  "name": "Track Name",
  "artist": "Artist Name",
  "album_cover": "https://i.scdn.co/image/...",
  "url": "https://open.spotify.com/track/...",
  "duration_ms": 210000,
  "played_at": "2025-04-29T11:59:50Z"
}
```

## 📦 Deployment

Deploy to Cloudflare Workers:
```powershell
npm run deploy
```

<!-- DO NOT MODIFY "Contributing" section -->

## 🤝 Contributing

I accept any and all contributions! Please refer to my [Contributing Guidelines](.github/CONTRIBUTING.md) for more information on the [Code of Conduct](.github/CODE_OF_CONDUCT.md), the development process, the pull request process, and the code standards.

<!-- END "Contributing" section -->
<!-- DO NOT MODIFY "Security" section -->

## 🔒 Security

I, William Hallin, prioritise security. For more information, please see my [Security Policy](.github/SECURITY.md), which covers how to report vulnerabilities, the most recent security patches, best practices, and regulatory requirements.

<!-- END "Security" section -->
<!-- DO NOT MODIFY "License" section -->

## 📄 License

This project is licensed under the **GPL-3.0 License** - please see the [LICENSE](LICENSE) file for further details.

<!-- END "License" section -->

## 👏 Acknowledgements

- [Cloudflare Workers](https://workers.cloudflare.com/) - Serverless execution environment for JavaScript.
- [Spotify Web API](https://developer.spotify.com/documentation/web-api/) - API for accessing Spotify data.

---

<div align="center">
  <p>Made with ❤️ by <a href="https://hallin.media" target="_blank">hallin.media</a></p>
  <p>
    <a href=".github/SUPPORT.md">Support</a> •
    <a href=".github/CONTRIBUTING.md">Contributing</a> •
    <a href=".github/CODE_OF_CONDUCT.md">Code of Conduct</a>
  </p>
</div>
