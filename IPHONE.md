# God's Eye View on your iPhone

Your iPhone can't run God's Eye View by itself. The app needs a small Node
server that fetches the live data (flights, ships, satellites and so on), and
iOS can't run that server. Something else has to run it. There are two ways:

- **[Cloud](#option-a-cloud-no-computer-needed)**: a free Render server runs
  it. You need no computer, and you can set it up entirely from the phone.
  Voice, Google search, TomTom traffic speeds and Mapillary street photos
  don't work this way.
- **[Your own computer](#option-b-your-own-computer-over-tailscale)**: every
  feature works, but the computer has to be on.

---

## Option A: Cloud (no computer needed)

1. On the iPhone, open this link in Safari:
   **https://render.com/deploy?repo=https://github.com/CloudKingTV/Gods-Eye/tree/claude/iphone-setup**
2. Sign up or sign in to Render with **GitHub**. If Render asks for access to
   the repo, allow **CloudKingTV/Gods-Eye**.
3. Render shows the `gods-eye` service and asks for **GEV_ACCESS_PASSWORD**.
   Choose a password of 8 or more characters. Anyone who knows it can use the
   app, so don't reuse an important password.
4. Tap **Apply** or **Deploy**. The first build takes a few minutes. When it
   finishes, open the service and tap its `https://gods-eye-xxxx.onrender.com`
   link.
5. Type the password once. Then tap **Share → Add to Home Screen**, and open
   the app from the new icon. The first time the icon opens, type the password
   again: the Home Screen app keeps its own sign-in, separate from Safari.
   After that, it remembers you for a year.

Things to know:

- **Cost:** the free plan is $0. It goes to sleep after about 15 minutes
  without use, and the next visit takes about a minute to wake it. Render's
  paid **Starter** plan (about $7 a month, at Render → service → Settings →
  Instance Type) keeps it awake.
- **Without keys:** you get Esri satellite imagery, flights, military
  traffic, satellites, earthquakes, weather, launches, public cameras and
  radio.
- **Adding keys:** in Render, open the service, go to **Environment**, add
  keys such as `CESIUM_ION_TOKEN` (photorealistic 3D), `AISSTREAM_API_KEY`
  (ships) or `FIRMS_MAP_KEY` (fires), then save. Render redeploys
  automatically. The README's [API Keys](README.md#-api-keys) section shows
  where to get each one.
- **Features that don't work in the cloud:** voice, Google search, TomTom
  traffic speeds and Mapillary street photos. The app refuses those requests
  whenever they pass through a hosting provider's proxy, as a deliberate
  security choice (see [SECURITY.md](SECURITY.md)). Use Option B if you want
  them.
- **Changing the password:** edit `GEV_ACCESS_PASSWORD` in Render. Every
  device is signed out and has to type the new password.

---

## Option B: Your own computer, over Tailscale

Your computer runs the app, and the iPhone opens it over
[Tailscale](https://tailscale.com), a free private network for your own
devices. It works on Wi-Fi or cellular. Only devices signed in to your
Tailscale account can open the link, and Tailscale also gives the page the
HTTPS certificate that iPhone Safari needs before it will use the microphone.

### One-time setup

#### 1. On your computer (Mac, Windows or Linux)

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

#### 2. On your iPhone

1. Install **Tailscale** from the App Store.
2. Sign in with the **same account** you used on the computer, and switch it on.

#### 3. Optional: add API keys

The app works without keys. To add some (Cesium ion for photorealistic 3D,
OpenAI for voice, and others), run `npm run dev` on the computer, open
`http://localhost:4173`, and click **POWER UP** in the bottom-right corner.
Paste the keys, click **SAVE KEYS**, then stop the server with `Ctrl+C`. The
README's [API Keys](README.md#-api-keys) section describes each key.

You can't add keys from the phone. The key panel only answers on the computer
itself, so a stolen phone or a shared link can't change them.

### Every time you want to use it

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

- `render.yaml` and `scripts/cloud-start.mjs` (`npm run cloud`): the Render
  blueprint, and a launcher that serves the built app behind a password
  (`GEV_ACCESS_PASSWORD`, a sign-in cookie that lasts a year). The launcher
  won't start without a password, because a cloud URL is public.
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
