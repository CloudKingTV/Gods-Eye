import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import { resolveAllowedHosts } from '../../build/allowedHosts.js';
import { createBrowserViteConfig } from '../../build/vite.js';
import { localProviderPlugins } from '../providers/local.js';
import { localMcpPlugin } from '../mcp/plugin.js';
import { apiNotFoundPlugin } from './api-not-found.js';
import { standaloneVoiceTools } from './voiceTools.js';
import { unwatchedRuntimeDirsPlugin } from './unwatched-cache.js';

const root = fileURLToPath(new URL('../../', import.meta.url));

/** TLS from GEV_HTTPS_CERT/GEV_HTTPS_KEY (PEM paths), or undefined for HTTP. */
function httpsFromEnv(env) {
  const cert = String(env.GEV_HTTPS_CERT ?? '').trim();
  const key = String(env.GEV_HTTPS_KEY ?? '').trim();
  if (!cert && !key) return undefined;
  if (!cert || !key)
    throw new Error('Set both GEV_HTTPS_CERT and GEV_HTTPS_KEY, or neither.');
  return { cert: readFileSync(cert), key: readFileSync(key) };
}

/** Load this checkout's configuration and attach its local provider middleware. */
export default defineConfig(({ command, mode }) => {
  const loaded = loadEnv(mode, root, '');
  for (const [key, value] of Object.entries(loaded)) {
    if (process.env[key] === undefined) process.env[key] = value;
  }
  const tools = standaloneVoiceTools();
  return createBrowserViteConfig({
    plugins: [
      ...localProviderPlugins({ realtime: { tools }, gemini: { tools } }),
      localMcpPlugin(),
      apiNotFoundPlugin(),
      unwatchedRuntimeDirsPlugin(),
    ],
    googleApiKey: process.env.GOOGLE_MAPS_API_KEY,
    cesiumToken: process.env.CESIUM_ION_TOKEN,
    mapillaryToken: process.env.MAPILLARY_CLIENT_TOKEN,
    host: process.env.HOST,
    port: process.env.PORT,
    allowedHosts: resolveAllowedHosts(process.env.GEV_ALLOWED_HOSTS),
    https: command === 'build' ? undefined : httpsFromEnv(process.env),
    command,
  });
});
