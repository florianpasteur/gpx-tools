import {refineWaypoint} from "../lib/refine-waypoint.mjs";
import {readXml} from "../lib/read-xml.mjs";
import {serialize} from "../lib/jsdom-serialize.mjs";

/**
 * Refine waypoints in GPX content for Garmin Connect compatibility.
 * Automatically set waypoint types based on content. (Campsite, water, toilets, shop)
 * Reduce description length to max 200 characters. (Garmin limitations)
 * @param gpxContent
 * @returns {Promise<string>}
 */
export async function refineWaypointForGarminConnect(gpxContent) {
    const {document: gpxDoc, jsdomRef: gpxJsdomRef} = await readXml(gpxContent);

    gpxDoc.querySelectorAll('wpt').forEach(refineWaypoint(gpxDoc));

    return serialize(gpxJsdomRef);
}
