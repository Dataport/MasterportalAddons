import Feature from "ol/Feature";
import addFeaturePropertiesToFeature from "../../../src/modules/wfst/js/addFeaturePropertiesToFeature";

const actions = {
    /**
     * Uploads a feature with its properties to a WFST layer
     * @param {Object} context Vuex context
     * @param {Object} payload Action payload
     * @param {Object} payload.feature The OpenLayers feature to upload
     * @param {Array} payload.properties Array of property objects with values
     * @param {Object} payload.targetLayer Target WFST layer configuration
     */
    async uploadFeature (context, {feature, properties, targetLayer}) {
        // TODO: Implement the actual upload logic
        // const featureWithProperties = await addFeaturePropertiesToFeature(
        //     {
        //         id: feature.getId(),
        //         geometryName: feature.getGeometryName(),
        //         geometry: feature.getGeometry()
        //     },
        //     properties,
        //     false, // isUpdate
        //     targetLayer.featurePrefix,
        //     targetLayer.attributes
        // );

        // const response = await wfs.sendTransaction(
        //     rootGetters["Maps/projectionCode"],
        //     featureWithProperties,
        //     targetLayer.url,
        //     targetLayer,
        //     "insert"
        // );

        // return response;

        // Temporary placeholder
        console.log("Uploading feature:", feature);
        console.log("With properties:", properties);
        console.log("To target layer:", targetLayer);
        return {feature, properties, targetLayer};
    }
};

export default actions;
