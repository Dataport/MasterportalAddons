import {createFileLayerConfigs} from "../utils/layer";

const actions = {
    async setSelectedLayerFromFile ({commit, dispatch, getters}, {fileType, file, layerId, folderId}) {
        const layerOpts = await createFileLayerConfigs(fileType, file, layerId, folderId, getters.resourcesPath);

        if (!Array.isArray(layerOpts) || layerOpts.length === 0) {
            dispatch("Alerting/addSingleAlert", {
                category: "error",
                content: i18next.t("additional:modules.tools.importer.importFailed")
            }, {root: true});
        }
        else {
            commit("setSelectedLayers", layerOpts);
        }
    }
};

export default actions;
