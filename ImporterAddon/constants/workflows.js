import STEPS from "./steps";

const workflows = {
    wms: [STEPS.provideOgcService, STEPS.selectLayers],
    wfs: [STEPS.provideOgcService, STEPS.selectLayers, STEPS.styleLayers],
    geojson: [STEPS.uploadFile, STEPS.styleLayers],
    shapezip: [STEPS.uploadFile, STEPS.styleLayers],
    geopackage: [STEPS.uploadFile, STEPS.styleLayers]
};

export default workflows;
