import {distanceInMeters} from "../lib/distance-in-meters.mjs";

const OVERPASS_ENDPOINT = "https://overpass-api.de/api/interpreter";
const DEFAULT_USER_AGENT = "gpx-tools/1.0 (+https://github.com/florianpasteur/gpx-tools)";

/**
 * OpenStreetMap tag combinations grouped by point-of-interest category.
 * Each entry is an Overpass "tag filter" applied to node/way/relation queries.
 */
export const POI_FILTERS = {
    water: [
        'amenity=drinking_water',
        'man_made=water_tap',
        'man_made=water_well',
        'man_made=water_point',
        'amenity=water_point',
        'natural=spring',
        'amenity=fountain',
    ],
    camping: [
        'tourism=camp_site',
        'tourism=caravan_site',
        'tourism=wilderness_hut',
        'tourism=alpine_hut',
    ],
    toilets: [
        'amenity=toilets',
    ],
    stores: [
        'shop=supermarket',
        'shop=convenience',
        'shop=grocery',
        'shop=general',
        'shop=bakery',
        'shop=greengrocer',
    ],
};

/**
 * Run a generic OpenStreetMap query (via the Overpass / "Overpass Turbo" API) for
 * any set of tag filters located within the bounding box spanned by two GPX coordinates,
 * returning the matching points as KML text.
 *
 * @param {{lat: number, lon: number}} pointA - First GPX coordinate
 * @param {{lat: number, lon: number}} pointB - Second GPX coordinate
 * @param {string[]} filters - Overpass tag filters, e.g. ['amenity=toilets', 'shop=supermarket']
 * @param {object} [options]
 * @param {number} [options.bufferMeters=0] - Extra padding added around the bounding box, in metres
 * @param {string} [options.endpoint=OVERPASS_ENDPOINT] - Overpass API endpoint URL
 * @param {number} [options.timeoutSeconds=25] - Overpass server-side query timeout
 * @param {string} [options.documentName='OpenStreetMap POIs'] - KML document name
 * @param {string} [options.userAgent] - User-Agent header (Overpass rejects requests without one)
 * @param {typeof fetch} [options.fetchFn=fetch] - Custom fetch implementation (e.g. for testing)
 * @returns {Promise<{points: Array<{id: number, type: string, lat: number, lon: number, name: string|null, tags: object}>, kml: string}>}
 */
export async function genericOpenStreetMapQuery(pointA, pointB, filters, options = {}) {
    const {
        bufferMeters = 0,
        endpoint = OVERPASS_ENDPOINT,
        timeoutSeconds = 25,
        documentName = 'OpenStreetMap POIs',
        userAgent = DEFAULT_USER_AGENT,
        fetchFn = fetch,
    } = options;

    if (!Array.isArray(filters) || filters.length === 0) {
        throw new Error('genericOpenStreetMapQuery requires a non-empty array of tag filters');
    }

    const bbox = buildBoundingBox(pointA, pointB, bufferMeters);
    const query = buildOverpassQuery(bbox, filters, timeoutSeconds);

    const response = await fetchFn(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'User-Agent': userAgent,
        },
        body: `data=${encodeURIComponent(query)}`,
    });

    if (!response.ok) {
        const body = await response.text().catch(() => '');
        throw new Error(`Overpass request failed: ${response.status} ${response.statusText} ${body}`.trim());
    }

    const payload = await response.json();
    const points = (payload.elements || []).map(normalizeElement).filter(Boolean);
    return {
        points,
        kml: pointsToKml(points, documentName),
    };
}

/**
 * Find water points (drinking water, taps, wells, springs, fountains) between two GPX coordinates.
 * @param {{lat: number, lon: number}} pointA
 * @param {{lat: number, lon: number}} pointB
 * @param {object} [options] - See {@link genericOpenStreetMapQuery}
 * @returns {Promise<{points: Array<object>, kml: string}>}
 */
export function findWaterPoints(pointA, pointB, options = {}) {
    return genericOpenStreetMapQuery(pointA, pointB, POI_FILTERS.water, {documentName: 'Water points', ...options});
}

/**
 * Find camping sites (camp sites, caravan sites, wilderness/alpine huts) between two GPX coordinates.
 * @param {{lat: number, lon: number}} pointA
 * @param {{lat: number, lon: number}} pointB
 * @param {object} [options] - See {@link genericOpenStreetMapQuery}
 * @returns {Promise<{points: Array<object>, kml: string}>}
 */
export function findCampingSites(pointA, pointB, options = {}) {
    return genericOpenStreetMapQuery(pointA, pointB, POI_FILTERS.camping, {documentName: 'Camping sites', ...options});
}

/**
 * Find toilets between two GPX coordinates.
 * @param {{lat: number, lon: number}} pointA
 * @param {{lat: number, lon: number}} pointB
 * @param {object} [options] - See {@link genericOpenStreetMapQuery}
 * @returns {Promise<{points: Array<object>, kml: string}>}
 */
export function findToilets(pointA, pointB, options = {}) {
    return genericOpenStreetMapQuery(pointA, pointB, POI_FILTERS.toilets, {documentName: 'Toilets', ...options});
}

