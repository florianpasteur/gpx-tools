export function createWaypoint(document, {lat, lon, name, type}) {
    const wpt = document.createElement('wpt');
    wpt.setAttribute('lat', lat);
    wpt.setAttribute('lon', lon);
    const nameElement = document.createElement('name');
    nameElement.textContent = name;
    const typeElement = document.createElement('type');
    typeElement.textContent = type;
    wpt.appendChild(nameElement);
    wpt.appendChild(typeElement);
    document.querySelector('gpx').appendChild(wpt);
    return document
}
