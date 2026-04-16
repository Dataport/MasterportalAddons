import axios from "axios";
import {GeoJSON, WFS} from "ol/format";
import GML32 from "ol/format/GML32";
import {parse} from 'ol/xml.js';
import {Projection, addEquivalentProjections, get} from "ol/proj";
import {download as shpdownload} from "@crmackey/shp-write";

import EXPORTFORMATS from "../constants/exportformats";
import LAYERTYPES from "../constants/layertypes";
import GEOPACKAGEDATATYPE from "../constants/geoPackageDataTypes";

/**
 * Performs a download.
 *
 * @param {String} url The url to download from.
 * @param {String} fileName The filename of the download.
 * @returns {void}
 */
function performDownload (url, fileName) {
    const anchor = document.createElement("a");

    anchor.setAttribute("href", url);
    anchor.setAttribute("download", fileName);
    anchor.click();
    anchor.remove();
}

/**
 * Handle format-specific download logic.
 * Converts geojson to the requested format and performs download.
 *
 * @param {Object} geojson The geojson object or data.
 * @param {String} format The export format.
 * @param {String} fileName The filename for download.
 * @param {String} layerType The layer type (for blob conversion).
 * @param {String} layerName The layer name (for blob conversion).
 * @returns {Promise<void>}
 */
async function handleFormatDownload (geojson, format, fileName, layerType, layerName) {
    if (format === "shp") {
        shpdownload(geojson);
        return;
    }

    if (format === "gpkg") {
        const gpkg = await createGeoPackage(geojson);
        const gpkgBytes = await gpkg.export();
        const blob = new Blob([gpkgBytes], {type: "octet/stream"});
        const url = URL.createObjectURL(blob);

        performDownload(url, fileName);
        return;
    }

    const blob = geojsonToBlob(geojson, format, layerType, layerName);
    const url = URL.createObjectURL(blob);

    performDownload(url, fileName);
}

/**
 * Download a vector layer (draw or vector base layer).
 *
 * @param {Object} layer The vector layer to download (draw or vectorBase type).
 * @param {String} format The requested output format.
 * @returns {void}
 */
async function downloadVectorLayer (layer, format) {
    const fileEnding = getFileEndingForFormat(format),
        fileName = `${layer.name}.${fileEnding}`,
        features = layer.layer.getSource().getFeatures(),
        map = mapCollection.getMap("2D"),
        mapView = map.getView(),
        featureProjection = layer.epsg || layer.srsName || mapView.getProjection().getCode(),
        geojson = new GeoJSON().writeFeaturesObject(features, {featureProjection});

    await handleFormatDownload(geojson, format, fileName, layer.type, layer.name);
}

/**
 * Download a geojson layer.
 *
 * @param {Object} geoJsonLayer The geojson layer to download.
 * @param {String} format The requested output format.
 * @returns {void}
 */
async function downloadGeoJsonLayer (geoJsonLayer, format) {
    const fileEnding = getFileEndingForFormat(format),
        fileName = `${geoJsonLayer.name}.${fileEnding}`,
        data = await fetchBlob(geoJsonLayer.url, "application/json");

    await handleFormatDownload(data, format, fileName, geoJsonLayer.type, geoJsonLayer.name);
}

/**
 * Get the file ending for a given format.
 *
 * @param {String} format The format to get the file ending for.
 * @returns {String} The file ending.
 */
function getFileEndingForFormat (format) {
    const fileEndings = {
        [EXPORTFORMATS.geoJson]: "json",
        [EXPORTFORMATS.gml]: "gml",
        [EXPORTFORMATS.shp]: "zip",
        [EXPORTFORMATS.gpkg]: "gpkg"
    };

    return fileEndings[format] || "";
}

/**
 * Fetch data from a blob.
 *
 * This is needed to circumvent the proxying used by axios. This makes blobUrl requests fail.
 * @param {String} blobUrl The url of the blob.
 * @param {String} mimeType The mimeType of the content.
 * @returns {any} The fetched data.
 */
async function fetchBlob (blobUrl, mimeType) {
    const response = await fetch(blobUrl, {
        headers: {
            "Content-Type": mimeType
        }
    });

    return mimeType === "application/json" ? response.json() : response.text();
}

/**
 * Fetch data from url.
 *
 * @param {String} url The url to fetch from.
 * @returns {object} The fetched data.
 */
