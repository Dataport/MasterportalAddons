import layerCollection from "@core/layers/js/layerCollection";


/**
 * Check if a layer with the given ID already exists in the layer collection of the portal.
 * @param {String} layerId The ID of the layer to check.
 */
function isLayerNameTaken (layer) {
    return Boolean(layerCollection.getLayers().find(existingLayer => existingLayer.get("name") === layer.name));
}

/**
 * Generates a unique layer name by checking if the name already exists in the layer collection.
 * If it exists, appends _1, _2, etc. until a unique name is found.
 * @param {string} baseName - The base name to check
 * @returns {string} - Unique layer name
 */
function generateUniqueLayerName (baseName) {
    let uniqueName = baseName,
        counter = 1;

    // Create a temporary layer object for checking
    const tempLayer = {name: uniqueName};

    // Check if the base name already exists
    while (isLayerNameTaken(tempLayer)) {
        uniqueName = `${baseName}_${counter}`;
        tempLayer.name = uniqueName;
        counter++;
    }
    return uniqueName;
}

/**
 * Process layers for adding by ensuring unique names for all layers.
 * @param {Array} selectedLayers The layers to process.
 * @returns {Array} The filtered layers.
 */
export function processLayersForAdding (selectedLayers) {
    return selectedLayers.map(layer => ({
        ...layer,
        name: generateUniqueLayerName(layer.name)
    }));
}
