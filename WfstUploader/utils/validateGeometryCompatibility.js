import layerCollection from "@core/layers/js/layerCollection";

/**
* Validates if the geometry type of the selected feature is compatible with the target WFST layer
* @param {ol.Feature} feature The OpenLayers feature to validate
* @param {Object} targetLayer The target WFST layer configuration
* @returns {Boolean} True if geometry types are compatible, false otherwise
*/
export default function (feature, targetLayer) {
    if (!feature || !feature.getGeometry() || !targetLayer) {
        return false;
    }

    const featureGeometryType = feature.getGeometry().getType(),
        layerSource = layerCollection.getLayerById(targetLayer.id).getLayerSource(),
        existingFeatures = layerSource.getFeatures(),
        compatibilityMap = {
            "Point": ["Point", "MultiPoint"],
            "MultiPoint": ["Point", "MultiPoint"],
            "LineString": ["LineString", "MultiLineString"],
            "MultiLineString": ["LineString", "MultiLineString"],
            "Polygon": ["Polygon", "MultiPolygon"],
            "MultiPolygon": ["Polygon", "MultiPolygon"]
        };

    let expectedGeometryType = null,
        compatibleTypes = [];

    if (existingFeatures.length === 0) {
        // No existing features, allow any geometry type
        return true;
    }

    expectedGeometryType = existingFeatures[0].getGeometry().getType();
    compatibleTypes = compatibilityMap[expectedGeometryType] || [expectedGeometryType];

    return compatibleTypes.includes(featureGeometryType);
}
