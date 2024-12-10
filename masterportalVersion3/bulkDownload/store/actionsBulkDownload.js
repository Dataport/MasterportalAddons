import store from "../../../src/app-store";

/**
 * Searches the portalConfig for the given key and value
 * @param {Object} portalConfig - config that is to be searched
 * @param {String} key - addon attribute that helds the name
 * @param {Object} value - addon attribute that helds the value
 * @returns {Object} config for addon
 */
function searchForConfig (portalConfig, key, value) {
    if (portalConfig[key] === value) {
        return portalConfig;
    }
    for (const i in portalConfig) {
        if (typeof portalConfig[i] === "object") {
            const found = searchForConfig(portalConfig[i], key, value);

            if (found) {
                return found;
            }
        }
    }
    return null;
}

const actions = {
    /**
     * Filters all layers that are configured in the map  by the parameter "bulkDownload" and sets them as 'layerForDownload' in the state.
     * Until refactoring of the Backend, the options for the layers "KAPPAZUNDERLIDAR" and "KAPPAZUNDERPANO" are hardcoded here.
     * @param {state} param.state the context of the state
     */
    initializeLayerForDownload ({commit, rootGetters}) {
        const layerForDownload = rootGetters.allLayerConfigs.filter(layer => layer.bulkDownload === true);

        layerForDownload.forEach(layer => {
            if (layer.layers === "KAPPAZUNDERLIDAR") { // replace with Layername for Point Clouds
                layer.options = "1"; // Point Clouds
            }
            else if (layer.layers === "KAPPAZUNDERPANO") { // replace with Layername for Image Data
                layer.options = "2"; // Image Data
            }
        });

        commit("setLayerForDownload", layerForDownload);

    },
    /**
     * Sets the url for backend reqests and the url for the confirmation page
     * @param {state} param.state the context of the state
     */
    initializeUrls ({commit, dispatch}) {
        const portalConfig = store.getters?.portalConfig,
            wienBulkDownloadConfig = searchForConfig(portalConfig, "type", "bulkDownload");

        if (!wienBulkDownloadConfig?.backendUrl || !wienBulkDownloadConfig?.confirmationUrl) {
            console.error("No URLs for backend and/or confirmation page found");
            dispatch("Alerting/addSingleAlert", {
                category: "error",
                title: "BulkDownload",
                content: "additional:modules.bulkDownload.noUrls"
            }, {root: true});
        }
        else {
            commit("setBackendUrl", wienBulkDownloadConfig.backendUrl);
            commit("setConfirmationUrl", wienBulkDownloadConfig.confirmationUrl);
        }


    }
};

export default actions;
