const fs = require("fs/promises");
const {addKmlToGpx} = require("../add-kml-to-gpx.mjs");

describe('AddKmlToGpx', () => {
    let initialGpx;

    beforeAll(async () => {
        initialGpx = (await fs.readFile('tests/assets/initial-gpx.gpx', 'utf-8')).toString();
    })
    it('should add KML data to GPX file correctly', async () => {

        expect(addKmlToGpx(initialGpx)).toMatchSnapshot();

    })
})
