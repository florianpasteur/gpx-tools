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

## License

MIT
