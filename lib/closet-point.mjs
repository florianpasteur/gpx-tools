import {distanceInMeters} from "./distance-in-meters.mjs";

/**
 *
 * @param point {lat: number, lon: number}
 * @param allPoints {lat: number, lon: number}[]
 * @returns {{distance: number, point: {lat: number, lon: number}, direction: string}}
 *
 */
 export function getClosestPoint(point, allPoints) {
    let minPoint = allPoints[0];
    let minDistance = distanceInMeters(point, minPoint);
    for (const gpxPoint of allPoints) {
        const distance = distanceInMeters(point, gpxPoint);
        if (distance < minDistance) {
            minDistance = distance;
            minPoint = gpxPoint;
        }
    }

    return {distance: minDistance, point: minPoint, direction: calculateDirection(minPoint, point)};
}


/**
 * Calculates the cardinal/intercardinal direction from point A to point B.
 * @param {object} pointA - The starting point {lat, lon}.
 * @param {object} pointB - The destination point {lat, lon}.
 * @returns {string} The direction (N, NE, E, SE, S, SW, W, NW).
 */
function calculateDirection(pointA, pointB) {
    // Convert latitudes to radians
    const lat1Rad = pointA.lat * Math.PI / 180;
    const lat2Rad = pointB.lat * Math.PI / 180;

    // Convert longitude difference to radians
    const dLonRad = (pointB.lon - pointA.lon) * Math.PI / 180;

    // Formula for initial bearing (azimuth)
    // y = sin(Δλ) * cos(φ2)
    const y = Math.sin(dLonRad) * Math.cos(lat2Rad);
    // x = cos(φ1) * sin(φ2) - sin(φ1) * cos(φ2) * cos(Δλ)
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
        Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLonRad);

    // Calculate the bearing in radians, then convert to degrees
    let bearingRad = Math.atan2(y, x);
    let bearingDeg = bearingRad * 180 / Math.PI;

    // Normalize the bearing to a 0-360 degree range (0 is North)
    // The result from atan2 is in the range (-180, 180]
    let normalizedBearing = (bearingDeg + 360) % 360;

    // Determine the direction based on the normalized bearing
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    // Divide 360 degrees into 8 sectors of 45 degrees each.
    // Shift the range by 22.5 degrees so that:
    // 0-22.5 is N, 22.5-67.5 is NE, etc.
    const index = Math.round(normalizedBearing / 45);

    // The modulo 8 handles the wrap-around (e.g., 360 degrees becomes index 0)
    return directions[index % 8];
}
