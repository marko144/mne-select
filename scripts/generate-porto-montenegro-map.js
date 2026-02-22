#!/usr/bin/env node
/**
 * Generate Porto Montenegro street-level map data from OpenStreetMap via Overpass API.
 *
 * Fetches roads, water bodies, and marina areas for the Porto Montenegro / Tivat
 * area, then converts them to SVG path data for use in the BeSeenSection animation.
 *
 * Run: pnpm generate:porto-montenegro
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const https = require('https');

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Geographic bounding box — covers Porto Montenegro marina + Tivat centre */
const BBOX = {
  minLat: 42.424,
  minLon: 18.685,
  maxLat: 42.448,
  maxLon: 18.715,
};

/** Output SVG canvas */
const SVG = { width: 700, height: 600 };

/**
 * Tour operator markers — four locations in/around Porto Montenegro.
 * "Adriatic Adventures" is the gold (partner) marker; the others are gray.
 */
const TOUR_OPERATORS = [
  {
    id: 'adriatic-adventures',
    name: 'Adriatic Adventures',
    lat: 42.4332,
    lon: 18.6960,
    isPartner: true,
  },
  {
    id: 'bay-tours',
    name: 'Bay Tours Co.',
    lat: 42.4388,
    lon: 18.6998,
    isPartner: false,
  },
  {
    id: 'sea-city-tours',
    name: 'Sea & City Tours',
    lat: 42.4305,
    lon: 18.6985,
    isPartner: false,
  },
  {
    id: 'marina-explorers',
    name: 'Marina Explorers',
    lat: 42.4360,
    lon: 18.6920,
    isPartner: false,
  },
];

// ---------------------------------------------------------------------------
// Coordinate transform — equirectangular projection
// ---------------------------------------------------------------------------

function toSvg(lon, lat) {
  const x = ((lon - BBOX.minLon) / (BBOX.maxLon - BBOX.minLon)) * SVG.width;
  const y = ((BBOX.maxLat - lat) / (BBOX.maxLat - BBOX.minLat)) * SVG.height;
  return [parseFloat(x.toFixed(1)), parseFloat(y.toFixed(1))];
}

// ---------------------------------------------------------------------------
// Overpass API
// ---------------------------------------------------------------------------

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
// Geometry helpers
// ---------------------------------------------------------------------------

/** Convert an array of {lat, lon} geometry points to an SVG polyline path string. */
function geomToPolylinePath(geometry) {
  if (!geometry || geometry.length < 2) return null;
  const pts = geometry.map(({ lon, lat }) => toSvg(lon, lat));
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    d += ` L ${pts[i][0]} ${pts[i][1]}`;
  }
  return d;
}

/** Convert an array of {lat, lon} geometry points to a closed SVG polygon path. */
function geomToPolygonPath(geometry) {
  const p = geomToPolylinePath(geometry);
  return p ? p + ' Z' : null;
}

/**
 * For area-type OSM elements (ways with geometry that form closed shapes),
 * detect closure by comparing first and last node.
 */
