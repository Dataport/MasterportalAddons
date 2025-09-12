const state = {
    hasMouseMapInteractions: true,
    icon: "bi-save",
    id: "wfstUploader",
    type: "wfstUploader",
    name: "additional:modules.tools.wfstUploader.title",
    description: "additional:modules.tools.wfstUploader.description",
    uploadLayerTypes: ["GeoJSON", "WFS"],
    wfstLayers: [],
    selectedFeature: null,
    wfstAttributesForInput: "all"
};

export default state;
