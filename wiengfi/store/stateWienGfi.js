import defaults from "../defaults.json";
/**
 * User type definition
 * @typedef {Object} state
 * @property {String} activeTab the current active tab
 */

const state = {
    multiformatItems: [],
    selectedOption: {},
    activeFeature: defaults.activeFeature || {},
    download: defaults.download || {},
    valueConverters: defaults.valueConverters || {},
    attributions: defaults.attributions || {},
    matchAttributes: defaults.matchAttributes || [],
    tableAttributes: defaults.tableAttributes || [],
    captions: defaults.captions || [],
    paginationKey: defaults.paginationKey || "",
    dropDownAttributeKey: defaults.dropDownAttributeKey || ""
};

export default state;
