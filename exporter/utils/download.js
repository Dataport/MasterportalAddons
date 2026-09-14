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
 * Get the current project projection code.
 *
 * @returns {String} The projection code.
 */
function getProjectProjectionCode () {
    return mapCollection.getMap("2D")?.getView()?.getProjection()?.getCode() || "EPSG:4326";
}

/**
 * Resolve configured download projection for shp/gpkg exports.
 *
 * @param {String} downloadProjection The configured projection mode.
 * @returns {String} Projection code.
 */
function getConfiguredDownloadProjection (downloadProjection) {
    if ((/^EPSG:\d+$/i).test(downloadProjection)) {
        return downloadProjection;
    }

    return getProjectProjectionCode();
}

/**
 * Get numeric EPSG code from projection string.
 *
 * @param {String} projection Projection code.
 * @returns {Number|undefined} Numeric EPSG code.
 */
function getEpsgCode (projection) {
    const match = (/^EPSG:(\d+)$/i).exec(projection);

    return match ? Number(match[1]) : undefined;
}

/**
 * Get the configured projection definition for a projection code.
 *
 * @param {String} projection Projection code.
 * @returns {String|undefined} Projection definition.
 */
function getProjectionDefinition (projection) {
    const namedProjection = Config?.namedProjections?.find(([code]) => code === projection);

    return namedProjection?.[1];
}

/**
 * Project GeoJSON coordinates into the target projection.
 *
 * @param {Object} geojson The geojson object or data.
 * @param {String} sourceProjection Projection code of the incoming GeoJSON coordinates.
 * @param {String} targetProjection Projection code for the output GeoJSON coordinates.
 * @returns {Object} GeoJSON with coordinates in the target projection.
 */
function projectGeojson (geojson, sourceProjection, targetProjection) {
    const features = new GeoJSON().readFeatures(geojson, {
        dataProjection: sourceProjection,
        featureProjection: targetProjection
    });

    return new GeoJSON().writeFeaturesObject(features, {
        dataProjection: targetProjection,
        featureProjection: targetProjection
    });
}

/**
 * Normalize configured WKT text.
 *
 * @param {String|String[]} wkt The configured WKT value.
 * @returns {String|undefined} Normalized WKT text.
 */
function normalizeProjectionWkt (wkt) {
    if (Array.isArray(wkt)) {
        return wkt.join(",").replaceAll("'", "\"");
    }
    if (typeof wkt === "string") {
        return wkt.replaceAll("'", "\"");
    }

    return undefined;
}

/**
 * Create shapefile writer options for projection metadata.
 *
 * @param {String} projection Projection code.
 * @param {Object} projectionWkts WKT definitions by projection.
 * @returns {Object|undefined} Shapefile writer options.
 */
function getShapefileWriterOptions (projection, projectionWkts = {}) {
    const wkt = normalizeProjectionWkt(projectionWkts[projection]);

    return wkt ? {wkt} : undefined;
}

/**
 * Get extent from GeoJSON coordinates.
 *
 * @param {Object} geojson GeoJSON feature collection.
 * @returns {Number[]} Extent as [minX, minY, maxX, maxY].
 */
function getGeojsonExtent (geojson) {
    const extent = [Infinity, Infinity, -Infinity, -Infinity];

    geojson.features.forEach(feature => {
        updateExtent(extent, feature.geometry.coordinates);
    });

    return extent;
}

/**
 * Update extent recursively from GeoJSON coordinates.
 *
 * @param {Number[]} extent Extent as [minX, minY, maxX, maxY].
 * @param {Array} coordinates GeoJSON coordinate array.
 * @returns {void}
 */
function updateExtent (extent, coordinates) {
    if (typeof coordinates[0] === "number") {
        extent[0] = Math.min(extent[0], coordinates[0]);
        extent[1] = Math.min(extent[1], coordinates[1]);
        extent[2] = Math.max(extent[2], coordinates[0]);
        extent[3] = Math.max(extent[3], coordinates[1]);
        return;
    }

    coordinates.forEach(coordinate => updateExtent(extent, coordinate));
}

/**
 * Create a GeoPackage bounding box from GeoJSON data.
 *
 * @param {Object} geojson GeoJSON feature collection.
 * @returns {Object} GeoPackage bounding box.
 */
function createGeoPackageBoundingBox (geojson) {
    const [minX, minY, maxX, maxY] = getGeojsonExtent(geojson);

    return new window.GeoPackage.BoundingBox(minX, maxX, minY, maxY);
}

/**
 * Add a configured spatial reference system to a GeoPackage.
 *
 * @param {Object} gpkg The GeoPackage instance.
 * @param {String} projection Projection code.
 * @returns {Number|undefined} Spatial reference system id.
 */
