/**
 * Scene recipes optimized for short social clips.
 * Each recipe is deterministic so repeated runs produce similar footage.
 */

import { expandNepalEvidencePack } from './nepalEvidencePack.js';
import { msg, t } from '../i18n/index.js';

const BHOTE_KOSHI_NEPAL_BASE_RECIPE = Object.freeze({
  id: 'bhote-koshi-nepal-evidence-pack',
  version: 12,
  title: msg('Bhote Koshi Evidence Sequence'),
  style: 'normal',
  ui: { hidePanels: false, hudMode: 'full', safeFrame: '16:9' },
  layers: {
    'bhote-koshi-locator': false,
  },
  releaseLayerIds: ['bhote-koshi-2026', 'bhote-koshi-locator'],
  post: {
    bloom: 0,
    sharpen: true,
    detectionMode: 'OFF',
    mapStack: 'photoreal',
  },
  legacySceneBootstrap: {
    targetSceneTitle: 'Nepal Flood Incident',
    fromShotTitles: ['Shot 1', 'Shot 2', 'Shot 3'],
    cameraPath: [
      {
        // i18n-ignore: stored shot title, matched verbatim
        title: 'Global Incident Context',
        lat: 27.5962,
        lon: 78.5718,
        alt: 15628002,
        heading: 0,
        pitch: -90,
        roll: 0,
        duration: 4,
        hold: 0.9,
        layers: {
          'bhote-koshi-locator': {
            enabled: true,
            params: { presentation: 'nepal-context' },
          },
        },
      },
      {
        // i18n-ignore: stored shot title, matched verbatim
        title: 'Nepal-Focused Globe Rotation',
        lat: 28.7248,
        lon: 81.3226,
        alt: 2068966,
        heading: 0,
        pitch: -90,
        roll: 0,
        duration: 4,
        hold: 0.9,
        layers: {
          'bhote-koshi-locator': {
            enabled: true,
            params: { presentation: 'nepal-context' },
          },
        },
      },
      {
        // i18n-ignore: stored shot title, matched verbatim
        title: 'Bhote Koshi Regional Approach',
        lat: 27.0354,
        lon: 84.6287,
        alt: 809543,
        heading: 0,
        pitch: -90,
        roll: 0,
        duration: 4,
        hold: 0.9,
        layers: {
          'bhote-koshi-locator': {
            enabled: true,
            params: { presentation: 'bhote-koshi-regional' },
          },
        },
      },
      {
        // i18n-ignore: stored shot title, matched verbatim
        title: 'Bhote Koshi Nearby Cities',
        lat: 27.891,
        lon: 85.428,
        alt: 225734,
        heading: 0,
        pitch: -90,
        roll: 0,
        duration: 4,
        hold: 0.9,
        layers: {
          'bhote-koshi-locator': {
            enabled: true,
            params: { presentation: 'bhote-koshi-city-context' },
          },
        },
      },
      {
        // i18n-ignore: stored shot title, matched verbatim
        title: 'Bhote Koshi Incident Corridor',
        lat: 28.0529,
        lon: 85.2189,
        alt: 126931,
        heading: 0,
        pitch: -90,
        roll: 0,
        duration: 4,
        hold: 11,
        layers: {
          'bhote-koshi-locator': {
            enabled: true,
            params: { presentation: 'bhote-koshi-incident-places' },
          },
        },
      },
      {
        // i18n-ignore: stored shot title, matched verbatim
        title: 'Bhote Koshi Flood Path',
        lat: 28.1691,
        lon: 85.352,
        alt: 60328,
        heading: 0,
        pitch: -90,
        roll: 0,
        duration: 4,
        hold: 0.9,
        layers: {
          'bhote-koshi-locator': {
            enabled: true,
            params: { presentation: 'bhote-koshi-flood-path' },
          },
        },
      },
      {
        // i18n-ignore: stored shot title, matched verbatim
        title: 'Bhote Koshi Corridor Overview',
        lat: 27.8986,
        lon: 84.8723,
        alt: 53247,
        heading: 60,
        pitch: -48,
        roll: 0,
        duration: 4,
        hold: 0.9,
        layers: {
          'bhote-koshi-locator': {
            enabled: true,
            params: { presentation: 'bhote-koshi-path-overview' },
          },
        },
      },
      {
        // i18n-ignore: stored shot title, matched verbatim
        title: 'Bhote Koshi Upper Valley',
        lat: 28.4187,
        lon: 85.4341,
        alt: 7977,
        heading: 155,
        pitch: -28,
        roll: 0,
        duration: 4,
        hold: 8,
        layers: {
          'bhote-koshi-locator': {
            enabled: true,
            params: { presentation: 'bhote-koshi-trigger-record' },
          },
        },
      },
    ],
  },
  requiredShotTitles: [
    'Global Incident Context',
    'Nepal-Focused Globe Rotation',
    'Bhote Koshi Regional Approach',
    'Bhote Koshi Nearby Cities',
    'Bhote Koshi Incident Corridor',
    'Bhote Koshi Flood Path',
    'Bhote Koshi Corridor Overview',
    'Bhote Koshi Upper Valley',
    'Upper Valley Collapse',
    'Debris-Dammed Lake',
    'Nepal-China Border Gate',
    'Timure Evidence Cluster',
    'Syabru Besi Passage',
    'Bidur / Trishuli Consequence',
  ],
  requiredSourcePackBeatIds: [
    'immediate-collapse-viewpoint',
    'debris-dammed-lake',
    'gyirong-border-gate',
    'timure-cluster',
    'syabru-besi',
    'bidur-trishuli-bridge',
  ],
  requiredSourcePackLayerId: 'bhote-koshi-2026',
  photorealSurfaceBeatIds: [
    'gyirong-border-gate',
    'timure-cluster',
    'syabru-besi',
    'bidur-trishuli-bridge',
  ],
  runtimeControlsByBeat: {
    'immediate-collapse-viewpoint': { evidenceMediaAutoplay: true },
    'debris-dammed-lake': { evidenceMediaAutoplay: true },
    'gyirong-border-gate': {
      imageryComparison: true,
      evidenceSequence: true,
      evidenceSequenceDurationSec: 2.5,
      deferEvidenceUntilCameraSettled: true,
      evidenceRevealDurationSec: 2.5,
    },
    'timure-cluster': {
      imageryComparison: true,
      evidenceSequence: true,
      evidenceSequenceDurationSec: 4,
    },
    'syabru-besi': {
      imageryComparison: true,
      evidenceSequence: true,
      evidenceSequenceDurationSec: 4,
    },
    'bidur-trishuli-bridge': {
      evidenceSequence: true,
      evidenceSequenceDurationSec: 4,
    },
  },
  shotPatches: [
    {
      // i18n-ignore: stored shot title, matched verbatim
      title: 'Global Incident Context',
      visual: { mapStack: 'photoreal' },
      layers: {
        'bhote-koshi-2026': {
          enabled: true,
          params: {
            presentation: 'scene-beat',
            beatId: 'immediate-collapse-viewpoint',
            beatReveal: 0.36,
            split: 0.5,
          },
        },
      },
    },
    {
      // i18n-ignore: stored shot title, matched verbatim
      title: 'Nepal-Focused Globe Rotation',
      visual: { mapStack: 'photoreal' },
      layers: {
        'bhote-koshi-2026': {
          enabled: true,
          params: {
            presentation: 'scene-beat',
            beatId: 'debris-dammed-lake',
            beatReveal: 0.36,
            split: 0.5,
          },
        },
      },
    },
    {
      // i18n-ignore: stored shot title, matched verbatim
      title: 'Bhote Koshi Regional Approach',
      visual: { mapStack: 'photoreal' },
      layers: {
        'bhote-koshi-2026': {
          enabled: true,
          params: {
            presentation: 'scene-beat',
            beatId: 'gyirong-border-gate',
            beatReveal: 0.36,
            split: 0.5,
          },
        },
      },
    },
    {
      // i18n-ignore: stored shot title, matched verbatim
      title: 'Bhote Koshi Nearby Cities',
      visual: { mapStack: 'photoreal' },
      layers: {
        'bhote-koshi-2026': {
          enabled: true,
          params: {
            presentation: 'scene-beat',
            beatId: 'timure-cluster',
            beatReveal: 0.36,
            split: 0.5,
          },
        },
      },
    },
    {
      // i18n-ignore: stored shot title, matched verbatim
      title: 'Bhote Koshi Incident Corridor',
      camera: {
        lat: 28.0529,
        lon: 85.2189,
        alt: 126931,
        heading: 0,
        pitch: -90,
        roll: 0,
      },
      holdSec: 11,
      visual: { mapStack: 'photoreal' },
      layers: {
        'bhote-koshi-2026': {
          enabled: true,
          params: {
            presentation: 'scene-beat',
            beatId: 'syabru-besi',
            beatReveal: 0.36,
            split: 0.5,
          },
        },
      },
    },
    {
      // i18n-ignore: stored shot title, matched verbatim
      title: 'Bhote Koshi Flood Path',
      visual: { mapStack: 'photoreal' },
      layers: {
        'bhote-koshi-2026': {
          enabled: true,
          params: {
            presentation: 'scene-beat',
            beatId: 'bidur-trishuli-bridge',
            beatReveal: 0.36,
            split: 0.5,
          },
        },
      },
    },
    {
      // i18n-ignore: stored shot title, matched verbatim
      title: 'Bhote Koshi Corridor Overview',
      visual: { mapStack: 'photoreal' },
      layers: {
        'bhote-koshi-2026': {
          enabled: true,
          params: {
            presentation: 'scene-beat',
            beatId: 'gyirong-border-gate',
            beatReveal: 0.36,
            split: 0.5,
          },
        },
      },
    },
    {
      // i18n-ignore: stored shot title, matched verbatim
      title: 'Bhote Koshi Upper Valley',
      holdSec: 8,
      visual: { mapStack: 'photoreal' },
      layers: {
        'bhote-koshi-2026': {
          enabled: true,
          params: {
            presentation: 'scene-beat',
            beatId: 'immediate-collapse-viewpoint',
            beatReveal: 0.36,
            split: 0.5,
          },
        },
        'bhote-koshi-locator': {
          enabled: true,
          params: {
            presentation: 'bhote-koshi-trigger-record',
          },
        },
      },
    },
    {
      // i18n-ignore: stored shot title, matched verbatim
      title: 'Upper Valley Collapse',
      camera: {
        lat: 28.417,
        lon: 85.3937,
        alt: 9850,
        heading: 146,
        pitch: -34,
        roll: 0,
      },
      layers: {
        'bhote-koshi-2026': {
          enabled: true,
          params: {
            presentation: 'scene-beat',
            beatId: 'immediate-collapse-viewpoint',
            beatReveal: 0.36,
            split: 0.5,
            sceneControls: { evidenceMediaAutoplay: true },
          },
        },
      },
    },
    {
      // i18n-ignore: stored shot title, matched verbatim
      title: 'Nepal-China Border Gate',
      visual: { mapStack: 'photoreal' },
    },
    {
      // i18n-ignore: stored shot title, matched verbatim
      title: 'Timure Evidence Cluster',
      visual: { mapStack: 'photoreal' },
    },
    {
      // i18n-ignore: stored shot title, matched verbatim
      title: 'Syabru Besi Passage',
      visual: { mapStack: 'photoreal' },
    },
    {
      // i18n-ignore: stored shot title, matched verbatim
      title: 'Bidur / Trishuli Consequence',
      visual: { mapStack: 'photoreal' },
    },
  ],
  cameraPath: [
    {
      // i18n-ignore: stored shot title, matched verbatim
      title: 'Upper Valley Collapse',
      lat: 28.417,
      lon: 85.3937,
      alt: 9850,
      heading: 146,
      pitch: -34,
      roll: 0,
      duration: 4.2,
      hold: 1.4,
      layers: {
        'bhote-koshi-2026': {
          enabled: true,
          params: {
            presentation: 'scene-beat',
            beatId: 'immediate-collapse-viewpoint',
            beatReveal: 0.36,
            split: 0.5,
            sceneControls: { evidenceMediaAutoplay: true },
          },
        },
      },
    },
    {
      // i18n-ignore: stored shot title, matched verbatim
      title: 'Debris-Dammed Lake',
      lat: 28.392914,
      lon: 85.570921,
      alt: 10744,
      heading: 232,
      pitch: -37,
      roll: 0,
      duration: 4.2,
      hold: 1.4,
      layers: {
        'bhote-koshi-2026': {
          enabled: true,
          params: {
            presentation: 'scene-beat',
            beatId: 'debris-dammed-lake',
            beatReveal: 0.36,
            split: 0.5,
            sceneControls: { evidenceMediaAutoplay: true },
          },
        },
      },
    },
    {
      // i18n-ignore: stored shot title, matched verbatim
      title: 'Nepal-China Border Gate',
      mapStack: 'photoreal',
      lat: 28.316789,
      lon: 85.399734,
      alt: 5900,
      heading: 208,
      pitch: -42,
      roll: 0,
      duration: 4.2,
      hold: 2.5,
      layers: {
        'bhote-koshi-2026': {
          enabled: true,
          params: {
            presentation: 'scene-beat',
            beatId: 'gyirong-border-gate',
            beatReveal: 0.36,
            split: 0.5,
            sceneControls: {
              imageryComparison: true,
              evidenceSequence: true,
              evidenceSequenceDurationSec: 2.5,
              deferEvidenceUntilCameraSettled: true,
              evidenceRevealDurationSec: 2.5,
            },
          },
        },
      },
    },
    {
      // i18n-ignore: stored shot title, matched verbatim
      title: 'Timure Evidence Cluster',
      mapStack: 'photoreal',
      lat: 28.285968,
      lon: 85.379136,
      alt: 5032,
      heading: 198,
      pitch: -40,
      roll: 0,
      duration: 4.2,
      hold: 4,
      layers: {
        'bhote-koshi-2026': {
          enabled: true,
          params: {
            presentation: 'scene-beat',
            beatId: 'timure-cluster',
            beatReveal: 0.36,
            split: 0.5,
            sceneControls: {
              imageryComparison: true,
              evidenceSequence: true,
              evidenceSequenceDurationSec: 4,
            },
          },
        },
      },
    },
    {
      // i18n-ignore: stored shot title, matched verbatim
      title: 'Syabru Besi Passage',
      mapStack: 'photoreal',
      lat: 28.210306,
      lon: 85.361527,
      alt: 5893,
      heading: 205,
      pitch: -38,
      roll: 0,
      duration: 4.2,
      hold: 4,
      layers: {
        'bhote-koshi-2026': {
          enabled: true,
          params: {
            presentation: 'scene-beat',
            beatId: 'syabru-besi',
            beatReveal: 0.36,
            split: 0.5,
            sceneControls: {
              imageryComparison: true,
              evidenceSequence: true,
              evidenceSequenceDurationSec: 4,
            },
          },
        },
      },
    },
    {
      // i18n-ignore: stored shot title, matched verbatim
      title: 'Bidur / Trishuli Consequence',
      mapStack: 'photoreal',
      lat: 27.981737,
      lon: 85.196273,
      alt: 7422,
      heading: 215,
      pitch: -40,
      roll: 0,
      duration: 4.2,
      hold: 4,
      layers: {
        'bhote-koshi-2026': {
          enabled: true,
          params: {
            presentation: 'scene-beat',
            beatId: 'bidur-trishuli-bridge',
            beatReveal: 0.36,
            split: 0.5,
            sceneControls: {
              evidenceSequence: true,
              evidenceSequenceDurationSec: 4,
            },
          },
        },
      },
    },
  ],
});

