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
    let existingGeometryTypes = [],
        isCompatible = false;

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

    if (existingFeatures.length === 0) {
        return true;
    }

    existingGeometryTypes = [...new Set(
        existingFeatures.map(existingFeature => existingFeature.getGeometry().getType())
    )];
    isCompatible = existingGeometryTypes.some(existingType => {
        const compatibleTypes = compatibilityMap[existingType] || [existingType];

        return compatibleTypes.includes(featureGeometryType);
    });

    return isCompatible;
}
