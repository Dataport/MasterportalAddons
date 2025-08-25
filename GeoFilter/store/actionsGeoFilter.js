import createLayerAddToTreeModule from "@shared/js/utils/createLayerAddToTree";

const actions = {
    addFilteredFeaturesToTree ({rootGetters}, {layerId, features}) {
        createLayerAddToTreeModule.createLayerAddToTree(layerId, features, rootGetters.treeType, rootGetters.treeHighlightedFeatures);
    }
};


export default actions;
