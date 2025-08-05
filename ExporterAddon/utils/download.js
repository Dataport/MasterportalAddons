import axios from "axios";
import {GeoJSON, WFS} from "ol/format";
import GML32 from "ol/format/GML32";
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
 * Download a draw layer.
 *
 * @param {Object} drawLayer The draw layer to download.
 * @param {String} format The requested output format.
 * @returns {void}
 */
async function downloadDrawLayer (drawLayer, format) {
    const fileEnding = getFileEndingForFormat(format),
        fileName = `${drawLayer.name}.${fileEnding}`,
        features = drawLayer.layer.getSource().getFeatures(),
        // NOTE: Draw feature projection is the same as of current mapview
        // As the mapview projection will not be changed in this project it is harcoded here
        featureProjection = "EPSG:25832",
        geojson = new GeoJSON().writeFeaturesObject(features, {
            featureProjection
        });
    let blob, gpkg, gpkgBytes;

    switch (format) {
        case "shp":
            // download as zipped shapefile will be triggered automatically by this function
            shpdownload(geojson);
            return;
        case "gpkg":
            gpkg = await createGeoPackage(geojson);
            gpkgBytes = await gpkg.export();

            blob = new Blob([gpkgBytes], {type: "octet/stream"});
            break;
        default:
            blob = olLayerToBlob(drawLayer.layer, format, drawLayer.type, drawLayer.name, drawLayer.srsName);
            break;
    }

    // eslint-disable-next-line one-var
    const url = URL.createObjectURL(blob);

    performDownload(url, fileName);
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
    let blob,
        gpkg,
        gpkgBytes;

    switch (format) {
        case "shp":
            // download as zipped shapefile will be triggered automatically by this function
            shpdownload(data);
            return;
        case "gpkg":
            gpkg = await createGeoPackage(data);
            gpkgBytes = await gpkg.export();

            blob = new Blob([gpkgBytes], {type: "octet/stream"});
            break;
        default:
            blob = geojsonToBlob(data, format, geoJsonLayer.type, geoJsonLayer.name);
            break;
    }
    // eslint-disable-next-line one-var
    const blobUrl = URL.createObjectURL(blob);

    performDownload(blobUrl, fileName);
}

/**
 * Get the file ending for a given format.
 *
 * @param {String} format The format to get the file ending for.
 * @returns {String} The file ending.
 */
function getFileEndingForFormat (format) {
    switch (format) {
        case EXPORTFORMATS.geoJson:
            return "json";
        case EXPORTFORMATS.gml:
            return "gml";
        case EXPORTFORMATS.shp:
            return "zip";
        case EXPORTFORMATS.gpkg:
            return "gpkg";
        default:
            return "";
    }
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

    let data;

    if (mimeType === "application/json") {
        data = await response.json();
    }
    else {
        data = await response.text();
    }

    return data;
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
    let typeNameString;

    switch (version) {
        case "1.0.0":
            typeNameString = "typeName";
            break;
        case "1.1.0":
            typeNameString = "typeName";
            break;
        case "1.1.3":
            typeNameString = "typeName";
            break;
        case "2.0.0":
            typeNameString = "typeNames";
            break;
        case "2.0.2":
            typeNameString = "typeNames";
            break;
        default:
            break;
    }

    return typeNameString;
}

/**
 * Get the gml mime type based on service version.
 *
 * @param {String} version The service version string.
 * @returns {String} The gml mime type.
 */
function getGmlMimeFromVersion (version) {
    let gmlMime;

    switch (version) {
        case "1.1.0":
            gmlMime = "text/xml; subtype=gml/3.1.1";
            break;
        case "1.1.3":
            gmlMime = "application/gml+xml; version=3.1";
            break;
        case "2.0.0":
            gmlMime = "application/gml+xml; version=3.2";
            break;
        // openlayers does not support wfs 2.0.2 yet
        // case "2.0.2":
        //     gmlMime = "application/gml+xml; version=3.2";
        //     break;
        default:
            break;
    }

    return gmlMime;
}

/**
 * Convert olLayer to blob.
 *
 * @param {any} olLayer olLayer to convert.
 * @param {String} outputFormat The requested output format.
 * @param {String} featureNS The feature namespace.
 * @param {String} featureType The feature type.
 * @param {String} srsName The srsName.
 * @returns {any} The blob.
 */
function olLayerToBlob (olLayer, outputFormat, featureNS, featureType, srsName) {
    const features = olLayer.getSource().getFeatures();
    let blob, output;

    switch (outputFormat) {
        case EXPORTFORMATS.geoJson:
            output = new GeoJSON().writeFeaturesObject(features);
            blob = new Blob([JSON.stringify(output)], {type: "application/geojson"});
            break;
        case EXPORTFORMATS.gml:
            // TODO provide current EPSG code here
            output = new GML32({featureNS, featureType, srsName}).writeFeatures(features);
            blob = new Blob([output], {type: "application/gml+xml; version=3.2"});
            break;
        default:
            break;
    }

    return blob;
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
 * @param {String} boundary The boundary to use.
 * @param {String} format The export format.
 * @returns {void}
 */
async function downloadWfsLayer (wfsLayer, boundary, format) {
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

    // eslint-disable-next-line one-var
    const wfsData = await fetchData(url.toString()),
        wfsFormat = new WFS({version: wfsLayer.version}),
        projection = wfsFormat.readProjection(wfsData),
        proj = new Projection({
            code: projection.getCode(),
            axis: projection.getAxisOrientation()
        });

    // respect axis orientation from gml output to avoid flipped coordinates
    addEquivalentProjections([get(dataProjection), proj]);
    // eslint-disable-next-line one-var
    const features = wfsFormat.readFeatures(wfsData, {
            proj
        }),
        geojson = new GeoJSON().writeFeaturesObject(features, {
            dataProjection
        }),
        containsMultiPolygons = geojson.features.find(
            f => f.geometry.type.toLowerCase() === "multipolygon");

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

    // eslint-disable-next-line one-var
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
 * Download a layer.
 *
 * @param {Object} layer The layer to download.
 * @param {String} boundary The type of boundary.
 * @param {String} format The export format.
 * @returns {void}
 */
export async function downloadLayer (layer, boundary, format) {
    switch (layer.type) {
        case LAYERTYPES.geoJson:
            await downloadGeoJsonLayer(layer, format);
            break;
        case LAYERTYPES.wfs:
            await downloadWfsLayer(layer, boundary, format);
            break;
        case LAYERTYPES.draw:
            downloadDrawLayer(layer, format);
            break;
        default:
            break;
    }
}

export default {
    downloadLayer
};
