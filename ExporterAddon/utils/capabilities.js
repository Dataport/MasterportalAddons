import axios from "axios";
import EXPORTFORMATS from "../constants/exportformats";
import LAYERTYPES from "../constants/layertypes";

/**
 * Fetch a capabilities document.
 *
 * @param {String} url The url to fetch.
 * @returns {String} The GetCapabilities document.
 */
export async function fetchCapabilities (url) {
    const response = await axios({
        method: "get",
        url: url,
        responseType: "text"
    });

    return response.data;
}

/**
 * Get the base Url from a url.
 *
 * @param {String} url The url to get the base from.
 * @returns {String} The base url.
 */
function getBaseUrl (url) {
    return url.split("?")[0];
}

/**
 * Get the version from the WFS Capabilities document.
 *
 * @param {String} capabilities The capabilities document.
 * @returns {String} The version string.
 */
function getVersionFromWFSCapabilities (capabilities) {
    const parser = new DOMParser(),
        cap = parser.parseFromString(capabilities, "text/xml");

    return cap.childNodes[0].getAttribute("version");
}

/**
 * Get the layers from a capabilities document.
 *
 * @param {String} url The capabilities url.
 * @param {String} serviceType The type of the service.
 * @returns {object[]} List of objects containing layer names and titles.
 */
export async function getLayersFromCapabilities (url) {
    const capabilitiesDoc = await fetchCapabilities(url),
        baseUrl = getBaseUrl(url),
        version = getVersionFromWFSCapabilities(capabilitiesDoc),
        layers = getLayerNamesFromWFSCapabilities(capabilitiesDoc)
            .map((layer, idx) => ({
                ...layer,
                idx,
                type: LAYERTYPES.wfs,
                url: baseUrl,
                version,
                exportFormats: [EXPORTFORMATS.geoJson, EXPORTFORMATS.gml, EXPORTFORMATS.shp, EXPORTFORMATS.gpkg]
            }));

    return layers;
}


/**
 * Get all layernames of a WFS GetCapabilities document.
 *
 * @param {String} capabilities The GetCapabilities XML as string.
 * @returns {Object[]} Array of objects containing title and name for each layer.
 */
function getLayerNamesFromWFSCapabilities (capabilities) {
    const parser = new DOMParser(),
        cap = parser.parseFromString(capabilities, "text/xml"),
        layerNames = [];

    cap.querySelectorAll("FeatureType").forEach(e => {
        const titleEl = e.querySelector("Title"),
            nameEl = e.querySelector("Name"),
            title = titleEl ? titleEl.textContent : undefined,
            name = nameEl ? nameEl.textContent : undefined;

        layerNames.push({
            name: title,
            featureType: name
        });
    });
    return layerNames;
}

export default {
    fetchCapabilities,
    getLayersFromCapabilities
};
