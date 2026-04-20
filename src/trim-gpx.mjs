import {readXml} from "../lib/read-xml.mjs";
import {serialize} from "../lib/jsdom-serialize.mjs";

/**
 * Trim a GPX file to keep only trackpoints within a time window.
 * The window is centered on the given timestamp with the specified total duration.
 *
 * @param {string} gpxContent - The GPX file content as a string
 * @param {string|Date} timestamp - Center timestamp (ISO string or Date object)
 * @param {number} durationSeconds - Total duration in seconds (split equally before/after timestamp)
 * @returns {Promise<string>} The trimmed GPX content
 */
export async function trimGpx(gpxContent, timestamp, durationSeconds) {
    const {document: gpxDoc, jsdomRef: gpxJsdomRef} = await readXml(gpxContent);

    const centerTime = new Date(timestamp).getTime();
    const halfDuration = (durationSeconds * 1000) / 2;
    const startTime = centerTime - halfDuration;
    const endTime = centerTime + halfDuration;

    gpxDoc.querySelectorAll('trkpt').forEach(trkpt => {
        const timeElement = trkpt.querySelector('time');
        if (!timeElement) {
            trkpt.remove();
            return;
        }

        const pointTime = new Date(timeElement.textContent).getTime();
        if (pointTime < startTime || pointTime > endTime) {
            trkpt.remove();
        }
    });

    return serialize(gpxJsdomRef);
}