const BHOTE_KOSHI_NEPAL_APPEND_RECIPE = BHOTE_KOSHI_NEPAL_BASE_RECIPE
  ? expandNepalEvidencePack(BHOTE_KOSHI_NEPAL_BASE_RECIPE)
  : null;

// Fresh browser origins have no legacy three-shot Nepal project for the
// append recipe to upgrade. Seed that exact legacy shape so SceneDirector can
// run the same idempotent bootstrap used by existing browser-saved projects.
const BHOTE_KOSHI_NEPAL_BOOTSTRAP_RECIPE = BHOTE_KOSHI_NEPAL_APPEND_RECIPE
  ? Object.freeze({
      id: 'bhote-koshi-nepal-scene',
      title: msg('Nepal Flood Incident'),
      durationSec: 15,
      style: BHOTE_KOSHI_NEPAL_APPEND_RECIPE.style,
      ui: BHOTE_KOSHI_NEPAL_APPEND_RECIPE.ui,
      layers: BHOTE_KOSHI_NEPAL_APPEND_RECIPE.layers,
      releaseLayerIds: BHOTE_KOSHI_NEPAL_APPEND_RECIPE.releaseLayerIds,
      post: BHOTE_KOSHI_NEPAL_APPEND_RECIPE.post,
      installAlongsideSceneId: 'bhote-koshi-flood',
      installAlongsideFallbackSceneId: 'flights-radar',
      cameraPath:
        BHOTE_KOSHI_NEPAL_APPEND_RECIPE.legacySceneBootstrap.cameraPath
          .slice(0, 3)
          .map((keyframe, index) => ({
            ...keyframe,
            // i18n-ignore: legacy shot titles the bootstrap matches verbatim
            title: `Shot ${index + 1}`,
          })),
    })
  : null;