function addSpatialReferenceSystem (gpkg, projection) {
    const epsgCode = getEpsgCode(projection),
        definition = getProjectionDefinition(projection);

    if (!epsgCode || !definition) {
        return undefined;
    }
    if (gpkg.spatialReferenceSystemDao.getBySrsId(epsgCode)) {
        return epsgCode;
    }

    const srs = new window.GeoPackage.SpatialReferenceSystem();

    srs.srs_name = projection;
    srs.srs_id = epsgCode;
    srs.organization = "EPSG";
    srs.organization_coordsys_id = epsgCode;
    srs.definition = definition;
    srs.description = projection;
    if (gpkg.spatialReferenceSystemDao.connection?.columnAndTableExists("gpkg_spatial_ref_sys", "definition_12_063")) {
        srs.definition_12_063 = definition;
    }
    gpkg.spatialReferenceSystemDao.create(srs);

    return epsgCode;
}

/**
 * Create a GeoPackage feature table with optional custom SRS.
 *
 * @param {Object} gpkg The GeoPackage instance.
 * @param {Object[]} tableProperties Table property definitions.
 * @param {String} projection Projection code.
 * @param {Object} geojson GeoJSON feature collection.
 * @returns {void}
 */
function createGeoPackageFeatureTable (gpkg, tableProperties, projection, geojson) {
    const srsId = addSpatialReferenceSystem(gpkg, projection);

    if (!srsId) {
        gpkg.createFeatureTableFromProperties("export", tableProperties);
        return;
    }

    const projectedGeojson = projectGeojson(geojson, "EPSG:4326", projection);
    const geometryColumns = new window.GeoPackage.GeometryColumns();

    geometryColumns.table_name = "export";
    geometryColumns.column_name = "geometry";
    geometryColumns.geometry_type_name = "GEOMETRY";
    geometryColumns.z = 0;
    geometryColumns.m = 0;

    gpkg.createFeatureTable(
        "export",
        geometryColumns,
        tableProperties,
        createGeoPackageBoundingBox(projectedGeojson),
        srsId
    );
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
 * @param {String} downloadProjection Optional download projection config.
 * @param {Object} projectionWkts WKT definitions by projection.
 * @param {String} sourceProjection Projection code of the incoming GeoJSON coordinates.
 * @returns {Promise<void>}
 */
async function handleFormatDownload (geojson, format, fileName, layerType, layerName, downloadProjection, projectionWkts = {}, sourceProjection = "EPSG:4326") {
    const exportProjection = getConfiguredDownloadProjection(downloadProjection);

    if (format === "shp") {
        const projectedGeojson = projectGeojson(geojson, sourceProjection, exportProjection);

        shpdownload(projectedGeojson, getShapefileWriterOptions(exportProjection, projectionWkts));
        return;
    }

    if (format === "gpkg") {
        const gpkg = await createGeoPackage(geojson, exportProjection);
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
 * @param {String} downloadProjection Optional download projection config.
 * @param {Object} projectionWkts WKT definitions by projection.
 * @returns {void}
 */
async function downloadVectorLayer (layer, format, downloadProjection, projectionWkts) {
    const fileEnding = getFileEndingForFormat(format),
        fileName = `${layer.name}.${fileEnding}`,
        features = layer.layer.getSource().getFeatures(),
        map = mapCollection.getMap("2D"),
        mapView = map.getView(),
        featureProjection = layer.epsg || layer.srsName || mapView.getProjection().getCode(),
        geojson = new GeoJSON().writeFeaturesObject(features, {featureProjection});

    await handleFormatDownload(geojson, format, fileName, layer.type, layer.name, downloadProjection, projectionWkts);
}

/**
 * Download a geojson layer.
 *
 * @param {Object} geoJsonLayer The geojson layer to download.
 * @param {String} format The requested output format.
 * @param {String} downloadProjection Optional download projection config.
 * @param {Object} projectionWkts WKT definitions by projection.
 * @returns {void}
 */
async function downloadGeoJsonLayer (geoJsonLayer, format, downloadProjection, projectionWkts) {
    const fileEnding = getFileEndingForFormat(format),
        fileName = `${geoJsonLayer.name}.${fileEnding}`,
        data = await fetchBlob(geoJsonLayer.url, "application/json");

    await handleFormatDownload(data, format, fileName, geoJsonLayer.type, geoJsonLayer.name, downloadProjection, projectionWkts);
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
    let blob;

    switch (outputFormat) {
        case EXPORTFORMATS.geoJson: {
            blob = new Blob([JSON.stringify(geojson)], {type: "application/geo+json"});
            break;
        }
        case EXPORTFORMATS.gml: {
            const features = new GeoJSON().readFeatures(geojson);
            const output = new GML32({featureNS, featureType, srsName: "EPSG:4326"}).writeFeatures(features);

            blob = new Blob([output], {type: "application/gml+xml; version=3.2"});
            break;
        }
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
    let blob;

    switch (outputFormat) {
        case EXPORTFORMATS.geoJson: {
            const features = formatter.readFeatures(gml);
            const output = new GeoJSON().writeFeatures(features);

            blob = new Blob([output], {type: "application/geo+json"});
            break;
        }
        case EXPORTFORMATS.gml: {
            blob = new Blob([gml], {type: gmlMime});
            break;
        }
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
 * @param {String} downloadProjection Optional download projection config.
 * @param {Object} projectionWkts WKT definitions by projection.
 * @returns {void}
 */
async function downloadWfsLayer (wfsLayer, format, downloadProjection, projectionWkts) {
    const url = new URL(wfsLayer.url);
    const fileEnding = getFileEndingForFormat(format);
    const fileName = `${wfsLayer.name}.${fileEnding}`;
    const typeNameString = getTypeNameStringFromServiceVersion(wfsLayer.version);
    const exportProjection = getConfiguredDownloadProjection(downloadProjection);
    const dataProjection = format === EXPORTFORMATS.shp
        ? getConfiguredDownloadProjection(downloadProjection)
        : "EPSG:4326";

    url.searchParams.append("service", "WFS");
    url.searchParams.append("request", "GetFeature");
    url.searchParams.append("version", wfsLayer.version);
    url.searchParams.append("srsName", dataProjection);
    url.searchParams.append(typeNameString, wfsLayer.featureType);

    const wfsData = await fetchData(url.toString());
    const wfsFormat = new WFS({version: wfsLayer.version});
    const projection = wfsFormat.readProjection(wfsData) ?? get(dataProjection);

    const proj = new Projection({
        code: projection.getCode(),
        axis: projection.getAxisOrientation()
    });

    // respect axis orientation from gml output to avoid flipped coordinates
    addEquivalentProjections([get(dataProjection), proj]);

    const features = wfsFormat.readFeatures(wfsData, {
        dataProjection: proj,
        featureProjection: dataProjection
    });
    const geojson = new GeoJSON().writeFeaturesObject(features, {
        dataProjection,
        featureProjection: dataProjection
    });
    const containsMultiPolygons = geojson.features.find(
        f => f.geometry.type.toLowerCase() === "multipolygon"
    );

    let blob;

    switch (format) {
        case "shp": {
            if (containsMultiPolygons) {
                const e = new Error();

                e.sender = "shapeUnsupportedMultiPolygon";
                throw e;
            }
            // download as zipped shapefile will be triggered automatically by this function
            shpdownload(geojson, getShapefileWriterOptions(dataProjection, projectionWkts));
            return;
        }
        case "gpkg": {
            const gpkg = await createGeoPackage(geojson, exportProjection);
            const gpkgBytes = await gpkg.export();

            blob = new Blob([gpkgBytes], {type: "octet/stream"});
            break;
        }
        default: {
            const gmlMime = getGmlMimeFromVersion(wfsLayer.version);

            blob = gmlToBlob(wfsData, format, wfsFormat, gmlMime);
            break;
        }
    }

    const blobUrl = URL.createObjectURL(blob);

    performDownload(blobUrl, fileName);
}

/**
 * Creates a temporary geopackage file in memory,
 * creates a feature table based on the input geojson properties
 * and adds the features of the input geojson to the table.
 * @param {object} geojson  - The geojson object to be exported.
 * @param {String} projection The GeoPackage projection.
 * @returns {object} - The geopackage object
 */
async function createGeoPackage (geojson, projection = "EPSG:4326") {
    // Filter feature properties to match only geopackage data types
    filterFeaturePropertiesForGpkg(geojson);
    // Add feature id to properties if not exists - needed to insert feature row
    geojson.features.forEach((ft, idx) => {
        if (!ft.properties.id) {
            ft.properties.id = idx;
        }
    });
    // Create and prepare geopackage
    const gpkg = await prepareGPKG(geojson.features[0].properties, projection, geojson);
    const tableName = "export";

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
 * @param {String} projection The GeoPackage projection.
 * @param {Object} geojson GeoJSON feature collection.
 * @returns {object} - The geopackage
 */
async function prepareGPKG (properties, projection, geojson) {
    // es-lint-disable-next-line no-undef
    window.GeoPackage.setSqljsWasmLocateFile(file => "./resources/" + file);
    // es-lint-disable-next-line no-undef
    const gpkg = await window.GeoPackage.GeoPackageAPI.create();
    const tableProperties = [];

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
    createGeoPackageFeatureTable(gpkg, tableProperties, projection, geojson);

    return gpkg;
}

/**
 * Download a layer based on the layer type and requested format.
 *
 * @param {Object} layer The layer to download.
 * @param {String} format The requested output format.
 * @param {String} downloadProjection Optional download projection config.
 * @param {Object} projectionWkts WKT definitions by projection.
 * @returns {void}
 */
export async function downloadLayer (layer, format, downloadProjection, projectionWkts = {}) {
    const layerDownloadMap = {
        [LAYERTYPES.geoJson]: downloadGeoJsonLayer,
        [LAYERTYPES.wfs]: downloadWfsLayer,
        [LAYERTYPES.draw]: downloadVectorLayer,
        [LAYERTYPES.vectorBase]: downloadVectorLayer
    };

    const downloadFn = layerDownloadMap[layer.type];

    if (downloadFn) {
        await downloadFn(layer, format, downloadProjection, projectionWkts);
    }
}

export default {
    downloadLayer
};
