import {createFileLayerConfigs} from "../utils/layer";

const actions = {
    async setSelectedLayerFromFile ({commit}, {fileType, file, layerId, folderId}) {
        const layerOpts = await createFileLayerConfigs(fileType, file, layerId, folderId);

        commit("setSelectedLayers", layerOpts);
    }
};

export default actions;
