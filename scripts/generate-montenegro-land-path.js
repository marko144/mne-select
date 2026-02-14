#!/usr/bin/env node
/**
 * Generate Montenegro land polygon from Natural Earth GeoJSON.
 * Uses the official country boundary - accurate Montenegro shape.
 * Scaled and positioned to match potrace outline bbox exactly.
 *
 * Run: pnpm generate:montenegro-land
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const getBounds = require('svg-path-bounds');

const GEOJSON_URL = 'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson';
const coastlinePath = fs
  .readFileSync(path.join(__dirname, '../apps/guests/lib/montenegro-coastline-path.ts'), 'utf8')
  .match(/'([^']+)'/)[1];

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function main() {
  // Potrace path bbox in viewBox coords (transform: translate(0,1536) scale(0.1,-0.1))
  const [pathLeft, pathTop, pathRight, pathBottom] = getBounds(coastlinePath);
  const viewLeft = 0.1 * pathLeft;
  const viewTop = 1536 - 0.1 * pathBottom;
  const viewRight = 0.1 * pathRight;
  const viewBottom = 1536 - 0.1 * pathTop;
  const viewW = viewRight - viewLeft;
  const viewH = viewBottom - viewTop;

  const data = JSON.parse(await fetch(GEOJSON_URL));
  const me = data.features.find(
    (f) => f.properties['ISO3166-1-Alpha-2'] === 'ME' || f.properties.name === 'Montenegro'
  );
  if (!me) throw new Error('Montenegro not found in GeoJSON');

  const geom = me.geometry;
  const ring = geom.type === 'Polygon' ? geom.coordinates[0] : geom.coordinates[0][0];
  const lons = ring.map((p) => p[0]);
  const lats = ring.map((p) => p[1]);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);

  // Scale GeoJSON to fit potrace bbox and translate to potrace position
  const toSvg = (lon, lat) => {
    const nx = (lon - minLon) / (maxLon - minLon);
    const ny = 1 - (lat - minLat) / (maxLat - minLat);
    const x = viewLeft + nx * viewW;
    const y = viewTop + ny * viewH;
    return x.toFixed(2) + ',' + y.toFixed(2);
  };
  const d = 'M' + ring.map((p) => toSvg(p[0], p[1])).join(' L ') + ' Z';

  const output = `/**
 * Montenegro land polygon (Natural Earth GeoJSON)
 * Scaled to match potrace outline bbox - accurate country shape.
 * Regenerate: pnpm generate:montenegro-land
 */
export const MONTENEGRO_LAND_POLYGON = '${d}'
`;

  const outPath = path.join(__dirname, '../apps/guests/lib/montenegro-land-polygon.ts');
  fs.writeFileSync(outPath, output);
  console.log('Wrote', outPath);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
