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
 * Reads a GeoJSON file and returns its content as JSON.
 *
 * @param {File} file The GeoJSON file to read.
 * @returns {Object} The content of the file as JSON.
 */
export async function readGeoJsonFile (file) {
    const fileText = await file.text();

    return JSON.parse(fileText);
}

/**
 * Parses a zipped shapefile (File API object) and returns
 * GeoJSON file(s) as JSON.
 *
 * @param {File} file The zipped shapefile file to read.
 * @returns {Object[]} List of geojson objects.
 */
export async function readShapeZipFile (file) {
    const arrayBuffer = await file.arrayBuffer(),
        shape = await parseZip(arrayBuffer);

    if (Array.isArray(shape) && shape.length > 1 && shape.every(e => e.fileName === shape[0].fileName)) {
        console.warn("Warning: Shape file contains more than one layer with the same name.");
        return shape.map((e, index) => ({
            ...e,
            fileName: `${e.fileName}_${index}`
        }));
    }

    // always return array
    return !Array.isArray(shape) ? [shape] : shape;
}

/**
 * Reads a GeoPackage file and returns its content as GeoJSON.
 *
 * @param {File} file The GeoJSON file to read.
 * @param {string} resourcesPath - Path to the Sql.js wasm file.
 * @returns {Object} List of feature tables as GeoJSON FeatureCollections
 */
export async function readGeoPackageFile (file, resourcesPath) {
    // create array buffer
    const buffer = await file.arrayBuffer();
    // create Uint8Array
    const uint8Array = new Uint8Array(buffer);
    const gpkg = await prepareGPKG(uint8Array, resourcesPath);

    if (gpkg === null) {
        // abort file import
        return [];
    }

    // get tables
    const featureTables = gpkg.getFeatureTables();

    // iterate over feature tables, query features and store in feature collection
    const featureCollections = featureTables.map(table => {
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
 * @param {string} resourcesPath - Path to the Sql.js wasm file.
 * @returns {object} - The GeoPackage database connection
    */
export async function prepareGPKG (uint8Array, resourcesPath) {
    window.GeoPackage.setSqljsWasmLocateFile(file => resourcesPath + file);
    // create GeoPackage database connection
    const gpkg = await window.GeoPackage.GeoPackageAPI.open(uint8Array);
    const tables = gpkg.getFeatureTables();
    const projections = tables.map((tableName) => gpkg.getFeatureDao(tableName).projection);

    if (projections.some(proj => proj === null)) {
        console.error("The CRS information is missing in one or more GeoPackage tables. File import will be aborted.");
        return null;
    }

    return gpkg;
}

export default {
    isFileExtensionAccepted,
    isMimeTypeAccepted,
    readGeoJsonFile,
    readShapeZipFile,
    readGeoPackageFile
};
