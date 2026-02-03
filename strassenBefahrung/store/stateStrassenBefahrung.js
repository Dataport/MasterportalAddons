/**
 * User type definition
 * @typedef {object} StrassenBefahrungState
 * @property {boolean} active if true, WahlRaumFinder will rendered
 * @property {string} id id of the WahlRaumFinder component
 * @property {string} name displayed as title (config-param)
 * @property {string} glyphicon icon next to title (config-param)
 * @property {boolean} renderToWindow if true, tool is rendered in a window, else in sidebar (config-param)
 * @property {boolean} resizableWindow if true, window is resizable (config-param)
 * @property {boolean} isVisibleInMenu if true, tool is selectable in menu (config-param)
 * @property {boolean} deactivateGFI flag if tool should deactivate gfi (config-param)
 */
const state = {
    id: "strassenBefahrung",
    // defaults for config.json parameters
    name: "StraßenBefahrung",
    icon: "bi-play",
    renderToWindow: false,
    resizableWindow: true,
    isVisibleInMenu: true,
    deactivateGFI: true,
    hasMouseMapInteractions: true,
    // tool specific attributes
    markerStyleId: "",
    ennStyleId: "",
    coords: [-1, -1],
    epsgNumber: "25832",
    user: "",
    password: "",
    loadEdgeNodeNetwork: false,
    // internal attributes
    ennLayer: {},
    markerLayer: null,
    initialWidth : "25%"
};

export default state;
