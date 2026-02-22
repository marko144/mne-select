#!/usr/bin/env node
/**
 * Generate Bay of Kotor vector map data from OpenStreetMap via Overpass API.
 *
 * Fetches coastline ways with full geometry, stitches them into continuous
 * chains, closes land polygons at the bounding box edges, and outputs typed
 * SVG path data + place label coordinates as a TypeScript module.
 *
 * Run: pnpm generate:bay-of-kotor
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const https = require('https');

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Geographic bounding box */
const BBOX = {
  minLat: 42.34,
  minLon: 18.43,
  maxLat: 42.535,
  maxLon: 18.82,
};

/** Output SVG canvas */
const SVG = { width: 900, height: 540 };

/**
 * Authoritative place list with verified geographic coordinates.
 * OSM results supplement these; Seljanovo is always included.
 */
const KNOWN_PLACES = [
  { name: 'Kotor',         lat: 42.4247, lon: 18.7712, type: 'town',    priority: 1 },
  { name: 'Herceg Novi',   lat: 42.4531, lon: 18.5375, type: 'town',    priority: 1 },
  { name: 'Tivat',         lat: 42.4343, lon: 18.6966, type: 'town',    priority: 1 },
  { name: 'Perast',        lat: 42.4847, lon: 18.7012, type: 'village', priority: 2 },
  { name: 'Risan',         lat: 42.5107, lon: 18.6929, type: 'town',    priority: 2 },
  { name: 'Seljanovo',     lat: 42.4320, lon: 18.6900, type: 'village', priority: 1 },
  { name: 'Muo',           lat: 42.4390, lon: 18.7550, type: 'village', priority: 3 },
  { name: 'Dobrota',       lat: 42.4480, lon: 18.7620, type: 'village', priority: 3 },
  { name: 'Prčanj',        lat: 42.4550, lon: 18.7380, type: 'village', priority: 3 },
  { name: 'Orahovac',      lat: 42.5050, lon: 18.6700, type: 'village', priority: 3 },
];

// ---------------------------------------------------------------------------
// Coordinate transform
// ---------------------------------------------------------------------------

/**
 * Convert geographic (lon, lat) to SVG (x, y) using equirectangular projection.
 * @param {number} lon
 * @param {number} lat
 * @returns {[number, number]}
 */
function toSvg(lon, lat) {
  const x = ((lon - BBOX.minLon) / (BBOX.maxLon - BBOX.minLon)) * SVG.width;
  const y = ((BBOX.maxLat - lat) / (BBOX.maxLat - BBOX.minLat)) * SVG.height;
  return [parseFloat(x.toFixed(2)), parseFloat(y.toFixed(2))];
}

// ---------------------------------------------------------------------------
// Overpass API
// ---------------------------------------------------------------------------

/**
 * POST a query to the Overpass API and return parsed JSON.
 * @param {string} query
 * @returns {Promise<object>}
 */
