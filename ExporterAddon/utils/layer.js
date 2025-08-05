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
export function drawLayerToDownloadLayer (drawLayer, drawLayerName, epsg) {
    return {
        type: LAYERTYPES.draw,
        name: drawLayerName,
        layer: drawLayer,
        exportFormats: [EXPORTFORMATS.geoJson, EXPORTFORMATS.gml, EXPORTFORMATS.shp, EXPORTFORMATS.gpkg],
        srsName: epsg
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
        name: geoJson.get("name"),
        url: geoJson.get("url"),
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
        name: wfs.get("name"),
        url: wfs.get("url"),
        featureType: wfs.get("featureType"),
        version: wfs.get("version"),
        exportFormats: [EXPORTFORMATS.geoJson, EXPORTFORMATS.gml, EXPORTFORMATS.shp, EXPORTFORMATS.gpkg]
    };
}

export default {
    drawLayerToDownloadLayer,
    geoJsonToDownloadLayer,
    wfsToDownloadLayer
};