// CFB Wainwright fire, 17 Oct 2026. A data-only event: Sentinel-2 before/after
// crops, an outline derived from them and two reference points, all served
// from public/scene-assets/wainwright-2026 (see its README for provenance and
// interpretation limits).
const WAINWRIGHT_IMAGE_BOUNDS = Object.freeze([-111.0, 52.715, -110.8, 52.845]);
const WAINWRIGHT_OVERLAY_HEIGHT = 740;
const SENTINEL_ATTRIBUTION = Object.freeze({
  text: 'Contains modified Copernicus Sentinel data 2026',
  license: 'Copernicus Sentinel data terms (free, full and open)',
  url: 'https://sentinels.copernicus.eu/documents/247904/690755/Sentinel_Data_Legal_Notice',
});
const WAINWRIGHT_TIMELINE_URL =
  'https://globalnews.ca/news/12107726/cfb-wainwright-timeline/';
const WAINWRIGHT_DND_URL =
  'https://www.canada.ca/en/department-national-defence/news/2026/10/incident-at-canadian-forces-base-wainwright.html';

const WAINWRIGHT_CARDS = Object.freeze([
  {
    id: 'about-camp',
    // i18n-ignore: authored scene data, shown as stored
    label: 'Camp Wainwright',
    target: { packId: 'outline', featureId: 'camp-wainwright' },
    action: {
      type: 'card',
      text: 'Camp Wainwright, CFB Wainwright, Alberta. On 17 October 2026, at about 4 p.m. local time, a grass fire started in the training area during live-fire training (Exercise APOLLO SHOOTER). High winds drove it quickly over a unit administrative area. Four Canadian Armed Forces members were killed and dozens were injured. The Municipal District of Wainwright reported the fire held just after 10:45 p.m. The cause is under investigation. Marker: approximate centre of the built-up camp area, read from the satellite image.',
      url: WAINWRIGHT_TIMELINE_URL,
    },
  },
  {
    id: 'about-scar',
    // i18n-ignore: authored scene data, shown as stored
    label: 'Burn scar estimate',
    target: { packId: 'outline', featureId: 'burn-scar' },
    action: {
      type: 'card',
      text: 'Unofficial burn-scar estimate, not a fire perimeter. Traced where the Normalized Burn Ratio dropped by more than 0.27 between the cloud-masked Sentinel-2 images of 4 and 19 October 2026: about 1,120 ha in this area plus about 107 ha west of the lake (about 12 km² in total), spanning 6.3 km west-northwest to east-southeast. Thin cloud covers the eastern edge on 19 October, so burned ground there may be missed. The darker area south of the lake is an older scar that already appears on 4 October. The ignition point and the direction of spread are not known from these images.',
      url: WAINWRIGHT_DND_URL,
    },
  },
  {
    id: 'about-scar-west',
    // i18n-ignore: authored scene data, shown as stored
    label: 'West of the lake',
    target: { packId: 'outline', featureId: 'burn-scar-2' },
    action: {
      type: 'card',
      text: 'A second patch of new burn signal, about 107 ha, on the west shore of the lake. Same method and limits as the main outline.',
    },
  },
]);

