export function distanceInMeters(pointA, pointB) {
    const R = 6371e3; // metres
    const φ1 = pointA.lat * Math.PI/180;
    const φ2 = pointB.lat * Math.PI/180;
    const Δφ = (pointB.lat-pointA.lat) * Math.PI/180;
    const Δλ = (pointB.lon-pointA.lon) * Math.PI/180;

    return R * Math.acos(Math.sin(φ1)*Math.sin(φ2) + Math.cos(φ1)*Math.cos(φ2)*Math.cos(Δλ));
}
