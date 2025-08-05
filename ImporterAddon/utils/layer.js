import createStyle from "@masterportal/masterportalapi/src/vectorStyle/createStyle";
import {readGeoJsonFile, readShapeZipFile, readGeoPackageFile} from "./file";
import isMobile from "@shared/js/utils/isMobile";

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
    const level = 1,
        typ = "WMS";

    return {
        name: title,
        layers: name,
        id,
        parentId,
        level,
        url,
        version,
        typ
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
    const level = 1,
        typ = "WFS";

    return {
        type: "layer",
        name: title,
        featureNS: name.split(":")[0],
        featureType: name.split(":")[1] ? name.split(":")[1] : name,
        id,
        parentId,
        level,
        //url: addProxyIfNotContained(url),
        url: url,
        version,
        typ
    };
}

/**
 * Checks if a proxy is contained in the URL and if not, adds it.
 *
 * @param {String} url The URL to check and add proxy to
 * @returns {String} The given URL containing our proxy
 */
function addProxyIfNotContained (url) {
    if (url && url.toLowerCase().indexOf("proxyhttp") < 0) {
        let proxyUrl;

        if (url.startsWith("http:")) {
            proxyUrl = window.location.origin + "/proxyhttp/" + url.substring(7);
        }
        else if (url.startsWith("https:")) {
            proxyUrl = window.location.origin + "/proxyhttps/" + url.substring(8);
        }
        return proxyUrl;
    }
    return url;
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
        blob = new Blob([JSON.stringify(geojson)], {type: "application/geojson"}),
        url = URL.createObjectURL(blob);

    return {
        id,
        name,
        parentId,
        typ,
        type,
        url,
        gfiAttributes,
        gfiTheme
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
 * Adds the layers to the map.
 *
 * @param {Object[]} layerConfigs List of config objects that can be read by the parser.
 * @returns {void}
 */
export function addLayersToMap (layerConfigs) {
    layerConfigs.forEach(layerConfig => {
        switch (layerConfig.typ.toLowerCase()) {
            case "wms":
                Radio.trigger("Parser", "addLayer",
                    layerConfig.name,
                    layerConfig.id,
                    layerConfig.parentId,
                    layerConfig.level,
                    layerConfig.layers,
                    layerConfig.url,
                    layerConfig.version,
                    {}
                );
                break;
            case "wfs":
                Radio.trigger("Parser", "addItem", layerConfig);
                Radio.trigger("ModelList", "addModelsByAttributes", layerConfig);
                break;
            case "geojson":
                Radio.trigger("Parser", "addItem", layerConfig);
                Radio.trigger("ModelList", "addModelsByAttributes", layerConfig);
                break;
            default:
                break;
        }

        selectLayerInTree(layerConfig.parentId, layerConfig.id);
    });
}

/**
 * Applies styles for the layers if configured.
 *
 * @param {Object[]} layerConfigs List of layer config objects.
 * @returns {void}
 */
export function applyStyles (layerConfigs) {
    layerConfigs.forEach(layerConfig => {
        if (layerConfig.importedStyle) {
            const layerModel = Radio.request("ModelList", "getModelByAttributes", {id: layerConfig.id});

            layerModel.layer.setStyle((feat) => createStyle.createStyle(layerConfig.importedStyle, feat, false, Config.wfsImgPath));
        }
    });
}

/**
 * Select a layer in the layer tree.
 *
 * This is a dirty hack to make the imported layers visible, as the layertree does
 * not handle the isSelected property on instantiation correctly.
 *
 * @param {String} folderId The id of the folder that contains the layer.
 * @param {String} layerId The id of the layer.
 * @returns {void}
 */
function selectLayerInTree (folderId, layerId) {
    let folderEl;

    if (isMobile()) {
        // hack for mobile tree
        // get first div in dropdown item in #root = tree folder
        const treeEl = document.querySelector("#root").firstElementChild.firstElementChild;

        if (!treeEl) {
            return;
        }
        // expand tree
        treeEl.click();
        // imported layers folder is always last element in list
        folderEl = document.querySelector("#root").lastElementChild.firstElementChild;
    }
    else {
        // no-mobile tree mode
        folderEl = document.querySelector("." + folderId);
    }

    if (!folderEl) {
        return;
    }

    folderEl.click();

    // eslint-disable-next-line one-var
    const folderModel = Radio.request("ModelList", "getModelByAttributes", {id: folderId});

    if (!folderModel) {
        return;
    }

    // we have to collapse and expand the folder
    // in order to retrieve the newly added layer.
    folderModel.setIsExpanded(false);
    folderModel.setIsExpanded(true);

    // eslint-disable-next-line one-var
    const layerModel = Radio.request("ModelList", "getModelByAttributes", {id: layerId});

    if (!layerModel) {
        return;
    }

    layerModel.setIsSelected(true);
}

export default {
    addLayersToMap,
    createLayerConfigs,
    generateId
};
