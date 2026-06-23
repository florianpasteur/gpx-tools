import {addKmlToGpx} from "../src/add-kml-to-gpx.mjs";
import fs from "fs/promises";

;(async function () {


    let gpx = await readFileAsText('gpx/tcs-half-marathon.gpx');

    gpx = await addKmlToGpx(gpx, await readFileAsText('kml/Stores.kml'),
        'STORE',
        500,
        300,
        1);
    // gpx = await addKmlToGpx(gpx, await readFileAsText('kml/Toilets.kml'), 'TOILET', 500, 0, 0);
    // gpx = await addKmlToGpx(gpx, await readFileAsText('kml/Water-points.kml'), 'STORE', 500, 0, 0);

    await fs.writeFile('out/tcs-half-marathon-with-poi.gpx', gpx);
})();

async function readFileAsText(filePath) {
    return (await fs.readFile(filePath, 'utf8')).toString()
}
