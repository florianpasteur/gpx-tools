import * as fs from 'fs/promises';
import {refineWaypointForGarminConnect} from "../src/refine-waypoints-for-garmin-connect.mjs";
import {addKmlToGpx} from "../src/add-kml-to-gpx.mjs";
import {POIType} from "../lib/poi-type.mjs";

;(async function () {
    const gpxContent = (await fs.readFile('tests/assets/gpx-with-poi.gpx', 'utf-8')).toString();

    const gpxContentWithRefinedPoi = await refineWaypointForGarminConnect(gpxContent);

    await fs.writeFile('tests/outputs/gpx-with-refined-poi.gpx', gpxContentWithRefinedPoi);
})();

;(async function () {
    const gpxContent = (await fs.readFile('tests/assets/initial-gpx.gpx', 'utf-8')).toString();
    const kmlContent = (await fs.readFile('tests/assets/poi-map.kml', 'utf-8')).toString();

    const gpxContentWithPoi = await addKmlToGpx(gpxContent, kmlContent, POIType.OVERLOOK, 2000);

    await fs.writeFile('tests/outputs/initial-gpx-with-poi.gpx', gpxContentWithPoi);
})();
