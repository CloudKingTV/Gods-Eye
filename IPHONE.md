# God's Eye View on your iPhone

Your iPhone can't run God's Eye View by itself. The app needs a small Node
server that holds your API keys and fetches the live data (flights, ships,
cameras and so on), and iOS can't run that server. So your computer runs the
app and your iPhone opens it like an app from the Home Screen.

```
iPhone (Safari / Home Screen icon)
   │  private, encrypted Tailscale link: works on Wi-Fi or cellular
   ▼
Your computer: `npm run iphone` → https://<your-computer>.<tailnet>.ts.net:4173
```

[Tailscale](https://tailscale.com) is a free private network for your own
devices. Only devices signed in to your Tailscale account can open the link.
Your home Wi-Fi neighbours and the internet can't. It also gives the page a
real HTTPS certificate, which iPhone Safari requires before it will use the
microphone for voice control.

---

## One-time setup

### 1. On your computer (Mac, Windows or Linux)

1. Install **Node.js 24** (24.14 or later) from [nodejs.org](https://nodejs.org).
2. Get the app:
   ```bash
   git clone https://github.com/CloudKingTV/Gods-Eye.git
   cd Gods-Eye
   npm ci
   npm run doctor
   ```
3. Install **Tailscale** from [tailscale.com/download](https://tailscale.com/download)
   and sign in.
   - **Mac:** use the **standalone** download or `brew install tailscale`. The
     Mac App Store version can't save the HTTPS certificate this setup needs.
   - **Linux:** after installing, run `sudo tailscale set --operator=$USER` once.
4. Open the [Tailscale admin DNS page](https://login.tailscale.com/admin/dns)
   and turn on **MagicDNS** and **HTTPS Certificates**.

### 2. On your iPhone

1. Install **Tailscale** from the App Store.
2. Sign in with the **same account** you used on the computer, and switch it on.

### 3. Optional: add API keys

The app works without keys. To add some (Cesium ion for photorealistic 3D,
OpenAI for voice, and others), run `npm run dev` on the computer, open
`http://localhost:4173`, and click **POWER UP** in the bottom-right corner.
Paste the keys, click **SAVE KEYS**, then stop the server with `Ctrl+C`. The
README's [API Keys](README.md#-api-keys) section describes each key.

You can't add keys from the phone. The key panel only answers on the computer
itself, so a stolen phone or a shared link can't change them.

---

## Every time you want to use it

1. On the computer:
   ```bash
   npm run iphone
   ```
   The app builds in about 20 seconds, then prints a link like
   `https://my-mac.tail1234.ts.net:4173/`.
2. On the iPhone, make sure Tailscale is on, then open that link in **Safari**.
3. The first time, tap **Share → Add to Home Screen**. After that, open the
   app from its own full-screen icon, the same as any other app.

Keep the terminal window open, and keep the computer awake while you use the
app.

- **Mac:** run `caffeinate -i npm run iphone` to stop the Mac sleeping.
- **Windows:** in **Settings → System → Power**, set sleep to **Never** while
  plugged in.

If you change your API keys, stop the server with `Ctrl+C` and run
`npm run iphone` again. The Google Maps and Cesium keys are built into the
app.

---

## Tips for the phone

- **Voice:** tap the mic, then allow the microphone when Safari asks. If you
  said no before, go to **Settings → Apps → Safari → Microphone**.
- **Performance:** Google Photorealistic 3D is the heaviest view. If the phone
  gets hot or choppy, switch the map source to Esri satellite and turn off
  layers you aren't using. Low Power Mode also slows the globe down.
- **Distance fog:** iPhone and iPad skip distance fog on 3D tiles. This is a
  known Apple graphics-driver limitation that the app works around on purpose.
  Nothing is broken.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `Tailscale CLI not found` | Install Tailscale on the computer. If it's in an unusual place, set `TAILSCALE_BIN=/path/to/tailscale`. |
| `HTTPS certificates are off` | Turn on MagicDNS and HTTPS Certificates on the [admin DNS page](https://login.tailscale.com/admin/dns). |
| `tailscale cert failed` | Linux: `sudo tailscale set --operator=$USER`. Mac: switch from the App Store version to the standalone version. |
| The page won't load on the iPhone | Check that Tailscale is on and connected on the phone, and that `npm run iphone` is still running on the computer. |
| `Port 4173 is in use` | Stop the other copy (for example `npm run dev`), or run `PORT=4180 npm run iphone`. |
| `Blocked request. This host is not allowed.` | Open the exact link the terminal printed, not the computer's IP address or another name. |

## Quick look on home Wi-Fi without Tailscale

If the phone and computer are on the same Wi-Fi, you can try it without
Tailscale:

```bash
npm run dev -- --host 0.0.0.0
```

Then open `http://<computer's-local-IP>:4173` on the phone. This has two
downsides:

- Voice won't work, because the page isn't HTTPS.
- Anyone on that Wi-Fi can use your API keys.

Use the Tailscale setup for everyday use.

## Keeping up to date

This repo is a copy of
[bilawalsidhu/gods-eye-view](https://github.com/bilawalsidhu/gods-eye-view)
with the iPhone launcher added. To pull in new versions:

```bash
git remote add upstream https://github.com/bilawalsidhu/gods-eye-view.git   # once
git pull upstream main
npm ci
```

## What was changed for iPhone

- `scripts/iphone-start.mjs` (`npm run iphone`): finds Tailscale, gets this
  machine's `*.ts.net` certificate, builds the app, and serves it over HTTPS
  on the Tailscale address only.
- `build/vite.js` and `server/standalone/vite.config.js`: add optional
  `GEV_HTTPS_CERT` and `GEV_HTTPS_KEY` support, so the app's own server
  handles HTTPS itself instead of relying on a reverse proxy.
  - **No reverse proxy:** the app refuses voice and Google search requests that
    arrive through one, as a deliberate security choice (see
    [SECURITY.md](SECURITY.md)).
  - **HTTP/1.1:** the server stays on HTTP/1.1 so every request keeps the
    `Host` header that the app's host check reads.
- Nothing else in the app's security model changed. The server still accepts
  only its own hostnames, still refuses proxied requests to paid endpoints,
  and still keeps the key panel to the computer itself.
