import * as fs from 'fs/promises';
import {refineWaypointForGarminConnect} from "../src/refine-waypoints-for-garmin-connect.mjs";
import {addKmlToGpx} from "../src/add-kml-to-gpx.mjs";
import {POIType} from "../lib/poi-type.mjs";
import {anonymizeGpx} from "../src/anonymize-gpx.mjs";
import {trimGpx} from '../index.mjs';

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


;(async function () {
    const gpxContent = (await fs.readFile('tests/assets/gpx-with-personal-data.gpx', 'utf-8')).toString();

    const gpxContentWithoutPersonalData = await anonymizeGpx(gpxContent);

    await fs.writeFile('tests/outputs/gpx-withOUT-personal-data.gpx', gpxContentWithoutPersonalData);
})();


;(async function () {
    const gpxContent = (await fs.readFile('tests/assets/activity_22574526552.gpx', 'utf-8')).toString();

    const a = await anonymizeGpx(gpxContent);
    const b = await trimGpx(a, '2026-04-18T13:22:00.000Z', 60 * 5);

    await fs.writeFile('tests/outputs/mou_descent.gpx', b);
})();
