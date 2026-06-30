# @flow-js/gpx-tools

A Node.js library for GPX file manipulation with Garmin Connect compatibility.

## Installation

```bash
npm install @flow-js/gpx-tools
```

## Features

- **Add KML waypoints to GPX** - Import placemarks from KML files and add them as waypoints to GPX tracks
- **Refine waypoints for Garmin Connect** - Automatically set waypoint types and truncate descriptions for Garmin device compatibility
- **Anonymize GPX files** - Remove personal data and extensions from GPX files
- **Trim GPX files** - Extract a time-based segment from a GPX track
- **Query OpenStreetMap POIs** - Find water points, camping sites, toilets, and stores along a route via the Overpass API, returned as both structured points and KML

## Usage

### Add KML Placemarks to GPX

Convert KML placemarks to GPX waypoints. Waypoints are placed on the closest track point within a configurable threshold distance.

```javascript
import { addKmlToGpx, POIType } from '@flow-js/gpx-tools';
import fs from 'fs/promises';

const gpxContent = await fs.readFile('track.gpx', 'utf-8');
const kmlContent = await fs.readFile('points.kml', 'utf-8');

const result = await addKmlToGpx(
  gpxContent,
  kmlContent,
  POIType.OVERLOOK,
  2000  // threshold distance in meters (default: 300)
);

await fs.writeFile('track-with-waypoints.gpx', result);
```

### Refine Waypoints for Garmin Connect

Optimize waypoints for Garmin Connect compatibility:
- Auto-detects waypoint types based on content (water, campsite, toilet, shop)
- Truncates descriptions to 200 characters (Garmin limitation)
- Removes empty elements

```javascript
import { refineWaypointForGarminConnect } from '@flow-js/gpx-tools';
import fs from 'fs/promises';

const gpxContent = await fs.readFile('track.gpx', 'utf-8');
const result = await refineWaypointForGarminConnect(gpxContent);

await fs.writeFile('garmin-ready.gpx', result);
```

### Anonymize GPX Files

Remove all personal data and extensions from GPX files.

```javascript
import { anonymizeGpx } from '@flow-js/gpx-tools';
import fs from 'fs/promises';

const gpxContent = await fs.readFile('track.gpx', 'utf-8');
const result = await anonymizeGpx(gpxContent);

await fs.writeFile('anonymous.gpx', result);
```

### Trim GPX Files

Extract a segment from a GPX track based on a center timestamp and duration. The duration is split equally before and after the timestamp.

```javascript
import { trimGpx } from '@flow-js/gpx-tools';
import fs from 'fs/promises';

const gpxContent = await fs.readFile('track.gpx', 'utf-8');

// Keep 5 minutes of data centered on the timestamp (2.5 min before, 2.5 min after)
const result = await trimGpx(gpxContent, '2026-04-18T06:00:00.000Z', 300);

await fs.writeFile('trimmed.gpx', result);
```

### Query OpenStreetMap POIs