function isClosed(geometry) {
  if (!geometry || geometry.length < 3) return false;
  const first = geometry[0];
  const last  = geometry[geometry.length - 1];
  return Math.abs(first.lat - last.lat) < 0.00001 &&
         Math.abs(first.lon - last.lon) < 0.00001;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const { minLat, minLon, maxLat, maxLon } = BBOX;
  const bboxStr = `${minLat},${minLon},${maxLat},${maxLon}`;

  const query = `
[out:json][timeout:140];
(
  way["highway"~"^(primary|secondary|tertiary|residential|service|unclassified|pedestrian|living_street|footway|path|steps)"](${bboxStr});
  way["natural"="water"](${bboxStr});
  way["waterway"~"^(river|canal|dock|stream)"](${bboxStr});
  way["landuse"~"^(marina|harbour|dock)"](${bboxStr});
  way["leisure"="marina"](${bboxStr});
  way["harbour"](${bboxStr});
  way["landuse"~"^(residential|commercial|retail|industrial|construction|grass|park|recreation_ground)"](${bboxStr});
  way["amenity"~"^(marina|harbour)"](${bboxStr});
  way["man_made"~"^(pier|breakwater|groyne|jetty)"](${bboxStr});
);
out body geom qt;
`;

  console.log('Querying Overpass API (Porto Montenegro streets + water + marina)…');
  const result = await overpassPost(query);

  const elements = result.elements.filter(
    (e) => e.type === 'way' && Array.isArray(e.geometry) && e.geometry.length >= 2
  );

  console.log(`Received ${elements.length} way elements`);

  // ── Classify elements ───────────────────────────────────────────────────
  const waterPaths    = [];
  const marinaPaths   = [];
  const roadPaths     = {
    primary:    [],
    secondary:  [],
    tertiary:   [],
    minor:      [],
    pedestrian: [],
  };
  const landusePaths  = [];
  const pierPaths     = [];

  const ROAD_CLASSES = {
    primary:         'primary',
    secondary:       'secondary',
    tertiary:        'tertiary',
    residential:     'minor',
    service:         'minor',
    unclassified:    'minor',
    pedestrian:      'pedestrian',
    living_street:   'pedestrian',
    footway:         'pedestrian',
    path:            'pedestrian',
    steps:           'pedestrian',
  };

  for (const el of elements) {
    const tags = el.tags || {};
    const geom = el.geometry;

    // Water bodies
    if (tags.natural === 'water' || tags.waterway) {
      const p = isClosed(geom) ? geomToPolygonPath(geom) : geomToPolylinePath(geom);
      if (p) waterPaths.push(p);
      continue;
    }

    // Marina / harbour / dock landuse
    if (
      tags.landuse === 'marina' || tags.landuse === 'harbour' || tags.landuse === 'dock' ||
      tags.leisure === 'marina' || tags.amenity === 'marina' || tags.amenity === 'harbour' ||
      tags.harbour
    ) {
      const p = isClosed(geom) ? geomToPolygonPath(geom) : geomToPolylinePath(geom);
      if (p) marinaPaths.push(p);
      continue;
    }

    // Piers / breakwaters / jetties (render as polylines)
    if (tags.man_made && ['pier','breakwater','groyne','jetty'].includes(tags.man_made)) {
      const p = geomToPolylinePath(geom);
      if (p) pierPaths.push(p);
      continue;
    }

    // Landuse areas
    if (tags.landuse && !tags.highway) {
      const p = isClosed(geom) ? geomToPolygonPath(geom) : null;
      if (p) landusePaths.push(p);
      continue;
    }

    // Roads
    if (tags.highway) {
      const cls = ROAD_CLASSES[tags.highway] || 'minor';
      const p = geomToPolylinePath(geom);
      if (p) roadPaths[cls].push(p);
    }
  }

  console.log(`Water areas  : ${waterPaths.length}`);
  console.log(`Marina areas : ${marinaPaths.length}`);
  console.log(`Piers        : ${pierPaths.length}`);
  console.log(`Landuse      : ${landusePaths.length}`);
  console.log(`Roads primary: ${roadPaths.primary.length}`);
  console.log(`Roads 2ndary : ${roadPaths.secondary.length}`);
  console.log(`Roads tertiary:${roadPaths.tertiary.length}`);
  console.log(`Roads minor  : ${roadPaths.minor.length}`);
  console.log(`Roads pedes  : ${roadPaths.pedestrian.length}`);

  // ── Resolve tour operator SVG coordinates ───────────────────────────────
  const operators = TOUR_OPERATORS.map((op) => {
    const [x, y] = toSvg(op.lon, op.lat);
    return { ...op, x, y };
  });

  // ── Output TypeScript module ─────────────────────────────────────────────
  const output = `/**
 * Porto Montenegro street-level map data — generated from OpenStreetMap via Overpass API.
 *
 * Regenerate: pnpm generate:porto-montenegro
 *
 * ViewBox    : 0 0 ${SVG.width} ${SVG.height}
 * Projection : equirectangular
 * Bbox       : [${minLat}, ${minLon}, ${maxLat}, ${maxLon}]
 */

/** SVG viewBox string for the map */
export const PM_VIEWBOX = '0 0 ${SVG.width} ${SVG.height}' as const;

/** Water body filled areas (sea, harbour basin). */
export const PM_WATER_PATHS: readonly string[] = ${JSON.stringify(waterPaths, null, 2)} as const;

/** Marina / harbour landuse areas. */
export const PM_MARINA_PATHS: readonly string[] = ${JSON.stringify(marinaPaths, null, 2)} as const;

/** Pier, breakwater, and jetty stroke paths. */
export const PM_PIER_PATHS: readonly string[] = ${JSON.stringify(pierPaths, null, 2)} as const;

/** Landuse area fills (residential, commercial, park, etc.). */
export const PM_LANDUSE_PATHS: readonly string[] = ${JSON.stringify(landusePaths, null, 2)} as const;

export interface RoadPaths {
  primary:    readonly string[];
  secondary:  readonly string[];
  tertiary:   readonly string[];
  minor:      readonly string[];
  pedestrian: readonly string[];
}

/** Road / highway polyline paths grouped by classification. */
export const PM_ROADS: RoadPaths = ${JSON.stringify(roadPaths, null, 2)} as const;

export interface TourOperator {
  id:        string;
  name:      string;
  lat:       number;
  lon:       number;
  isPartner: boolean;
  x:         number;
  y:         number;
}

/** Tour operator marker positions in SVG coordinates. */
export const PM_TOUR_OPERATORS: readonly TourOperator[] = ${JSON.stringify(operators, null, 2)} as const;
`;

  const outPath = path.join(__dirname, '../apps/guests/lib/porto-montenegro-map.ts');
  fs.writeFileSync(outPath, output, 'utf8');

  console.log('\nWrote:', outPath);
  console.log('Done.');
}

main().catch((e) => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
