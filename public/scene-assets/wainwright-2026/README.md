# CFB Wainwright fire, 17 October 2026: scene assets

Assets for the **Wainwright Fire** built-in scene (`wainwright-fire-2026` in
`src/scenes/recipes.js`). This is a visualization of public satellite imagery,
not an official fire perimeter, damage assessment or investigation finding.

## Files

| File | Source and processing |
| --- | --- |
| `before-2026-10-04.png` | Sentinel-2 L2A `S2C_12UWD_20261004_0_L2A` true-colour (TCI), observed 2026-10-04 18:39 UTC. Reprojected to WGS84 and cropped to 111.00–110.80 W, 52.715–52.845 N, 1360×1461 px (about 10 m). |
| `after-2026-10-19.png` | Sentinel-2 L2A `S2B_12UWD_20261019_0_L2A`, observed 2026-10-19 18:39 UTC, same processing and bounds. Thin cloud covers the eastern part. |
| `burn-scar.json` | Outline traced where the Normalized Burn Ratio (B8A, B12) fell by more than 0.27 between the two scenes above, after masking no-data, cloud, cloud shadow and cirrus with the scene classification layer. Small specks were removed and the two largest connected areas kept (about 1,120 ha and 107 ha, about 12 km² in total), then simplified to 30 m. Also holds two reference points: the approximate centre of the built-up Camp Wainwright area, read from the image, and the town of Wainwright. |

Imagery came from the public Sentinel-2 Cloud-Optimized GeoTIFF archive on AWS
(`s3://sentinel-cogs/sentinel-s2-l2a-cogs/12/U/WD/2026/10/`).

Contains modified Copernicus Sentinel data 2026, used under the
[Copernicus Sentinel data terms](https://sentinels.copernicus.eu/documents/247904/690755/Sentinel_Data_Legal_Notice)
(free, full and open access).

## Event facts in the scene's cards

From public reporting as of 22 October 2026:

- The fire started at about 4 p.m. local time on 17 October 2026 during
  live-fire training (Exercise APOLLO SHOOTER), and high winds spread it over a
  unit administrative area.
- Four Canadian Armed Forces members were killed and dozens were injured.
- The Municipal District of Wainwright reported the fire held just after
  10:45 p.m.
- The cause is under investigation.

Sources: [Department of National Defence](https://www.canada.ca/en/department-national-defence/news/2026/10/incident-at-canadian-forces-base-wainwright.html),
[Global News timeline](https://globalnews.ca/news/12107726/cfb-wainwright-timeline/).

## Interpretation limits

- The outline shows where vegetation changed sharply between 4 and 19 October.
  It is not an official perimeter, and its edges are only as good as 20 m
  imagery and a fixed threshold allow.
- Thin cloud on 19 October covers the eastern edge, so burned ground there may
  be missing from the outline.
- The darker ground south of the lake is an older burn scar that already
  appears on 4 October; it is not part of this fire.
- Neither image shows the fire itself: the 17 October pass was at about
  12:49 p.m. local time, before ignition. The ignition point, the direction of
  spread and the timing within the burned area cannot be read from these images.
- Image overlays sit at 740 m above the WGS84 ellipsoid, a little above the
  ground, so they float slightly in low-angle views.