Find points of interest from OpenStreetMap (via the [Overpass API](https://overpass-api.de/)) within the bounding box spanned by two coordinates. Each query returns both the structured `points` and a ready-to-use `kml` document.

```javascript
import {
  findWaterPoints,
  findCampingSites,
  findToilets,
  findStores,
  genericOpenStreetMapQuery,
  boundingCorners,
} from '@flow-js/gpx-tools';
import fs from 'fs/promises';

const gpx = await fs.readFile('track.gpx', 'utf-8');

// Derive the route's bounding-box corners from its trackpoints
const [southWest, northEast] = boundingCorners(gpx);

// Each finder returns { points, kml }
const { points, kml } = await findWaterPoints(southWest, northEast, { bufferMeters: 500 });
console.log(`${points.length} water points found`);

// The KML can be fed straight into addKmlToGpx
await fs.writeFile('water.kml', kml);

// Run a custom query with any Overpass tag filters
const pharmacies = await genericOpenStreetMapQuery(southWest, northEast, ['amenity=pharmacy']);
```

The four finders are thin wrappers around `genericOpenStreetMapQuery` using the tag sets exported as `POI_FILTERS`:

| Function | OpenStreetMap tags |
|----------|--------------------|
| `findWaterPoints` | `amenity=drinking_water`, `man_made=water_tap/water_well/water_point`, `amenity=water_point`, `natural=spring`, `amenity=fountain` |
| `findCampingSites` | `tourism=camp_site/caravan_site/wilderness_hut/alpine_hut` |
| `findToilets` | `amenity=toilets` |
| `findStores` | `shop=supermarket/convenience/grocery/general/bakery/greengrocer` |

## POI Types

The library exports `POIType` with Garmin-compatible point of interest types:

| Category | Types |
|----------|-------|
| Services | `INFO`, `SERVICE`, `AID_STATION`, `FIRST_AID`, `STORE` |
| Nutrition | `FOOD`, `WATER`, `ENERGY_GEL`, `SPORTS_DRINK` |
| Facilities | `TOILET`, `SHOWER`, `GEAR`, `TRANSPORT` |
| Accommodation | `CAMPSITE`, `SHELTER`, `REST_AREA` |
| Navigation | `NAVAID`, `CHECKPOINT`, `MEETING_SPOT`, `TRANSITION` |
| Terrain | `SUMMIT`, `TUNNEL`, `BRIDGE`, `VALLEY`, `OVERLOOK` |
| Hazards | `ALERT`, `DANGER`, `OBSTACLE`, `CROSSING`, `STEEP_INCLINE`, `SHARP_CURVE` |
| Racing | `SPRINT`, `HORS_CATEGORY`, `FIRST_CATEGORY`, `SECOND_CATEGORY`, `THIRD_CATEGORY`, `FOURTH_CATEGORY`, `RACE_OBSTACLE_START`, `RACE_OBSTACLE_END` |

## API Reference

### `addKmlToGpx(gpx, kml, kmlPointType, thresholdDistance?)`

| Parameter | Type | Description |
|-----------|------|-------------|
| `gpx` | `string` | GPX file content |
| `kml` | `string` | KML file content |
| `kmlPointType` | `string` | POI type to assign to imported waypoints |
| `thresholdDistance` | `number` | Maximum distance in meters to snap waypoints to track (default: 300) |

**Returns:** `Promise<string>` - Modified GPX content

### `refineWaypointForGarminConnect(gpxContent)`

| Parameter | Type | Description |
|-----------|------|-------------|
| `gpxContent` | `string` | GPX file content |

**Returns:** `Promise<string>` - Modified GPX content with refined waypoints

### `anonymizeGpx(gpxContent)`

| Parameter | Type | Description |
|-----------|------|-------------|
| `gpxContent` | `string` | GPX file content |

**Returns:** `Promise<string>` - GPX content with extensions removed

### `trimGpx(gpxContent, timestamp, durationSeconds)`

| Parameter | Type | Description |
|-----------|------|-------------|
| `gpxContent` | `string` | GPX file content |
| `timestamp` | `string \| Date` | Center timestamp (ISO string or Date object) |
| `durationSeconds` | `number` | Total duration in seconds to keep (split equally before/after timestamp) |

**Returns:** `Promise<string>` - GPX content with trackpoints outside the time window removed

### `genericOpenStreetMapQuery(pointA, pointB, filters, options?)`

Queries OpenStreetMap (via the Overpass API) for the given tag filters within the bounding box spanned by the two points. Retries automatically on transient `429`/`504` responses.

| Parameter | Type | Description |
|-----------|------|-------------|
| `pointA` | `{ lat, lon }` | First coordinate |
| `pointB` | `{ lat, lon }` | Second coordinate |
| `filters` | `string[]` | Overpass tag filters, e.g. `['amenity=toilets']` |
| `options.bufferMeters` | `number` | Padding added around the bounding box, in meters (default: `0`) |
| `options.endpoint` | `string` | Overpass API endpoint URL |
| `options.timeoutSeconds` | `number` | Overpass server-side query timeout (default: `25`) |
| `options.documentName` | `string` | KML document name |
| `options.userAgent` | `string` | `User-Agent` header (Overpass rejects requests without one) |
| `options.maxRetries` | `number` | Retries on `429`/`504` responses (default: `3`) |
| `options.retryDelayMs` | `number` | Base delay between retries, grows linearly (default: `2000`) |
| `options.fetchFn` | `typeof fetch` | Custom fetch implementation (e.g. for testing) |

**Returns:** `Promise<{ points: Array<{ id, type, lat, lon, name, tags }>, kml: string }>`

### `findWaterPoints(pointA, pointB, options?)` · `findCampingSites(...)` · `findToilets(...)` · `findStores(...)`

Convenience wrappers around `genericOpenStreetMapQuery` with predefined tag sets (see table above) and a sensible default `documentName`. Same parameters and return value as `genericOpenStreetMapQuery`, minus the `filters` argument.

**Returns:** `Promise<{ points: Array<{ id, type, lat, lon, name, tags }>, kml: string }>`

### `boundingCorners(gpxText)`

Computes the south-west and north-east corners of the bounding box containing every trackpoint in a GPX document. Handy for feeding the query functions.

| Parameter | Type | Description |
|-----------|------|-------------|
| `gpxText` | `string` | GPX file content |

**Returns:** `[{ lat, lon }, { lat, lon }]` - `[southWest, northEast]`

## License

MIT
