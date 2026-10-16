/**
 * Get the highlight style for a given feature type.
 * @param {Object} featureType The geometry type of the feature (e.g., "LineString", "Polygon").
 * @param {Object} styleObject The style object containing predefined styles for different geometry types.
 * @returns {Object} The highlight style name that is associated with the feature type. The styles are defined in the state of the wfst uploader.
 */
export default function (featureType, styleObject) {
    switch (featureType) {
        case "LineString":
        case "MultiLineString":
            return styleObject.lineStringStyle;
        case "Polygon":
        case "MultiPolygon":
            return styleObject.polygonStyle;
        default:
            return null;
    }
}