async function fetchData (url) {
    const response = await axios({
        method: "get",
        url: url,
        responseType: "text"
    });

    return response.data;
}

/**
 * Retuns the name of the typeName parameter based on service version.
 *
 * @param {String} version The service version.
 * @returns {String} The name of the TypeName parameter;
 */
function getTypeNameStringFromServiceVersion (version) {
    const typeNameMap = {
        "1.0.0": "typeName",
        "1.1.0": "typeName",
        "1.1.3": "typeName",
        "2.0.0": "typeNames",
        "2.0.2": "typeNames"
    };

    return typeNameMap[version];
}

/**
 * Get the gml mime type based on service version.
 *
 * @param {String} version The service version string.
 * @returns {String} The gml mime type.
 */
function getGmlMimeFromVersion (version) {
    const gmlMimeMap = {
        "1.1.0": "text/xml; subtype=gml/3.1.1",
        "1.1.3": "application/gml+xml; version=3.1",
        "2.0.0": "application/gml+xml; version=3.2"
    };

    return gmlMimeMap[version];
}

/**
 * Convert geojson to blob.
 *
 * @param {Object} geojson The geojson.
 * @param {String} outputFormat The requested output format.
 * @param {String} featureNS The feature namespace.
 * @param {String} featureType The feature type.
 * @returns {any} The blob.
 */
function geojsonToBlob (geojson, outputFormat, featureNS, featureType) {
    let blob, features, output;

    switch (outputFormat) {
        case EXPORTFORMATS.geoJson:
            blob = new Blob([JSON.stringify(geojson)], {type: "application/geo+json"});
            break;
        case EXPORTFORMATS.gml:
            features = new GeoJSON().readFeatures(geojson);
            output = new GML32({featureNS, featureType, srsName: "EPSG:4326"}).writeFeatures(features);
            blob = new Blob([output], {type: "application/gml+xml; version=3.2"});
            break;
        default:
            break;
    }

    return blob;
}

/**
 * Convert gml to blob.
 *
 * @param {String} gml The gml.
 * @param {String} outputFormat The requested output format.
 * @param {GeoJSON|GML31|GML32} formatter The formatter.
 * @param {String} gmlMime The gml mimeType.
 * @returns {any} The blob.
 */
function gmlToBlob (gml, outputFormat, formatter, gmlMime) {
    let blob, output, features;

    switch (outputFormat) {
        case EXPORTFORMATS.geoJson:
            features = formatter.readFeatures(gml);
            output = new GeoJSON().writeFeatures(features);
            blob = new Blob([output], {type: "application/geo+json"});
            break;
        case EXPORTFORMATS.gml:
            blob = new Blob([gml], {type: gmlMime});
            break;
        default:
            break;
    }

    return blob;
}

/**
 * Download a wfs layer.
 *
 * @param {Object} wfsLayer The wfs layer to download.
 * @param {String} format The export format.
 * @returns {void}
 */
