export function refineWaypoint(gpxDoc) {
    return function (wpt) {
        const waypointContent = wpt.innerHTML.toLocaleLowerCase();
        const children = wpt.querySelectorAll('*');
        children.forEach(child => {
            if (child.textContent === '') {
                child.remove();
            }
            if (child.textContent.length > 200) {
                child.textContent = child.textContent.substring(0, 200) + '...';
            }
        });

        const sym = wpt.querySelector('sym');
        if (sym) {
            sym.remove();
        }
        if (waypointContent.includes('water')) {
            setWaypointType(wpt, gpxDoc, 'WATER');
            return;
        }
        if (waypointContent.includes('camp')) {
            setWaypointType(wpt, gpxDoc, 'CAMPSITE');
            return;
        }
        if (waypointContent.includes('shop')) {
            setWaypointType(wpt, gpxDoc, 'AID STATION');
            return;
        }
        if (waypointContent.includes('toilet')) {
            setWaypointType(wpt, gpxDoc, 'TOILET');
            return;
        }
        setWaypointType(wpt, gpxDoc, 'OVERLOOK');
    }
}
