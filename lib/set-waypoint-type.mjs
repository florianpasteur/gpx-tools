export function setWaypointType(wpt, gpxDoc, type) {
    const existingTypeElement = wpt.querySelector('type');
    if (existingTypeElement) {
        existingTypeElement.textContent = type;
    } else {
        const typeElement = gpxDoc.createElement('type');
        typeElement.textContent = type;
        wpt.appendChild(typeElement);
    }
}