const WAINWRIGHT_FIRE_RECIPE = Object.freeze({
  id: 'wainwright-fire-2026',
  version: 1,
  title: msg('Wainwright Fire'),
  durationSec: 64,
  style: 'normal',
  ui: { hidePanels: false, hudMode: 'minimal', safeFrame: '16:9' },
  layers: {},
  post: {
    bloom: 0,
    sharpen: true,
    detectionMode: 'OFF',
    mapStack: 'esri-imagery',
  },
  installAlongsideSceneId: 'bhote-koshi-nepal-scene',
  installAlongsideFallbackSceneId: 'flights-radar',
  // A story: START plays these shots alone, captioned, with no video frame.
  playback: { single: true, safeFrame: 'none' },
  dataPacks: [
    {
      id: 'before',
      version: 1,
      format: 'image',
      source: {
        adapter: 'assets',
        path: 'wainwright-2026/before-2026-10-04.png',
      },
      attribution: SENTINEL_ATTRIBUTION,
      placement: {
        bounds: [...WAINWRIGHT_IMAGE_BOUNDS],
        height: WAINWRIGHT_OVERLAY_HEIGHT,
        altitudeReference: 'ellipsoid',
      },
    },
    {
      id: 'after',
      version: 1,
      format: 'image',
      source: {
        adapter: 'assets',
        path: 'wainwright-2026/after-2026-10-19.png',
      },
      attribution: SENTINEL_ATTRIBUTION,
      placement: {
        bounds: [...WAINWRIGHT_IMAGE_BOUNDS],
        height: WAINWRIGHT_OVERLAY_HEIGHT,
        altitudeReference: 'ellipsoid',
      },
    },
    {
      id: 'outline',
      version: 1,
      format: 'geojson',
      source: { adapter: 'assets', path: 'wainwright-2026/burn-scar.json' },
      attribution: {
        text: 'Burn-scar outline derived from modified Copernicus Sentinel data 2026',
        license: 'Copernicus Sentinel data terms (free, full and open)',
      },
      placement: { altitudeReference: 'ellipsoid' },
    },
  ],
  cameraPath: [
    {
      title: msg('Alberta Overview'),
      caption: msg(
        'CFB Wainwright, in east-central Alberta. On 17 October 2026 a grass fire swept across part of the base’s training area.',
      ),
      lat: 53.4,
      lon: -113.0,
      alt: 1400000,
      pitch: -90,
      duration: 5,
      hold: 3,
    },
    {
      title: msg('CFB Wainwright Training Area'),
      caption: msg(
        'The camp lies just south of the town of Wainwright (cyan dots). The cyan line marks the ground that burned.',
      ),
      lat: 52.78,
      lon: -110.9,
      alt: 42000,
      pitch: -90,
      duration: 6,
      hold: 5,
      dataPackIds: ['outline'],
      interactions: WAINWRIGHT_CARDS,
    },
    {
      title: msg('Before: 4 Oct 2026'),
      caption: msg(
        'Satellite image from 4 October 2026, two weeks before the fire. Note the dry grassland north of the lake.',
      ),
      lat: 52.775,
      lon: -110.9,
      alt: 19000,
      pitch: -90,
      duration: 3,
      hold: 6,
      dataPackIds: ['before'],
    },
    {
      title: msg('After: 19 Oct 2026'),
      caption: msg(
        'The same view on 19 October 2026, two days after the fire. The dark ground north and east of the lake is new burn scar.',
      ),
      lat: 52.775,
      lon: -110.9,
      alt: 19000,
      pitch: -90,
      duration: 1,
      hold: 6,
      dataPackIds: ['after'],
    },
    {
      title: msg('Burn Scar Outline'),
      caption: msg(
        'About 12 km² burned, across 6.3 km. Estimated from the two satellite images; not an official fire perimeter.',
      ),
      lat: 52.765,
      lon: -110.9,
      alt: 13000,
      pitch: -90,
      duration: 2.5,
      hold: 7,
      dataPackIds: ['after', 'outline'],
      interactions: WAINWRIGHT_CARDS,
    },
    {
      title: msg('Burn Scar Over Before Image'),
      caption: msg(
        'The same outline on the 4 October image: how this ground looked before it burned.',
      ),
      lat: 52.765,
      lon: -110.9,
      alt: 13000,
      pitch: -90,
      duration: 1,
      hold: 6,
      dataPackIds: ['before', 'outline'],
      interactions: WAINWRIGHT_CARDS,
    },
    {
      title: msg('Low-Angle Scar View'),
      caption: msg(
        'A low-angle view from the southeast, looking across the burned area.',
      ),
      lat: 52.705,
      lon: -110.83,
      alt: 5200,
      heading: 300,
      pitch: -28,
      duration: 6,
      hold: 6,
      dataPackIds: ['after', 'outline'],
      interactions: WAINWRIGHT_CARDS,
    },
  ],
});

