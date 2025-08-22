import WFS from "ol/format/WFS";
import {intersects, or} from "ol/format/filter";

/**
 * Sends a WFS request to the specified layer (targetLayer) with the given filter (filterLayer).
 * Returns the features that intersect with the geometries from the filter layer.
 * @param {Object} targetLayer - The target layer to query.
 * @param {Object} filterLayer - The filter layer to apply.
 * @returns {Promise<Array>} - A promise that resolves to an array of features.
 */
async function filterFeaturesByGeometry (targetLayer, filterLayer) {
    try {
        const filterFeatures = filterLayer.layerSource.getFeatures(),
            coordinates = filterFeatures.map(feature => feature.getGeometry()),

            service = targetLayer.attributes.url,
            featureType = targetLayer.attributes.featureType,
            featureNS = targetLayer.attributes.featureNS,
            featurePrefix = targetLayer.attributes.prefix,
            geometryName = targetLayer.layerSource.getFeatures()[0].getGeometryName() || "geom",
            epsg = mapCollection.getMap("2D").getView().getProjection().getCode(),
            filters = coordinates.map(geometry => intersects(geometryName, geometry)),
            combinedFilter = or(...filters),

            wfsFormat = new WFS(),
            node = wfsFormat.writeGetFeature({
                srsName: epsg,
                featureNS: featureNS,
                featurePrefix: featurePrefix,
                featureTypes: [featureType],
                filter: combinedFilter
            }),
            serializer = new XMLSerializer(),
            body = serializer.serializeToString(node),

            response = await fetch(service, {
                method: "POST",
                headers: {
                    "Content-Type": "text/xml"
                },
                body: body,
                credentials: targetLayer.attributes.isSecured ? "include" : "omit"
            });

        let responseText = "";

        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        responseText = await response.text();

        return wfsFormat.readFeatures(responseText, {
            dataProjection: epsg,
            featureProjection: epsg
        });
    }
    catch (error) {
        console.error("Error during WFS Filter request:", error);
        throw error;
    }
}

export default filterFeaturesByGeometry;
