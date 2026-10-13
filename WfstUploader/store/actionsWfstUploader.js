import addFeaturePropertiesToFeature from "../../../src/modules/wfst/js/addFeaturePropertiesToFeature";
import wfs from "@masterportal/masterportalapi/src/layer/wfs";
import layerCollection from "@core/layers/js/layerCollection";
import {Polygon} from "ol/geom";

const actions = {
    /**
     * Uploads a feature with its properties to a WFST layer
     * @param {Object} context Vuex context
     * @param {Object} payload Action payload
     * @param {Object} payload.feature The OpenLayers feature to upload
     * @param {Array} payload.properties Array of property objects with values
     * @param {Object} payload.targetLayer Target WFST layer configuration
     */
    async uploadFeature ({rootGetters, dispatch}, {feature, properties, targetLayer}) {
        let featureWithProperties = null,
            response = null,
            geometry = feature.getGeometry();

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

        // Convert MultiPolygon to Polygon for WFS-T compatibility
        if (geometry.getType() === "MultiPolygon") {
            const polygons = geometry.getPolygons();

            // Always convert to the first polygon only to prevent multiple uploads
            // This ensures only one polygon is sent to the WFS service
            geometry = new Polygon(polygons[0].getCoordinates());
        }

        featureWithProperties = await addFeaturePropertiesToFeature(
            {
                geometryName: geometryName,
                geometry: geometry
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
            dispatch("Alerting/addSingleAlert", {
                category: "error",
                content: i18next.t("additional:modules.tools.wfstUploader.uploadError", error, {root: true})
            }, {root: true});
            throw error;
        }
        finally {
            targetLayerSource.refresh();
        }

        return response;
    }
};

export default actions;