const EVENT_RECIPES = [
  BHOTE_KOSHI_NEPAL_BOOTSTRAP_RECIPE,
  WAINWRIGHT_FIRE_RECIPE,
].filter(Boolean);

const PUBLIC_SCENE_RECIPES = [
  {
    id: 'flights-radar',
    title: msg('Global Flights Radar'),
    durationSec: 30,
    style: 'retro',
    ui: { hidePanels: true, hudMode: 'minimal', safeFrame: '16:9' },
    layers: {
      flights: true,
      satellites: false,
      earthquakes: false,
      traffic: false,
    },
    post: {
      bloom: 62,
      sharpen: true,
      detectionMode: 'OFF',
    },
    cameraPath: [
      {
        lat: 20.0,
        lon: -30.0,
        alt: 19000000,
        heading: 25,
        pitch: -65,
        roll: 0,
        duration: 6,
        hold: 1,
      },
      {
        lat: 46.0,
        lon: 2.0,
        alt: 8000000,
        heading: 40,
        pitch: -52,
        roll: 0,
        duration: 5,
        hold: 1,
      },
      {
        lat: 35.0,
        lon: 139.0,
        alt: 4200000,
        heading: 22,
        pitch: -46,
        roll: 0,
        duration: 5,
        hold: 1,
      },
      {
        lat: 37.6,
        lon: -122.4,
        alt: 1700000,
        heading: 8,
        pitch: -40,
        roll: 0,
        duration: 5,
        hold: 1,
      },
      {
        lat: 0.0,
        lon: -20.0,
        alt: 12000000,
        heading: -10,
        pitch: -70,
        roll: 0,
        duration: 4,
        hold: 0,
      },
    ],
  },
  {
    id: 'orbital-watch',
    title: msg('Orbital Watch'),
    durationSec: 32,
    style: 'surveillance',
    ui: { hidePanels: true, hudMode: 'full', safeFrame: '16:9' },
    layers: {
      flights: false,
      satellites: true,
      earthquakes: false,
      traffic: false,
    },
    post: {
      bloom: 58,
      sharpen: false,
      detectionMode: 'SPARSE',
      styleParams: {
        surveillance: {
          gain: 0.62,
          bloom: 0.38,
          scanlineStr: 0.9,
          pixelation: 2.1,
        },
      },
    },
    cameraPath: [
      {
        lat: 28.0,
        lon: -82.0,
        alt: 22000000,
        heading: 0,
        pitch: -82,
        roll: 0,
        duration: 7,
        hold: 1,
      },
      {
        lat: 10.0,
        lon: 20.0,
        alt: 12000000,
        heading: 18,
        pitch: -74,
        roll: 0,
        duration: 5,
        hold: 1,
      },
      {
        lat: 35.7,
        lon: 139.7,
        alt: 6500000,
        heading: 24,
        pitch: -64,
        roll: 0,
        duration: 5,
        hold: 1,
      },
      {
        lat: 48.8,
        lon: 2.3,
        alt: 3000000,
        heading: 32,
        pitch: -58,
        roll: 0,
        duration: 5,
        hold: 1,
      },
      {
        lat: 30.0,
        lon: -25.0,
        alt: 15000000,
        heading: -20,
        pitch: -78,
        roll: 0,
        duration: 4,
        hold: 0,
      },
    ],
  },
  {
    id: 'thermal-threats',
    title: msg('Thermal Threat Board'),
    durationSec: 26,
    style: 'thermal',
    ui: { hidePanels: true, hudMode: 'full', safeFrame: '16:9' },
    layers: {
      flights: false,
      satellites: false,
      earthquakes: true,
      traffic: false,
    },
    post: {
      bloom: 72,
      sharpen: true,
      detectionMode: 'OFF',
      styleParams: {
        thermal: {
          sensitivity: 0.84,
          bloom: 0.78,
          mode: 0.0,
          pixelation: 1.9,
        },
      },
    },
    cameraPath: [
      {
        lat: 37.0,
        lon: -121.0,
        alt: 5200000,
        heading: 20,
        pitch: -62,
        roll: 0,
        duration: 5,
        hold: 1,
      },
      {
        lat: 35.7,
        lon: 140.0,
        alt: 3100000,
        heading: 5,
        pitch: -55,
        roll: 0,
        duration: 5,
        hold: 1,
      },
      {
        lat: -36.8,
        lon: 174.7,
        alt: 2600000,
        heading: -12,
        pitch: -50,
        roll: 0,
        duration: 5,
        hold: 1,
      },
      {
        lat: 38.0,
        lon: -10.0,
        alt: 9000000,
        heading: 12,
        pitch: -70,
        roll: 0,
        duration: 4,
        hold: 0,
      },
    ],
  },
  {
    id: 'city-overload',
    title: msg('City Overload'),
    durationSec: 30,
    style: 'surveillance',
    ui: { hidePanels: true, hudMode: 'minimal', safeFrame: '9:16' },
    layers: {
      flights: true,
      satellites: true,
      earthquakes: false,
      traffic: true,
    },
    post: {
      bloom: 65,
      sharpen: true,
      detectionMode: 'PANOPTIC',
      styleParams: {
        surveillance: {
          gain: 0.68,
          bloom: 0.42,
          scanlineStr: 1.0,
          pixelation: 2.4,
        },
      },
    },
    cameraPath: [
      {
        lat: 40.73,
        lon: -74.0,
        alt: 1500000,
        heading: 25,
        pitch: -44,
        roll: 0,
        duration: 5,
        hold: 1,
      },
      {
        lat: 40.73,
        lon: -74.0,
        alt: 550000,
        heading: 58,
        pitch: -36,
        roll: 0,
        duration: 4,
        hold: 1,
      },
      {
        lat: 40.73,
        lon: -74.0,
        alt: 260000,
        heading: 102,
        pitch: -33,
        roll: 0,
        duration: 4,
        hold: 1,
      },
      {
        lat: 34.05,
        lon: -118.24,
        alt: 1200000,
        heading: 45,
        pitch: -42,
        roll: 0,
        duration: 5,
        hold: 1,
      },
      {
        lat: 51.5,
        lon: -0.12,
        alt: 1200000,
        heading: 22,
        pitch: -44,
        roll: 0,
        duration: 5,
        hold: 0,
      },
    ],
  },
  {
    id: 'omniscience-pullback',
    title: msg('Omniscience Pullback'),
    durationSec: 36,
    style: 'retro',
    ui: { hidePanels: true, hudMode: 'full', safeFrame: '16:9' },
    layers: {
      flights: true,
      satellites: true,
      earthquakes: true,
      traffic: true,
    },
    post: {
      bloom: 68,
      sharpen: true,
      detectionMode: 'SPARSE',
      styleParams: {
        retro: {
          pixelation: 4.4,
          distortion: 0.42,
          instability: 0.58,
        },
      },
    },
    cameraPath: [
      {
        lat: 35.68,
        lon: 139.76,
        alt: 280000,
        heading: 30,
        pitch: -26,
        roll: 0,
        duration: 5,
        hold: 1,
      },
      {
        lat: 35.68,
        lon: 139.76,
        alt: 900000,
        heading: 26,
        pitch: -38,
        roll: 0,
        duration: 4,
        hold: 1,
      },
      {
        lat: 35.68,
        lon: 139.76,
        alt: 3800000,
        heading: 18,
        pitch: -52,
        roll: 0,
        duration: 5,
        hold: 1,
      },
      {
        lat: 20.0,
        lon: 110.0,
        alt: 9500000,
        heading: 8,
        pitch: -66,
        roll: 0,
        duration: 5,
        hold: 1,
      },
      {
        lat: 5.0,
        lon: 30.0,
        alt: 18000000,
        heading: -8,
        pitch: -78,
        roll: 0,
        duration: 6,
        hold: 0,
      },
    ],
  },
];

