const actions = {
    /**
     * Opens the exporter with the given settings.
     *
     * @param {Object} param0 The store.
     * @param {Object} param1 The config object for the exporter addon.
     * @param {String} param1.workflow The name of the workflow.
     * @param {String} param1.step The name of the current step.
     * @param {Object} param1.selectedLayer The selected layer.
     * @param {String} param1.capabilitiesUrl The WFS GetCapabilities url.
     * @param {Function} param1.onExportFinished The callback function when the export finished.
     * @returns {void}
     */
    openExporterWith ({commit}, {step = undefined, workflow, selectedLayer, capabilitiesUrl, onExportFinished}) {
        commit("resetExporterAddon");
        commit("setCurrentStep", step);
        commit("setCurrentWorkflow", workflow);
        commit("setCapabilitiesUrl", capabilitiesUrl);
        commit("setSelectedLayer", selectedLayer);
        commit("setOnExportFinished", onExportFinished);
        commit("setActive", true);
    }
};

export default actions;
