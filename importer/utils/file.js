import MIMETYPES from "../constants/mimetypes";
import FILETYPES from "../constants/filetypes";
import {parseZip} from "shpjs";

/**
 * Check if the extension of the given file name is accepted for given service.
 *
 * @param {String} fileName The name of the file including file extension.
 * @param {String} serviceType The type of the serivce.
 * @returns {Boolean} True, if file extension is accepted. False otherwise.
 */
export function isFileExtensionAccepted (fileName, serviceType) {
    const fileEnding = fileName.split(".")[fileName.split(".").length - 1];

    if (fileEnding.length === 0) {
        return false;
    }

    return FILETYPES[serviceType].includes("." + fileEnding.toLowerCase());
}

/**
 * Check if the given mime type is accepted for given service.
 *
 * @param {String} mimeType The type of the file.
 * @param {String} serviceType The type of the service.
 * @returns {Boolean} True, if mime type is accepted. False otherwise.
 */
export function isMimeTypeAccepted (mimeType, serviceType) {
    return MIMETYPES[serviceType].includes(mimeType.toLowerCase());
}

/**
 * Reads a geoJSON file and returns its content as JSON.
 *
 * @param {File} file The GeoJson file to read.
 * @returns {Object} The content of the file as JSON.
 */
export async function readGeoJsonFile (file) {
    const fileText = await file.text();

    return JSON.parse(fileText);
}

/**
 * Parses a zipped shapefile (File API object) and returns
 * geoJSON file(s) as JSON.
 *
 * @param {File} file The zipped shapefile file to read.
 * @returns {Object[]} List of geojson objects.
 */
export async function readShapeZipFile (file) {
    const arrayBuffer = await file.arrayBuffer(),
        shape = await parseZip(arrayBuffer);

    // allways return array
    return !Array.isArray(shape) ? [shape] : shape;
}

/**
 * Reads a GeoPackage file and returns its content as GeoJson.
 *
 * @param {File} file The GeoJson file to read.
 * @returns {Object} List of feature tables as GeoJson FeatureCollections
 */
export async function readGeoPackageFile (file) {
    // create array buffer
    const buffer = await file.arrayBuffer(),
        // create Uint8Array
        uint8Array = new Uint8Array(buffer),
        gpkg = await prepareGPKG(uint8Array),
        // get tables
        featureTables = gpkg.getFeatureTables(),
        // iterate over feature tables, query features and store in feature collection
        featureCollections = featureTables.map(table => {
            const features = gpkg.queryForGeoJSONFeaturesInTable(table);

            return {
                "type": "FeatureCollection",
                "tableName": table,
                "features": [... features]
            };
        });

    return featureCollections;
}

/**
 * Prepare a GeoPackage instance from uint8Array
 * @param {object} uint8Array - The File Api object of the geopackage
 * @returns {object} - The GeoPackage database connection
    */
export async function prepareGPKG (uint8Array) {
    window.GeoPackage.setSqljsWasmLocateFile(file => "./resources/" + file);
    // create GeoPackage database connection
    const gpkg = await window.GeoPackage.GeoPackageAPI.open(uint8Array);

    return gpkg;
}

export default {
    isFileExtensionAccepted,
    isMimeTypeAccepted,
    readGeoJsonFile,
    readShapeZipFile,
    readGeoPackageFile
};