/** Build the recipe list without mutating stored user-authored projects. */
export function createSceneRecipes({ localDemoRecipes = EVENT_RECIPES } = {}) {
  return [...localDemoRecipes, ...PUBLIC_SCENE_RECIPES];
}

export const SCENE_RECIPES = createSceneRecipes();

export const SCENE_APPEND_RECIPES = BHOTE_KOSHI_NEPAL_APPEND_RECIPE
  ? [BHOTE_KOSHI_NEPAL_APPEND_RECIPE]
  : [];

export function getSceneRecipeById(id) {
  return SCENE_RECIPES.find((recipe) => recipe.id === id) || null;
}

/** The recipe keyframe that captions a built-in shot, or null. */
function captionKeyframe(scene, shot) {
  const recipe = getSceneRecipeById(scene?.id);
  if (!recipe || shot?.sourcePackId !== recipe.id) return null;
  const keyframe = recipe.cameraPath?.find(({ title }) => title === shot.title);
  return keyframe?.caption ? keyframe : null;
}

/**
 * Caption for a built-in shot during a run: its step in the scene, its title
 * and the recipe keyframe's `caption`. '' when the recipe authors none, or
 * the shot is not the recipe's own (a user-captured or renamed shot).
 * @param {{id?: string, shots?: object[]}} scene
 * @param {{id?: string, title?: string, sourcePackId?: string}} shot
 * @returns {string}
 */
