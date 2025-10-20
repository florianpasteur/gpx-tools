import {readXml} from "../lib/read-xml.mjs";
import {serialize} from "../lib/jsdom-serialize.mjs";
import {getClosestPoint} from "../lib/closet-point.mjs";
import {createWaypoint} from "../lib/create-waypoint.mjs";

/**
 * Add KML placemarks as waypoints to GPX content.
 * @param gpx string
 * @param kml string
 * @param kmlPointType string
 * @param thresholdDistance number
 * @returns {Promise<string>}
 */
export async function addKmlToGpx(gpx, kml, kmlPointType, thresholdDistance = 300) {
    const placemarks = await processKml(kml, kmlPointType);
    const {document: gpxDoc, jsdomRef: gpxJsdomRef, allGpxPoints} = await processGpx(gpx);


    placemarks.forEach((placemark) => {
        const type = placemark.getAttribute('type');
        const nameElement = placemark.querySelector('name');
        const name = nameElement ? nameElement.textContent.trim() : type;
        const [lon, lat] = placemark.querySelector('coordinates').textContent.trim().split(',').map(parseFloat);

        const closestPoint = getClosestPoint({lat, lon}, allGpxPoints);
        if (closestPoint.distance < thresholdDistance) {
            createWaypoint(gpxDoc, {
                lat: closestPoint.point.lat,
                lon: closestPoint.point.lon,
                name: `${name} (${Math.round(closestPoint.distance)}m,${closestPoint.direction})`,
                type
            });
        }
    });

    return serialize(gpxJsdomRef);
}

/**
 * Process KML content and set point types.
 * @param kmlContent string
 * @param pointType string
 * @returns {Promise<Element[]>}
 */
async function processKml(kmlContent, pointType) {
    const {document: kmlDoc} = await readXml(kmlContent);

    return Array.from(kmlDoc.querySelectorAll('Placemark')).map(placemark => {
        placemark.setAttribute('type', pointType);
        return placemark;
    });
}


async function processGpx(gpxContent) {
    const gpx = await readXml(gpxContent);


    const allGpxPoints = Array.from(gpx.document.querySelectorAll('trkpt')).map(trkpt => {
        const lat = parseFloat(trkpt.getAttribute('lat').trim());
        const lon = parseFloat(trkpt.getAttribute('lon').trim());
        return {lat, lon};
    })

    return {
        ...gpx,
        allGpxPoints
    }
}
