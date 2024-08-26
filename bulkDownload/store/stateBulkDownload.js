/**
 * User type definition
 * @typedef {Object} state
 * @property {Boolean} hasMouseMapInteractions Tool interacts with the map
 * @property {String} type type of the BulkDownload component
 * @property {Object[]} layerForDownload list of layers from which data can be downloaded
 * @property {String[]} supportedDevices list of devices supported
 * @property {String[]} supportedMapModes list of map modes supported
 * @property {Object} confirmationData id for the download page
 * @property {String} description The description that should be shown in the button in the menu.
 * @property {String} name Displayed as title (config-param)
 * @property {String} icon icon next to title (config-param)
 * @property {String} backendUrl url for the backend request
 * @property {String} confirmationUrl url for the download page
 */
const state = {
    hasMouseMapInteractions: true,
    type: "bulkDownload",
    layerForDownload: [],
    supportedDevices: ["Desktop", "Mobile", "Table"],
    supportedMapModes: ["2D"],
    confirmationData: null,
    // defaults for config.json parameters
    name: "additional:modules.bulkDownload.name",
    icon: "bi-file-earmark-arrow-down",
    backendUrl: "",
    confirmationUrl: ""
};

export default state;
