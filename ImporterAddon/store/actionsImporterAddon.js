import {createFileLayerConfigs} from "../utils/layer";

const actions = {
    async setSelectedLayerFromFile ({commit}, {fileType, file, layerId, folderId}) {
        const layerOpts = await createFileLayerConfigs(fileType, file, layerId, folderId);

        commit("setSelectedLayers", layerOpts);
    },

    /**
     * Opens the importer with the given settings.
     *
     * @param {Object} param0 The store.
     * @param {Object} param1 The config object for the importer addon.
     * @param {string} param1.workflow The name of the workflow.
     * @param {string} param1.currentStep The name of the current step.
     * @param {string} param1.capabilitiesUrl The capabilities url (if needed).
     * @param {Function} param1.onImportFinished The callback function when the import finished.
     * @returns {void}
     */
    openImporterWith ({commit}, {workflow = undefined, currentStep = undefined, capabilitiesUrl = "", onImportFinished}) {
        commit("resetImporterAddon");
        commit("setCurrentWorkflow", workflow);
        commit("setSelectedWorkflow", workflow);
        commit("setCurrentStep", currentStep);
        commit("setCapabilitiesUrl", capabilitiesUrl);
        commit("setOnImportFinished", onImportFinished);
        commit("setActive", true);
    }
};

export default actions;