export function sceneShotCaption(scene, shot) {
  const keyframe = captionKeyframe(scene, shot);
  if (!keyframe) return '';
  const index = scene.shots.findIndex(({ id }) => id === shot.id);
  const step = t('Step {n} of {total}', {
    n: index + 1,
    total: scene.shots.length,
  });
  return `${step} · ${displayShotTitle(shot.title, shot, scene)}\n${t(keyframe.caption)}`;
}

/**
 * Reading time a captioned built-in shot holds for at least: the recipe's
 * current hold, so a project saved from an earlier, shorter recipe still
 * leaves time to read. 0 for any other shot.
 * @returns {number}
 */
export function sceneShotCaptionHoldSec(scene, shot) {
  return Number(captionKeyframe(scene, shot)?.hold) || 0;
}

export function getSceneAppendRecipeById(id) {
  return SCENE_APPEND_RECIPES.find((recipe) => recipe.id === id) || null;
}

// Built-in shot titles stay English in recipes and saved projects (upgrades
// and bindings match them verbatim). These are their display names; a title
// the user typed shows as typed. Place names inside them stay Latin.
const BUILTIN_SHOT_TITLES = new Set([
  msg('Alberta Overview'),
  msg('CFB Wainwright Training Area'),
  msg('Before: 4 Oct 2026'),
  msg('After: 19 Oct 2026'),
  msg('Burn Scar Outline'),
  msg('Burn Scar Over Before Image'),
  msg('Low-Angle Scar View'),
  msg('Global Incident Context'),
  msg('Nepal-Focused Globe Rotation'),
  msg('Bhote Koshi Regional Approach'),
  msg('Bhote Koshi Nearby Cities'),
  msg('Bhote Koshi Incident Corridor'),
  msg('Bhote Koshi Flood Path'),
  msg('Bhote Koshi Corridor Overview'),
  msg('Bhote Koshi Upper Valley'),
  msg('Upper Valley Collapse'),
  msg('Debris-Dammed Lake'),
  msg('Nepal-China Border Gate'),
  msg('Timure Evidence Cluster'),
  msg('Syabru Besi Passage'),
  msg('Bidur / Trishuli Consequence'),
  msg('Second landslide'),
  msg('Mailung / Upper Trishuli bridge'),
  msg('Dandagaun viewpoint restaurant'),
  msg('Devighat / Taadi Khola Bridge'),
  msg('Final view'),
]);