async function downloadWfsLayer (wfsLayer, format) {
    const url = new URL(wfsLayer.url),
        fileEnding = getFileEndingForFormat(format),
        fileName = `${wfsLayer.name}.${fileEnding}`,
        typeNameString = getTypeNameStringFromServiceVersion(wfsLayer.version),
        dataProjection = "EPSG:4326";

    url.searchParams.append("service", "WFS");
    url.searchParams.append("request", "GetFeature");
    url.searchParams.append("version", wfsLayer.version);
    url.searchParams.append("srsName", dataProjection);
    url.searchParams.append(typeNameString, wfsLayer.featureType);

    const wfsData = await fetchData(url.toString()),
        wfsFormat = new WFS({version: wfsLayer.version}),
        projection = wfsFormat.readProjection(wfsData);

    let code = "";

    if (!projection && wfsData && typeof wfsData === "string") {
        const doc = parse(wfsData),
            elementsWithSrs = doc.querySelectorAll("[srsName]");

        Array.from(elementsWithSrs).some(el => {
            const srsName = el.getAttribute("srsName");

            if (srsName) {
                const match = srsName.match(/epsg.*[#\/](\d+)/i);

                if (match) {
                    code = "EPSG:" + match[1];
                    return true;
                }
            }

            return false;
        });
    }

    const proj = new Projection({
        code: projection ? projection.getCode() : code,
        axis: projection ? projection.getAxisOrientation() : "neu"
    });

    // respect axis orientation from gml output to avoid flipped coordinates
    addEquivalentProjections([get(dataProjection), proj]);
    const features = wfsFormat.readFeatures(wfsData, {
            proj
        }),
        geojson = new GeoJSON().writeFeaturesObject(features, {
            dataProjection
        }),
        containsMultiPolygons = geojson.features.find(
            f => f.geometry?.type.toLowerCase() === "multipolygon");

    let blob, gpkg, gpkgBytes, gmlMime;

    switch (format) {
        case "shp":
            if (containsMultiPolygons) {
                const e = new Error();

                e.sender = "shapeUnsupportedMultiPolygon";
                throw e;
            }
            // download as zipped shapefile will be triggered automatically by this function
            shpdownload(geojson);
            return;
        case "gpkg":
            gpkg = await createGeoPackage(geojson);
            gpkgBytes = await gpkg.export();

            blob = new Blob([gpkgBytes], {type: "octet/stream"});
            break;
        default:
            gmlMime = getGmlMimeFromVersion(wfsLayer.version);

            blob = gmlToBlob(wfsData, format, wfsFormat, gmlMime);
            break;
    }

    const blobUrl = URL.createObjectURL(blob);

    performDownload(blobUrl, fileName);
}

/**
 * Creates a temporary geopackage file in memory,
 * creates a feature table based on the input geojson properties
 * and adds the features of the input geojson to the table.
 * @param {object} geojson  - The geojson object to be exported.
 * @returns {object} - The geopackage object
 */
async function createGeoPackage (geojson) {
    // Filter feature properties to match only geopackage data types
    filterFeaturePropertiesForGpkg(geojson);
    // Add feature id to properties if not exists - needed to insert feature row
    geojson.features.forEach((ft, idx) => {
        if (!ft.properties.id) {
            ft.properties.id = idx;
        }
    });
    // Create and prepare geopackage
    // es-lint-disable-next-line one-var
    const gpkg = await prepareGPKG(geojson.features[0].properties),
        tableName = "export";

    // add features to feature table
    await gpkg.addGeoJSONFeaturesToGeoPackage(
        geojson.features,
        tableName
    );

    return gpkg;
}

/**
 * Filter feature properties for a geojson object in place
 * to enable import to a geopackage feature table
 * @param {object} geojson - The geojson object to be filtered
 * @returns {void}
 */
function filterFeaturePropertiesForGpkg (geojson) {
    geojson.features.filter(feature => {
        for (const [key, value] of Object.entries(feature.properties)) {
            // delete property if type is not supported (e.g. this applies for ol style objects)
            if (!GEOPACKAGEDATATYPE[typeof value]) {
                delete feature.properties[key];
            }
        }
        return true;
    });
}

/**
 * Prepare a GeoPackage instance from input properties
 * @param {object} properties - The properties for the table data columns
 * @returns {object} - The geopackage
 */
async function prepareGPKG (properties) {
    // es-lint-disable-next-line no-undef
    window.GeoPackage.setSqljsWasmLocateFile(file => "./resources/" + file);
    // es-lint-disable-next-line no-undef
    const gpkg = await window.GeoPackage.GeoPackageAPI.create(),
        tableProperties = [];

    // create new Feature Column from properties
    for (const [key, value] of Object.entries(properties)) {
        const dataType = GEOPACKAGEDATATYPE[typeof value];

        // skip property id and geometry since they will be created automatically
        if (key.toLowerCase() === "id" || key.toLowerCase() === "geometry") {
            continue;
        }
        tableProperties.push({"name": key, "dataType": dataType});
    }

    // create new feature table from properties
    await gpkg.createFeatureTableFromProperties("export", tableProperties);

    return gpkg;
}

/**
 * Download a layer based on the layer type and requested format.
 *
 * @param {Object} layer The layer to download.
 * @param {String} format The requested output format.
 * @returns {void}
 */
export async function downloadLayer (layer, format) {
    const layerDownloadMap = {
        [LAYERTYPES.geoJson]: downloadGeoJsonLayer,
        [LAYERTYPES.wfs]: downloadWfsLayer,
        [LAYERTYPES.draw]: downloadVectorLayer,
        [LAYERTYPES.vectorBase]: downloadVectorLayer
    };

    const downloadFn = layerDownloadMap[layer.type];

    if (downloadFn) {
        await downloadFn(layer, format);
    }
}

export default {
    downloadLayer
};
