/**
 * User type definition
 * @typedef {Object} state
 * @property {boolean} hasMouseMapInteractions - Indicates if there are mouse map interactions.
 * @property {string} type - Represents the type of wfsSumQuery.
 * @property {string[]} supportedDevices - Array containing supported device types like Desktop, Mobile, Table.
 * @property {string[]} supportedMapModes - Array containing supported map modes like 2D.
 * @property {string} description - Default value for the description obtained from config.json.
 * @property {string} name - Default value for the name obtained from config.json.
 * @property {string} icon - Default value for the icon obtained from config.json.
 * @property {Array<string>} uniqueAttributes - Array containing unique attributes used for filtering or identifying features.
 * @property {Object} highlightVectorRulesPointLine - Styling rules for highlighting point and line features, including 'fill' color and opacity, and 'stroke' color and width.
 * @property {Object} highlightVectorRulesPolygon - Styling rules for highlighting polygon features, including 'fill' color and opacity, and 'stroke' color and width.
 * @property {Array<Object>} allSelectedFeatureProperties - Array containing all selected features' properties.
 * @property {Array<Object>} selectedFeatures - Array containing the currently selected features.
 * @property {boolean} active - Indicates if the module is currently active.
 * @property {number} circleRadius - The radius for circular selections, typically in meters.
 * @property {string|null} selectedLayerId - The ID of the currently selected layer, or null if no layer is selected.
 * @property {boolean} newDrawend - Flag to indicate whether a new drawing action has been completed.
 * @property {Array<Object>} layersForSelection - Array containing the layers that can be selected for the tool.
 */
const state = {
    hasMouseMapInteractions: true,
    type: "wfsSumQuery",
    supportedDevices: ["Desktop", "Mobile", "Table"],
    supportedMapModes: ["2D"],
    // defaults for config.json parameters
    description: "additional:modules.wfsSumQuery.description",
    name: "additional:modules.wfsSumQuery.name",
    icon: "bi-person-bounding-box",
    highlightVectorRulesPointLine: {
        fill: {color: "rgba(135, 206, 250, 0.6)"},
        stroke: {color: "rgb(70, 130, 180)", width: 1}
    },
    highlightVectorRulesPolygon: {
        fill: {color: "rgba(144, 238, 144, 0.4)"},
        stroke: {color: "rgb(34, 139, 34)", width: 1}
    },

    allSelectedFeatureProperties: [],
    selectedFeatures: [],
    uniqueAttributes: [],
    active: false,
    circleRadius: 0,
    selectedLayerId: null,
    newDrawend: false,
    layersForSelection: [],
    featureType: "",
    definedCircle: false
};

export default state;
