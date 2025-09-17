import createStyle from "@masterportal/masterportalapi/src/vectorStyle/createStyle";
import {readGeoJsonFile, readShapeZipFile, readGeoPackageFile} from "./file";
import layerCollection from "@core/layers/js/layerCollection";
import styleList from "@masterportal/masterportalapi/src/vectorStyle/styleList";

/**
 * Generates a layer id.
 *
 * @param {Number} counter The numeric part of the id.
 * @returns {String} The generatedId.
 */
export function generateId (counter) {
    return "importedLayer_" + counter;
}

/**
 * Create WMS Layer config object.
 *
 * This config object can be used with
 * Radio.trigger("Parser", "addLayer", configObj)
 *
 * @param {String} url The WMS url.
 * @param {String} version The WMS version.
 * @param {String} parentId The id of the folder to add the layer to.
 * @param {Object} param0 Instance specific config object.
 * @param {String} param0.name The layer names.
 * @param {String} param0.title Display name of the layer.
 * @returns {Object} A valid WMS config object.
 */
function createWMSLayerConfig (url, version, parentId, {name, title, id}) {
    return {
        id,
        parentId,
        name: title,
        typ: "WMS",
        layers: name,
        url,
        version,
        visibility: true,
        type: "layer",
        isExternal: true,
        showInLayerTree: true,
        legendURL: "",
        datasets: []
    };
}

/**
 * Create WFS Layer config object.
 *
 * This config object can be used with
 * Radio.trigger("Parser", "addItem", configObj)
 * Radio.trigger("ModelList", "addModelsByAttributes", configObj);
 *
 * @param {String} url The WFS url.
 * @param {String} version The WFS version.
 * @param {String} parentId The id of the folder to add the layer to.
 * @param {Object} param0 Instance specific config object.
 * @param {String} param0.name The layer names.
 * @param {String} param0.title Display name of the layer.
 * @returns {Object} A valid WFS config object.
 */
function createWFSLayerConfig (url, version, parentId, {name, title, id}) {
    const styleId = id;

    // Add empty style to styleList to avoid warning
    styleList.addToStyleList([{styleId, rules: []}]);

    return {
        type: "layer",
        typ: "WFS",
        name: title,
        featureNS: name.split(":")[0],
        featureType: name.split(":")[1] ? name.split(":")[1] : name,
        id,
        styleId,
        gfiAttributes: "showAll",
        gfiTheme: "default",
        parentId,
        isExternal: true,
        url: url,
        version,
        showInLayerTree: true,
        visibility: true
    };
}

/**
 * Creates wms layers config objects.
 *
 * @param {String} url The WMS url.
 * @param {String} version The WMS version.
 * @param {String} folderId The id of the folder to add the layers to.
 * @param {Object[]} layerOpts List of layer opts.
 * @returns {Object[]} List of created layers.
 */
function createWMSLayerConfigs (url, version, folderId, layerOpts) {
    return layerOpts.map(layerOpt => createWMSLayerConfig(url, version, folderId, layerOpt));
}

/**
 * Creates wfs layers config objects.
 *
 * @param {String} url The WFS url.
 * @param {String} version The WFS version.
 * @param {String} folderId The id of the folder to add the layers to.
 * @param {Object[]} layerOpts List of layer opts.
 * @returns {Object[]} List of created layers.
 */
function createWFSLayerConfigs (url, version, folderId, layerOpts) {
    return layerOpts.map(layerOpt => createWFSLayerConfig(url, version, folderId, layerOpt));
}

/**
 * Creates a geojson layer config that can be directly used with
 * the masterportal layer parser.
 *
 * In order to be able to import the geojson file, we have to create a
 * link containing the geojson as a blob, as the masterportal does not
 * support adding geojson objects, directly.
 *
 * @param {Object} geojson The GeoJSON.
 * @param {String} name The visible name of the layer.
 * @param {String} id The id of the layer.
 * @param {String} parentId The id of the folder to add the layers to.
 * @returns {Object} LayerConfig.
 */
function createGeoJsonLayerConfig (geojson, name, id, parentId) {
    const typ = "GeoJSON",
        type = "layer",
        gfiAttributes = "showAll",
        gfiTheme = "default",
        visibility = true,
        showInLayerTree = true,
        styleId = id,
        blob = new Blob([JSON.stringify(geojson)], {type: "application/geojson"}),
        url = URL.createObjectURL(blob);

    // Add empty style to styleList to avoid warning
    styleList.addToStyleList([{styleId, rules: []}]);

    return {
        id,
        name,
        parentId,
        styleId,
        typ,
        type,
        url,
        gfiAttributes,
        gfiTheme,
        visibility,
        showInLayerTree
    };
}

/**
 * Creates layer config objects that can be directly used with
 * the masterportal layer parser.
 *
 * @param {String} service The type of service "wms", "wfs".
 * @param {String} url The service url.
 * @param {String} version The service version.
 * @param {String} folderId The id of the folder to add the layers to.
 * @param {Object[]} layerOpts Instance specific configs.
 * @returns {Object[]} List of config objects.
 */
export function createLayerConfigs (service, url, version, folderId, layerOpts) {
    let layerConfigs = [];

    if (service === "wms") {
        layerConfigs = createWMSLayerConfigs(url, version, folderId, layerOpts);
    }
    else if (service === "wfs") {
        layerConfigs = createWFSLayerConfigs(url, version, folderId, layerOpts);
    }

    return layerConfigs;
}

/**
 * Creates layer config objects that can be directly used with
 * the masterportal layer parser.
 *
 * @param {String} filetype The type of the file "geojson".
 * @param {File} file The file to create the config from.
 * @param {String} layerId The id of the layer.
 * @param {String} folderId The id of the folder to add the layers to.
 * @returns {Object[]} List of config object.
 */
export async function createFileLayerConfigs (filetype, file, layerId, folderId) {
    let layerConfigs = [];

    if (filetype === "geojson") {
        const fileContent = await readGeoJsonFile(file),
            // remove file extension from fileName
            fileParts = file.name.split(".");

        fileParts.pop();

        // eslint-disable-next-line one-var
        const fileName = fileParts.join(".");

        layerConfigs = [createGeoJsonLayerConfig(fileContent, fileName, layerId, folderId)];
    }
    if (filetype === "shapezip") {
        const shapeLayers = await readShapeZipFile(file);

        // prepend idx to get unique layer id and name
        // fileName = name of the layer in shapefile
        layerConfigs = shapeLayers.map(layer => createGeoJsonLayerConfig(
            layer, layer.fileName, layer.fileName, folderId));
    }
    if (filetype === "geopackage") {
        const featureTables = await readGeoPackageFile(file);

        layerConfigs = featureTables.map(geojson => createGeoJsonLayerConfig(
            geojson, geojson.tableName, geojson.tableName, folderId));
    }

    return layerConfigs;
}

/**
 * Applies styles for the layers if configured.
 *
 * @param {Object[]} layerConfigs List of layer config objects.
 * @returns {void}
 */
export function applyStyles (layerConfigs) {
    layerConfigs.forEach(layerConfig => {
        const layerModel = layerCollection.getLayerById(layerConfig.id);

        if (layerConfig.importedStyle && layerModel) {
            layerModel.layer.setStyle((feat) => createStyle.createStyle(layerConfig.importedStyle, feat, false, Config.wfsImgPath));
        }
    });
}

export default {
    createLayerConfigs,
    generateId
};