/**
 * Find stores (supermarkets, convenience/grocery/general stores, bakeries) between two GPX coordinates.
 * @param {{lat: number, lon: number}} pointA
 * @param {{lat: number, lon: number}} pointB
 * @param {object} [options] - See {@link genericOpenStreetMapQuery}
 * @returns {Promise<{points: Array<object>, kml: string}>}
 */
export function findStores(pointA, pointB, options = {}) {
    return genericOpenStreetMapQuery(pointA, pointB, POI_FILTERS.stores, {documentName: 'Stores', ...options});
}

/**
 * Compute the south-west and north-east corners of the bounding box containing
 * every trackpoint in a GPX document. Handy to feed the two-point query functions.
 * @param {string} gpxText - The GPX file content as a string
 * @returns {[{lat: number, lon: number}, {lat: number, lon: number}]} [southWest, northEast]
 */
export function boundingCorners(gpxText) {
    const lats = [];
    const lons = [];
    const trkptRegex = /<trkpt[^>]*\blat="([^"]+)"[^>]*\blon="([^"]+)"/g;
    let match;
    while ((match = trkptRegex.exec(gpxText)) !== null) {
        lats.push(parseFloat(match[1]));
        lons.push(parseFloat(match[2]));
    }

    if (lats.length === 0) {
        throw new Error('boundingCorners: no <trkpt> coordinates found in GPX content');
    }

    return [
        {lat: Math.min(...lats), lon: Math.min(...lons)},
        {lat: Math.max(...lats), lon: Math.max(...lons)},
    ];
}

/**
 * Build the smallest axis-aligned bounding box containing both points, optionally padded.
 * @param {{lat: number, lon: number}} pointA
 * @param {{lat: number, lon: number}} pointB
 * @param {number} bufferMeters
 * @returns {{south: number, west: number, north: number, east: number}}
 */
function buildBoundingBox(pointA, pointB, bufferMeters) {
    let south = Math.min(pointA.lat, pointB.lat);
    let north = Math.max(pointA.lat, pointB.lat);
    let west = Math.min(pointA.lon, pointB.lon);
    let east = Math.max(pointA.lon, pointB.lon);

    if (bufferMeters > 0) {
        const latPadding = bufferMeters / 111320; // metres per degree of latitude
        const midLat = (south + north) / 2;
        const lonPadding = bufferMeters / (111320 * Math.cos(midLat * Math.PI / 180) || 1);
        south -= latPadding;
        north += latPadding;
        west -= lonPadding;
        east += lonPadding;
    }

    return {south, west, north, east};
}

/**
 * Build an Overpass QL query selecting the given tag filters in the bounding box.
 * @param {{south: number, west: number, north: number, east: number}} bbox
 * @param {string[]} filters
 * @param {number} timeoutSeconds
 * @returns {string}
 */
function buildOverpassQuery(bbox, filters, timeoutSeconds) {
    const bboxStr = `${bbox.south},${bbox.west},${bbox.north},${bbox.east}`;
    const statements = filters.flatMap((filter) => [
        `  node[${filter}](${bboxStr});`,
        `  way[${filter}](${bboxStr});`,
        `  relation[${filter}](${bboxStr});`,
    ]).join('\n');

    return `[out:json][timeout:${timeoutSeconds}];\n(\n${statements}\n);\nout center tags;`;
}

/**
 * Normalize an Overpass element into a flat point record.
 * Ways/relations expose their position through a "center" object.
 * @param {object} element
 * @returns {{id: number, type: string, lat: number, lon: number, name: string|null, tags: object}|null}
 */
function normalizeElement(element) {
    const lat = element.lat ?? element.center?.lat;
    const lon = element.lon ?? element.center?.lon;
    if (lat === undefined || lon === undefined) {
        return null;
    }

    const tags = element.tags || {};
    return {
        id: element.id,
        type: element.type,
        lat,
        lon,
        name: tags.name || null,
        tags,
    };
}

/**
 * Serialize normalized points into a KML document string.
 * Each point becomes a <Placemark> with a <name> and a <Point><coordinates>.
 * @param {Array<{lat: number, lon: number, name: string|null, type?: string, tags?: object}>} points
 * @param {string} documentName
 * @returns {string} KML document text
 */
function pointsToKml(points, documentName) {
    const placemarks = points.map((point) => {
        const name = point.name || describePoint(point) || 'Unnamed';
        return [
            '    <Placemark>',
            `      <name>${escapeXml(name)}</name>`,
            '      <Point>',
            `        <coordinates>${point.lon},${point.lat},0</coordinates>`,
            '      </Point>',
            '    </Placemark>',
        ].join('\n');
    }).join('\n');

    return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<kml xmlns="http://www.opengis.net/kml/2.2">',
        '  <Document>',
        `    <name>${escapeXml(documentName)}</name>`,
        placemarks,
        '  </Document>',
        '</kml>',
        '',
    ].filter((line) => line !== '').join('\n') + '\n';
}

/**
 * Derive a human-readable label for a point that has no OSM name, from its tags.
 * @param {{tags?: object}} point
 * @returns {string|null}
 */
function describePoint(point) {
    const tags = point.tags || {};
    return tags.amenity || tags.shop || tags.tourism || tags.man_made || tags.natural || null;
}

/**
 * Escape a string for safe inclusion in XML text/attribute content.
 * @param {string} value
 * @returns {string}
 */
function escapeXml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

export {buildBoundingBox, buildOverpassQuery, pointsToKml, distanceInMeters};
