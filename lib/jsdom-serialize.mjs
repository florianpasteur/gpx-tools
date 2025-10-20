
export function serialize(gpxJsdomRef) {
    return gpxJsdomRef.serialize().replaceAll('xmlns=""', '');
}
