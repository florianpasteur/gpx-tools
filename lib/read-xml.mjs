import * as jsdom from 'jsdom';

/**
 * Read XML content from a string and return the jsdom reference and document.
 * @param {string} fileContent
 * @returns {Promise<{jsdomRef: jsdom.JSDOM, document: Document}>}
 */
export async function readXml(fileContent) {
    const jsdomRef = new jsdom.JSDOM(fileContent, {contentType: "text/xml"});
    const document = jsdomRef.window.document;
    return {document, jsdomRef};
}
