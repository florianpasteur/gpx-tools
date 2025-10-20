import * as fs from 'fs/promises';
import {refineWaypointForGarminConnect} from "../src/refine-waypoints-for-garmin-connect.mjs";

;(async function () {
    const gpxContent = (await fs.readFile('tests/assets/gpx-with-poi.gpx', 'utf-8')).toString();

    const gpxContentWithRefinedPoi = await refineWaypointForGarminConnect(gpxContent);

    await fs.writeFile('tests/outputs/gpx-with-refined-poi.gpx', gpxContentWithRefinedPoi);
})();