function overpassPost(query) {
  return new Promise((resolve, reject) => {
    const body = `data=${encodeURIComponent(query)}`;
    const options = {
      hostname: 'overpass-api.de',
      path: '/api/interpreter',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
        'User-Agent': 'mne-select-map-generator/1.0',
      },
    };

    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        try {
          resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
        } catch (e) {
          reject(new Error(`Overpass returned invalid JSON: ${e.message}`));
        }
      });
    });
    req.setTimeout(140_000, () => {
      req.destroy(new Error('Overpass request timed out'));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ---------------------------------------------------------------------------
// Coastline stitching
// ---------------------------------------------------------------------------

/**
 * Stitch OSM coastline ways (with geometry) into continuous directed chains.
 *
 * OSM coastlines are directed: land is on the LEFT of the direction of travel.
 * Ways connect end-node → start-node of the next way.
 *
 * @param {Array<{id:number, nodes:number[], geometry:{lat:number,lon:number}[]}>} ways
 * @returns {Array<{lat:number,lon:number}[]>}
 */
function stitchCoastlines(ways) {
  // Build lookup: first node ID → way
  /** @type {Map<number, typeof ways[0]>} */
  const byFirst = new Map();
  for (const w of ways) {
    if (w.nodes && w.nodes.length > 0) {
      byFirst.set(w.nodes[0], w);
    }
  }

  const used = new Set();
  const chains = [];

  for (const startWay of ways) {
    if (used.has(startWay.id) || !startWay.geometry) continue;

    used.add(startWay.id);
    const pts = [...startWay.geometry];
    let lastNodeId = startWay.nodes[startWay.nodes.length - 1];

    let safety = 0;
    while (safety++ < 50_000) {
      const next = byFirst.get(lastNodeId);
      if (!next || used.has(next.id)) break;
      used.add(next.id);
      // Skip the duplicate first point of the connecting way
      pts.push(...next.geometry.slice(1));
      lastNodeId = next.nodes[next.nodes.length - 1];
    }

    if (pts.length >= 3) chains.push(pts);
  }

  return chains;
}

// ---------------------------------------------------------------------------
// Polygon closure at bounding box edges
// ---------------------------------------------------------------------------

const EDGE_TOL = 0.008; // degrees – point is "on edge" if this close to bbox boundary

/**
 * Which bbox edge is a point closest to?
 * Returns 'bottom' | 'right' | 'top' | 'left' | null
 */
function nearestEdge(lon, lat) {
  const dBottom = Math.abs(lat - BBOX.minLat);
  const dTop    = Math.abs(lat - BBOX.maxLat);
  const dLeft   = Math.abs(lon - BBOX.minLon);
  const dRight  = Math.abs(lon - BBOX.maxLon);
  const minD    = Math.min(dBottom, dTop, dLeft, dRight);
  if (minD > EDGE_TOL) return null;
  if (minD === dBottom) return 'bottom';
  if (minD === dTop)    return 'top';
  if (minD === dLeft)   return 'left';
  return 'right';
}

/**
 * Bbox corners in clockwise order (for land-left traversal):
 * bottom-left → bottom-right → top-right → top-left
 */
const CORNERS = [
  { lon: BBOX.minLon, lat: BBOX.minLat }, // bottom-left
  { lon: BBOX.maxLon, lat: BBOX.minLat }, // bottom-right
  { lon: BBOX.maxLon, lat: BBOX.maxLat }, // top-right
  { lon: BBOX.minLon, lat: BBOX.maxLat }, // top-left
];

const EDGE_ORDER = ['bottom', 'right', 'top', 'left']; // clockwise

/**
 * Close an open coastline chain by tracing the bounding box edges to connect
 * the chain's end point back to its start point (land stays on the left).
 * Returns a closed polygon point array.
 */
function closeChainAtBbox(chain) {
  if (chain.length < 2) return chain;

  const first = chain[0];
  const last  = chain[chain.length - 1];

  // Already closed?
  if (
    Math.abs(first.lon - last.lon) < 0.0001 &&
    Math.abs(first.lat - last.lat) < 0.0001
  ) {
    return chain;
  }

  const startEdge = nearestEdge(first.lon, first.lat);
  const endEdge   = nearestEdge(last.lon, last.lat);

  if (!startEdge || !endEdge) {
    // Neither endpoint is on a bbox edge — close directly
    return [...chain, first];
  }

  // Walk clockwise from endEdge to startEdge, adding corners as needed
  const closure = [];
  let edgeIdx = EDGE_ORDER.indexOf(endEdge);
  let safety  = 0;

  while (EDGE_ORDER[edgeIdx] !== startEdge && safety++ < 8) {
    edgeIdx = (edgeIdx + 1) % 4;
    closure.push(CORNERS[edgeIdx]);
  }

  return [...chain, ...closure, first];
}

// ---------------------------------------------------------------------------
// SVG path string builders
// ---------------------------------------------------------------------------

/**
 * Convert a chain of {lat, lon} points to an SVG path string.
 * @param {{lat:number,lon:number}[]} chain
 * @param {boolean} close
 * @returns {string}
 */
function chainToPath(chain, close = false) {
  if (chain.length === 0) return '';
  const [sx, sy] = toSvg(chain[0].lon, chain[0].lat);
  let d = `M ${sx} ${sy}`;
  for (let i = 1; i < chain.length; i++) {
    const [x, y] = toSvg(chain[i].lon, chain[i].lat);
    d += ` L ${x} ${y}`;
  }
  if (close) d += ' Z';
  return d;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const { minLat, minLon, maxLat, maxLon } = BBOX;
  const bboxStr = `${minLat},${minLon},${maxLat},${maxLon}`;

  const query = `
[out:json][timeout:120];
(
  way["natural"="coastline"](${bboxStr});
  node["place"~"^(city|town|village|hamlet)$"](${bboxStr});
);
out body geom qt;
`;

  console.log('Querying Overpass API (Bay of Kotor coastline + places)…');
  const result = await overpassPost(query);

  const ways = result.elements.filter(
    (e) => e.type === 'way' && Array.isArray(e.geometry) && e.geometry.length > 0
  );
  const placeNodes = result.elements.filter(
    (e) => e.type === 'node' && e.tags && e.tags.name
  );

  console.log(`Got ${ways.length} coastline ways, ${placeNodes.length} place nodes`);

  // Stitch coastlines
  const chains = stitchCoastlines(ways);
  console.log(`Stitched into ${chains.length} chain(s)`);
  chains.forEach((c, i) => console.log(`  chain[${i}]: ${c.length} points`));

  // Build SVG path strings
  const landPaths = chains
    .filter((c) => c.length >= 3)
    .map((c) => chainToPath(closeChainAtBbox(c), true))
    .filter(Boolean);

  const strokePaths = chains
    .filter((c) => c.length >= 2)
    .map((c) => chainToPath(c, false))
    .filter(Boolean);

  // Build place label list
  const knownNames = new Set(KNOWN_PLACES.map((p) => p.name));

  const osmPlaces = placeNodes
    .filter((n) => !knownNames.has(n.tags.name))
    .map((n) => {
      const [x, y] = toSvg(n.lon, n.lat);
      return { name: n.tags.name, x, y, type: n.tags.place || 'place', priority: 3 };
    });

  const knownResolved = KNOWN_PLACES.map((p) => {
    const [x, y] = toSvg(p.lon, p.lat);
    return { name: p.name, x, y, type: p.type, priority: p.priority };
  });

  const places = [...knownResolved, ...osmPlaces];

  // Seljanovo pin landing coordinates
  const seljanovo = KNOWN_PLACES.find((p) => p.name === 'Seljanovo');
  const [pinX, pinY] = toSvg(seljanovo.lon, seljanovo.lat);

  // ---------------------------------------------------------------------------
  // Output TypeScript module
  // ---------------------------------------------------------------------------
  const output = `/**
 * Bay of Kotor vector map data — generated from OpenStreetMap via Overpass API.
 *
 * Regenerate: pnpm generate:bay-of-kotor
 *
 * ViewBox    : 0 0 ${SVG.width} ${SVG.height}
 * Projection : equirectangular
 * Bbox       : [${minLat}, ${minLon}, ${maxLat}, ${maxLon}]
 */

/** SVG viewBox string for the map */
export const BOK_VIEWBOX = '0 0 ${SVG.width} ${SVG.height}' as const;

/** Filled land polygon paths (closed at bounding-box edges). */
export const BOK_LAND_PATHS: readonly string[] = ${JSON.stringify(landPaths, null, 2)} as const;

/** Coastline stroke paths for the gold outline effect. */
export const BOK_STROKE_PATHS: readonly string[] = ${JSON.stringify(strokePaths, null, 2)} as const;

export interface PlaceLabel {
  name: string;
  x: number;
  y: number;
  type: string;
  priority: number; // 1 = prominent, 2 = secondary, 3 = minor
}

/** Place name labels with pre-computed SVG coordinates. */
export const BOK_PLACES: readonly PlaceLabel[] = ${JSON.stringify(places, null, 2)} as const;

/** Seljanovo SVG coordinates — the pin landing target. */
export const BOK_SELJANOVO: { readonly x: number; readonly y: number } = {
  x: ${pinX},
  y: ${pinY},
} as const;
`;

  const outPath = path.join(__dirname, '../apps/guests/lib/bay-of-kotor-map.ts');
  fs.writeFileSync(outPath, output, 'utf8');

  console.log('\nWrote:', outPath);
  console.log('Land paths   :', landPaths.length);
  console.log('Stroke paths :', strokePaths.length);
  console.log('Places       :', places.length);
  console.log(`Seljanovo    : x=${pinX}, y=${pinY}`);
}

main().catch((e) => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
