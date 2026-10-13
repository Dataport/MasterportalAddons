/**
 * Determine the highlight type based on the geometry type of the feature. This is needed for the function highlightFeature.
 *
 * @param {module:ol/Feature} feature The feature to evaluate.
 * @returns {String|null} The highlight type corresponding to the geometry type, or null if unsupported.
 */
export default function (feature) {
    switch (feature.getGeometry()?.getType()) {
        case "Point":
        {
            return "increase";
        }
        case "Polygon":
        {
            return "highlightPolygon";
        }
        case "MultiPolygon":
        {
            return "highlightMultiPolygon";
        }
        case "LineString":
        {
            return "highlightLine";
        }
        case "MultiLineString":
        {
            return "highlightMultiLine";
        }
        default:
            return null;
    }
}
