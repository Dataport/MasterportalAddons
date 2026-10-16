
const state = {
    hasMouseMapInteractions: true,
    icon: "bi-save",
    id: "wfstUploader",
    type: "wfstUploader",
    name: "additional:modules.tools.wfstUploader.title",
    description: "additional:modules.tools.wfstUploader.description",
    uploadLayerTypes: ["GeoJSON", "WFS"],
    wfstLayers: [],
    wfstAttributesForInput: "all",
    highlightStyles: {
        polygonStyle: {
            fill: {
                color: [
                    0,
                    77,
                    168,
                    0.5
                ]
            },
            stroke: {
                width: 4,
                color: [255, 0, 0, 1]
            }
        },
        lineStringStyle: {
            stroke: {
                width: 8,
                color: [255, 0, 255, 0.9]
            }
        },
        pointStyle: {
            scale: 3
        }
    }
};

export default state;