/**
 * Display title for a scene: the localized recipe name while the stored title
 * still matches the built-in verbatim, the stored title otherwise.
 * @param {{id?: string, title?: string}} scene
 * @returns {string}
 */
export function displaySceneTitle(scene) {
  const builtin = SCENE_RECIPES.find((recipe) => recipe.id === scene?.id);
  if (builtin?.title && scene.title === builtin.title) return t(builtin.title);
  const title = scene?.title || '';
  // Only the generated "Scene N" localizes; an operator-typed "Scene 007"
  // keeps its digits, so the number stays a string (no Number() round trip).
  const numbered = /^Scene ([1-9]\d*)$/.exec(title);
  return numbered ? t('Scene {n}', { n: numbered[1] }) : title;
}

/**
 * Display title for a shot: built-in titles and the numbered "Shot N"
 * fallback localize; any other title shows as stored.
 *
 * With `shot`, a built-in title localizes only for a recipe shot
 * (`sourcePackId`), so a typed title that matches a built-in one stays as
 * typed. Without `shot`, the title alone decides.
 * @param {string} title
 * @param {{sourcePackId?: string}} [shot]
 * @param {{id?: string}} [scene] The shot's scene, for projects saved before
 *   shots recorded their source pack.
 * @returns {string}
 */
export function displayShotTitle(title, shot = undefined, scene = undefined) {
  const text = typeof title === 'string' ? title : '';
  const fromRecipe = shot
    ? Boolean(shot.sourcePackId) || recipeDeclaresShotTitle(scene?.id, text)
    : true;
  if (fromRecipe && BUILTIN_SHOT_TITLES.has(text)) return t(text);
  const numbered = /^Shot ([1-9]\d*)$/.exec(text);
  return numbered ? t('Shot {n}', { n: numbered[1] }) : text;
}

/** Whether the built-in recipe behind a scene declares a shot with this title. */
function recipeDeclaresShotTitle(sceneId, title) {
  const recipe = sceneId ? getSceneRecipeById(sceneId) : null;
  return Boolean(
    recipe?.cameraPath?.some((keyframe) => keyframe?.title === title),
  );
}
