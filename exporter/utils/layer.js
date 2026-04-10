import EXPORTFORMATS from "../constants/exportformats";
import LAYERTYPES from "../constants/layertypes";

/**
 * Get a downloadLayer from drawLayer.
 *
 * @param {any} drawLayer The drawLayer.
 * @param {String} drawLayerName The name for the draw layer.
 * @param {String} epsg The epsg code of the layer.
 * @returns {any} The downloadLayer;
 */
export function drawLayerToDownloadLayer (drawLayer) {
    return {
        type: LAYERTYPES.draw,
        name: drawLayer.name,
        layer: drawLayer,
        exportFormats: [EXPORTFORMATS.geoJson, EXPORTFORMATS.gml, EXPORTFORMATS.shp, EXPORTFORMATS.gpkg],
        srsName: drawLayer.crs
    };
}

/**
 * Get a downloadLayer from geojson.
 *
 * @param {any} geoJson The geoJson layer.
 * @returns {any} The downloadLayer.
 */
export function geoJsonToDownloadLayer (geoJson) {
    return {
        type: LAYERTYPES.geoJson,
        name: geoJson.name,
        url: geoJson.url,
        exportFormats: [EXPORTFORMATS.geoJson, EXPORTFORMATS.gml, EXPORTFORMATS.shp, EXPORTFORMATS.gpkg]
    };
}

/**
 * Get a downloadLayer from wfs.
 *
 * @param {any} wfs The wfs layer.
 * @returns {any} The downloadLayer.
 */
export function wfsToDownloadLayer (wfs) {
    // Note, this does not handle authenticated layers yet.
    return {
        type: LAYERTYPES.wfs,
        name: wfs.name,
        url: wfs.url,
        featureType: wfs.featureType,
        version: wfs.version,
        exportFormats: [EXPORTFORMATS.geoJson, EXPORTFORMATS.gml, EXPORTFORMATS.shp, EXPORTFORMATS.gpkg]
    };
}

/**
 * Get a downloadLayer from geojson.
 *
 * @param {any} vectorBase The vectorBase layer.
 * @returns {any} The downloadLayer.
 */
export function vectorBaseDownloadLayer (vectorBase) {
    return {
        type: LAYERTYPES.vectorBase,
        name: vectorBase.name,
        url: vectorBase.url,
        layer: vectorBase,
        epsg: vectorBase.crs,
        exportFormats: [EXPORTFORMATS.geoJson, EXPORTFORMATS.gml, EXPORTFORMATS.shp, EXPORTFORMATS.gpkg]
    };
}

export default {
    drawLayerToDownloadLayer,
    geoJsonToDownloadLayer,
    wfsToDownloadLayer,
    vectorBaseDownloadLayer
};
