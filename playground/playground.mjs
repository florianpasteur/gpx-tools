import {addKmlToGpx} from "../src/add-kml-to-gpx.mjs";
import {findWaterPoints, findToilets, findStores, boundingCorners} from "../src/open-street-map.mjs";
import fs from "fs/promises";

;(async function () {


    let gpx = await readFileAsText('gpx/tcs-half-marathon.gpx');

    const [southWest, northEast] = boundingCorners(gpx);
    const {kml: stores} = await findStores(southWest, northEast, {bufferMeters: 500});
    const {kml: toilets} = await findToilets(southWest, northEast, {bufferMeters: 500});
    const {kml: waterPoint} = await findWaterPoints(southWest, northEast, {bufferMeters: 500});

    gpx = await addKmlToGpx(
        gpx,
        stores,
        'STORE',
        500,
        5_000,
        3_000
    );
    gpx = await addKmlToGpx(
        gpx,
        toilets,
        'TOILET',
        500,
        5_000,
        0
    );
    gpx = await addKmlToGpx(
        gpx,
        waterPoint,
        'WATER',
        500,
        5_000,
        5_000
    );

    await fs.writeFile('out/tcs-half-marathon-with-poi.gpx', gpx);
})();

async function readFileAsText(filePath) {
    return (await fs.readFile(filePath, 'utf8')).toString()
}
