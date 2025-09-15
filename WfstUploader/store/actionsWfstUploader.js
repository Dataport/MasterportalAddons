import addFeaturePropertiesToFeature from "../../../src/modules/wfst/js/addFeaturePropertiesToFeature";
import wfs from "@masterportal/masterportalapi/src/layer/wfs";
import layerCollection from "@core/layers/js/layerCollection";

const actions = {
    /**
     * Uploads a feature with its properties to a WFST layer
     * @param {Object} context Vuex context
     * @param {Object} payload Action payload
     * @param {Object} payload.feature The OpenLayers feature to upload
     * @param {Array} payload.properties Array of property objects with values
     * @param {Object} payload.targetLayer Target WFST layer configuration
     */
    async uploadFeature ({rootGetters}, {feature, properties, targetLayer}) {
        let featureWithProperties = null,
            response = null;

        const targetLayerSource = layerCollection.getLayerById(targetLayer.id).getLayerSource(),
            geometryName = targetLayerSource.getFeatures().length > 0
                ? targetLayerSource.getFeatures()[0].getGeometryName()
                : "geom",
            propertiesWithGeometry = [...properties];

        if (!propertiesWithGeometry.some(prop => prop.type === "geometry")) {
            propertiesWithGeometry.push({
                key: geometryName,
                label: "geometry",
                type: "geometry",
                value: null
            });
        }

        featureWithProperties = await addFeaturePropertiesToFeature(
            {
                geometryName: geometryName,
                geometry: feature.getGeometry()
            },
            propertiesWithGeometry,
            false, // isUpdate
            targetLayer.featurePrefix
        );

        try {
            response = await wfs.sendTransaction(
                rootGetters["Maps/projectionCode"],
                featureWithProperties,
                targetLayer.url,
                targetLayer,
                "insert"
            );
        }
        catch (error) {
            console.error("Error uploading feature:", error);
            throw error;
        }
        finally {
            targetLayerSource.refresh();
        }

        return response;
    }
};

export default actions;
