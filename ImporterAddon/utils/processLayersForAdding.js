import layerCollection from "@core/layers/js/layerCollection";


/**
 * Check if a layer with the given attribute value already exists in the layer collection of the portal.
 * @param {String} attribute - The attribute to check (e.g., "name" or "id").
 * @param {String} value - The value to check for uniqueness.
 * @returns {Boolean} - True if the value is already taken.
 */
function isLayerAttributeTaken (attribute, value) {
    return Boolean(layerCollection.getLayers().find(existingLayer => existingLayer.get(attribute) === value));
}

/**
 * Generates a unique value for a given layer attribute (e.g., name or id).
 * If the value already exists, appends _1, _2, etc. until a unique value is found.
 * @param {string} baseValue - The base value to check.
 * @param {string} attribute - The attribute to check (e.g., "name" or "id").
 * @returns {string} - Unique value for the attribute.
 */
function generateUniqueLayerAttribute (baseValue, attribute) {
    let uniqueValue = baseValue,
        counter = 1;

    // Check if the base value already exists
    while (isLayerAttributeTaken(attribute, uniqueValue)) {
        uniqueValue = `${baseValue}_${counter}`;
        counter++;
    }
    return uniqueValue;
}

/**
 * Process layers for adding by ensuring unique names for all layers.
 * @param {Array} selectedLayers The layers to process.
 * @returns {Array} The filtered layers.
 */
export function processLayersForAdding (selectedLayers) {
    return selectedLayers.map(layer => ({
        ...layer,
        name: generateUniqueLayerAttribute(layer.name, "name"),
        id: generateUniqueLayerAttribute(layer.id, "id")
    }));
}
