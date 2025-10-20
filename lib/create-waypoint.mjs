function createWaypoint(document, {lat, lon, name, type}) {
    const wpt = document.createElement('wpt');
    wpt.setAttribute('lat', lat);
    wpt.setAttribute('lon', lon);
    const nameElement = document.createElement('name');
    nameElement.textContent = name;
    const typeElement = document.createElement('type');
    switch (type) {
        case 'bridge':
            typeElement.textContent = 'BRIDGE';
            break;
        case 'deltaWork':
            typeElement.textContent = 'CROSSING';
            break;
        case 'POI':
            typeElement.textContent = 'OVERLOOK';
            break;
        case 'water':
            typeElement.textContent = 'WATER';
            break;
        case 'toilets':
            typeElement.textContent = 'TOILET';
            break;
        default:
            typeElement.textContent = 'OVERLOOK';
    }
    wpt.appendChild(nameElement);
    wpt.appendChild(typeElement);
    document.querySelector('gpx').appendChild(wpt);
    return document
}
