import {readXml} from "../lib/read-xml.mjs";

/** Remove all personal data from GPX
 * @param gpxContent string
 * @returns {Promise<string>}
 */
export async function anonymizeGpx(gpxContent) {
    const gpx = await readXml(gpxContent);

    gpx.document.querySelectorAll('extensions').forEach(extension => {
        extension.remove();
    })

    return gpx.jsdomRef.serialize();
}
