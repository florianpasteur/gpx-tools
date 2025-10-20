import * as jsdom from 'jsdom';
import fs from 'fs/promises';

/**
 *
 * @param {string} filePath
 * @returns {Promise<{jsdomRef: jsdom.JSDOM, document: Document}>}
 */
export async function readXml(filePath) {
    const POI_KML_FILE_CONTENT = (await fs.readFile(filePath, 'utf-8')).toString();
    const jsdomRef = new jsdom.JSDOM(POI_KML_FILE_CONTENT, {contentType: "text/xml"});
    const document = jsdomRef.window.document;
    return {document, jsdomRef};
}
