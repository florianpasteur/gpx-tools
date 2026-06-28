import {addKmlToGpx} from "../src/add-kml-to-gpx.mjs";
import {findWaterPoints} from "../src/open-street-map.mjs";
import fs from "fs/promises";

;(async function () {


    let gpx = await readFileAsText('gpx/tcs-half-marathon.gpx');

    const stores = await readFileAsText('kml/Stores.kml');
    const toilets = await readFileAsText('kml/Toilets.kml');
    const [southWest, northEast] = boundingCorners(gpx);
    const {kml: waterPoint} = await findWaterPoints(southWest, northEast, {bufferMeters: 500});

    // gpx = await addKmlToGpx(
    //     gpx,
    //     stores,
    //     'STORE',
    //     500,
    //     5_000,
    //     3_000
    // );
    // gpx = await addKmlToGpx(
    //     gpx,
    //     toilets,
    //     'TOILET',
    //     500,
    //     5_000,
    //     0
    // );
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

function boundingCorners(gpxText) {
    const lats = [];
    const lons = [];
    const trkptRegex = /<trkpt[^>]*\blat="([^"]+)"[^>]*\blon="([^"]+)"/g;
    let match;
    while ((match = trkptRegex.exec(gpxText)) !== null) {
        lats.push(parseFloat(match[1]));
        lons.push(parseFloat(match[2]));
    }
    return [
        {lat: Math.min(...lats), lon: Math.min(...lons)},
        {lat: Math.max(...lats), lon: Math.max(...lons)},
    ];
}
