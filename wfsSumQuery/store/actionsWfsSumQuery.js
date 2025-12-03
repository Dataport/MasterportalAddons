import {fromCircle} from "ol/geom/Polygon";
import {Draw} from "ol/interaction.js";
import {Vector as VectorSource} from "ol/source.js";
import {Vector as VectorLayer} from "ol/layer.js";
import {Fill, Stroke, Style} from "ol/style.js";
import {Circle} from "ol/geom.js";
import Feature from "ol/Feature.js";
import store from "../../../src/app-store";
import layerCollection from "../../../src/core/layers/js/layerCollection";

/**
 * Searches the portalConfig for the given key and value.
 * @param {Object} portalConfig - config that is to be searched
 * @param {String} key - addon attribute that helds the name
 * @param {Object} value - addon attribute that helds the value
 * @returns {Object} config for addon
 */
function searchForConfig (portalConfig, key, value) {
    if (portalConfig[key] === value) {
        return portalConfig;
    }
    for (const i in portalConfig) {
        if (typeof portalConfig[i] === "object") {
            const found = searchForConfig(portalConfig[i], key, value);

            if (found) {
                return found;
            }
        }
    }
    return null;
}

/**
 * Returns the right type based on the geometry type of the given feature.
 * @param {Feature} feature - feature from layer.
 * @returns {String} - the type for the highlightObject that is needed in the highlightFeature function.
 */
function assignTypeBasedOnFeature (feature) {
    const geomTypeSet = new Map(),
        geomType = feature.getGeometry().getType();

    geomTypeSet.set("POINT", "increase");
    geomTypeSet.set("LINESTRING", "highlightLine");
    geomTypeSet.set("POLYGON", "highlightPolygon");
    geomTypeSet.set("MULTIPOLYGON", "highlightMultiPolygon");

    if (!geomTypeSet.get(geomType.toUpperCase())) {
        console.warn("Highlighting not possible because geometry type is not supported.");
    }

    return geomTypeSet.get(geomType.toUpperCase())
        ? geomTypeSet.get(geomType.toUpperCase())
        : "NOT FOUND";
}
/**
 * Returns attributes from a 'Describe Feature Request' that has been cast to an xml doc.
 * @param {object} describeFeatureXmlDoc - xmlDoc
 * @param {String} featureType name of the layer
 * @param {*} server the server of the service
 * @returns {Object} attributes from the Layer
 */
function getAttributes (describeFeatureXmlDoc, featureType, server) {
    if (server === "qgis") {
        return getAttributesFromQGISLayer(describeFeatureXmlDoc, featureType);
    }
    return getAttributesFromDeegreeLayer(describeFeatureXmlDoc, featureType);

}
/**
 * Returns attributes from a 'Describe Feature Request' to a QGIS server that has been cast to an xml doc.
 * @param {object} describeFeatureXmlDoc - xmlDoc
 * @param {String} featureType - name of the layer
 * @returns  {Object} attributes from the Layer
 */
function getAttributesFromQGISLayer (describeFeatureXmlDoc, featureType) {
    const findLayerAttributes = describeFeatureXmlDoc.querySelector(`complexType[name="${featureType + "Type"}"]`);

    return findLayerAttributes?.getElementsByTagName("element");
}
/**
 * Returns attributes from a 'Describe Feature Request' to a deegree server that has been cast to an xml doc.
 * @param {object} describeFeatureXmlDoc - xmlDoc
 * @param {String} featureType - name of the layer
 * @returns  {Object} attributes from the Layer
 */
function getAttributesFromDeegreeLayer (describeFeatureXmlDoc, featureType) {
    const findLayerAttributes = describeFeatureXmlDoc.querySelector(`element[name="${featureType.replace("app:", "")}"]`);

    return findLayerAttributes?.getElementsByTagName("element") || [];
}

const actions = {

    getLayerForSelection ({commit}) {
        const portalConfig = store.getters?.portalConfig,
            wfsSumQueryConfig = searchForConfig(portalConfig, "type", "wfsSumQuery"),
            layersForSelection = [];

        let layerIdsForSelection = wfsSumQueryConfig?.layerIdsForSelection;

        if (layerIdsForSelection) {
            layerIdsForSelection = Array.isArray(layerIdsForSelection) ? layerIdsForSelection : [layerIdsForSelection];

            layerIdsForSelection.forEach(layerId => {
                const id = typeof layerId === "string" ? layerId : layerId.id,
                    layer = store.getters.allLayerConfigs.filter(l => l.id === id)[0];

                if (layer) {
                    layersForSelection.push({
                        id: id,
                        name: layer.name,
                        url: layer.url,
                        featureType: layer.featureType,
                        version: layer.version || "1.1.0",
                        typ: layer.typ,
                        layerFromConfig: layer,
                        server: layerId.type || "deegree"
                    });
                }
            });
        }
        commit("setLayersForSelection", layersForSelection);
    },

    /**
     * Fetches features from a WFS depending on a selection on the map.
     * @param {Object} context - The context of the store.
     * @param {Object} payload - The payload containing the geometry and type of the selection.
     * @returns {void} void
     */
    async fetchFeaturesFromSelection ({commit, dispatch, getters, state}, payload) {
        // extra check needed because action is also triggered with type circleFromPolygon from graphicalSelect for polygon selection
        if (payload.type === "circleFromPolygon" && !state.definedCircle) {
            return;
        }

        let drawnGeometry, coordinatesArray,
            polygon, uniqueTagNames;

        if (payload.type === "circleFromPolygon") {
            polygon = payload.geometry;
            coordinatesArray = polygon.getCoordinates()[0];
        }
        else if (payload.type === "polygonFromGraphicalSelect") {
            drawnGeometry = JSON.stringify(payload.geometry);
            coordinatesArray = JSON.parse(drawnGeometry).coordinates[0];
        }

        const selectedLayer = getters.layersForSelection.filter(layer => layer.id === getters.selectedLayerId)[0],
            featureType = selectedLayer.featureType,
            epsg = store.getters["Maps/projectionCode"].split(":")[1],
            service = selectedLayer.url,
            version = selectedLayer.version,
            coordinates = coordinatesArray.map(coord => coord.join(",")).join(" "),
            questionMarkOrAmpersand = service.includes("?MAP=") ? "&" : "?",
            body =
                `<wfs:GetFeature xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
                xsi:schemaLocation="http://www.opengis.net/wfs" 
                xmlns:gml="http://www.opengis.net/gml" 
                xmlns:wfs="http://www.opengis.net/wfs" 
                xmlns:ogc="http://www.opengis.net/ogc" 
                service="WFS" version="${version}"> 
                <wfs:Query typeName="${featureType}"> 
                <ogc:Filter><ogc:Intersects><ogc:PropertyName>app:geom</ogc:PropertyName>
                <gml:Polygon srsName="http://www.opengis.net/gml/srs/epsg.xml#${epsg}">
                <gml:outerBoundaryIs><gml:LinearRing>
                <gml:coordinates>${coordinates}</gml:coordinates>
                </gml:LinearRing></gml:outerBoundaryIs>
                </gml:Polygon></ogc:Intersects></ogc:Filter></wfs:Query></wfs:GetFeature>`,
            response = await fetch(`${service}${questionMarkOrAmpersand}REQUEST=GetFeature&TYPENAME=${featureType}&SERVICE=WFS&VERSION=${version}`, {
                method: "POST",
                headers: {
                    "Content-Type": "text/xml"
                },
                body: body
            }),
            text = await response.text(),
            parser = new DOMParser(),
            xmlDoc = parser.parseFromString(text, "text/xml"),
            isQGIS = selectedLayer.server === "qgis",
            prefix = isQGIS ? "qgs:" : "",
            features = xmlDoc.getElementsByTagName(prefix + featureType),
            tagNames = [],
            allSelectedFeatureProperties = [],
            describeFeatureResponse = await fetch(`${service}${questionMarkOrAmpersand}service=WFS&version=${version}&request=DescribeFeatureType&typeName=${featureType}`),
            describeFeatureText = await describeFeatureResponse.text(),
            describeFeatureXmlDoc = parser.parseFromString(describeFeatureText, "text/xml"),
            elements = getAttributes(describeFeatureXmlDoc, featureType, selectedLayer.server);

        for (let i = 0; i < elements.length; i++) {
            const attribute = elements[i].getAttribute("name");

            tagNames.push(attribute);
        }

        uniqueTagNames = new Set(tagNames);
        uniqueTagNames = [...uniqueTagNames];
        uniqueTagNames = uniqueTagNames.filter(tagName => tagName !== "geom" && tagName !== "geometry");

        commit("setUniqueAttributes", uniqueTagNames);
        commit("setFeatureType", featureType);

        features.forEach(feature => {
            const selectedFeatureProperty = {id: feature.getAttribute("gml:id")};

            uniqueTagNames.forEach(tagName => {
                const prefixForAttributes = isQGIS ? prefix : "app:",
                    tagNameWithPrefix = prefixForAttributes + tagName;

                if (feature.getElementsByTagName(tagNameWithPrefix)[0]) {
                    selectedFeatureProperty[tagName] = feature.getElementsByTagName(tagNameWithPrefix)[0].textContent;
                }
            });
            allSelectedFeatureProperties.push(selectedFeatureProperty);
        });

        commit("setAllSelectedFeatureProperties", allSelectedFeatureProperties);

        if (uniqueTagNames.length === 0 || allSelectedFeatureProperties.length === 0) {
            const messageKey = uniqueTagNames.length === 0
                    ? "noAttributesFound" : "noFeatureFound",
                options = selectedLayer.name,
                infoContent = {
                    category: "Info",
                    displayClass: "info",
                    content: i18next.t(`additional:modules.wfsSumQuery.${messageKey}`, options)
                };

            dispatch("Alerting/addSingleAlert", infoContent, {root: true});
        }
    },
    /**
     * Highlights the Features that were selected by graphical selection.
     * @param {object} context - The context of the store.
     * @param {object} visibleLayer - The Layer from which the features were selected from.
     * @param {String} featureType - The Layer name
     * @returns {void}
     */
    highlightFeaturesFromSelection ({dispatch, getters, state}, visibleLayer) {
        if (visibleLayer && !visibleLayer.styleId) {
            console.warn("Highlighting not possible because no styleId detected. Please check your config.");
            return;
        }

        getters.allSelectedFeatureProperties.forEach(
            feature => {
                const featureId = feature.id,
                    layerSource = layerCollection.getLayerById(visibleLayer.id)?.layerSource,
                    featureFromLayer = layerSource?.getFeatureById(featureId) || layerSource?.getFeatureById(`${getters.featureType}.${featureId}`);

                if (featureFromLayer) {
                    const geometryType = featureFromLayer?.getGeometry().getType().toUpperCase(),
                        isPolygon = geometryType === "POLYGON" || geometryType === "MULTIPOLYGON",
                        highlightObject = {
                            type: assignTypeBasedOnFeature(featureFromLayer),
                            feature: featureFromLayer,
                            styleId: visibleLayer.styleId,
                            highlightStyle: isPolygon
                                ? state.highlightVectorRulesPolygon
                                : state.highlightVectorRulesPointLine
                        };

                    dispatch("Maps/highlightFeature", highlightObject, {root: true});
                }
            });
    },
    /**
     *  Removes highlighting style from features when deselected.
     * @param {object} context - The context of the store.
     * @returns {void}
     */
    removeHighlightingWhenDeselected ({dispatch}) {
        dispatch("Maps/removeHighlightFeature", "removeHighlight", {root: true});
    },

    /**
     * Creates a draw interaction to draw a circle on the map, retrieves features from the selection, and dispatches to update the store.
     * @param {Object} context - The context of the store.
     * @param {Object} layer - layer.
     * @param {Function} context.dispatch - The method to dispatch an action in the Vuex store.
     * @returns {void}
     */
    createDrawInteraction ({commit, dispatch, state}) {
        let payload;
        const map = mapCollection.getMap("2D"),
            existingInteraction = map.getInteractions().getArray().find(interaction => {
                return interaction instanceof Draw;
            }),
            source = new VectorSource({wrapX: false}),
            vector = new VectorLayer({
                source: source,
                name: "definedCircleWfsSumQuery",
                zIndex: 99999999999 // set zIndex so circle is on top
            }),

            interaction = new Draw({
                source: vector.getSource(),
                type: "Point",
                name: "wfsSumQueryInteraction",
                id: "wfsSumQueryInteraction"
            });

        if (existingInteraction) {
            return;
        }

        dispatch("Maps/addInteraction", interaction, {root: true});

        interaction.on("drawstart", () => {
            commit("setNewDrawend", false);
        });

        interaction.on("drawend", (event) => {
            const circleRadius = state.circleRadius,
                circleGeometry = new Circle(event.feature.getGeometry().getCoordinates(), circleRadius),
                circlePolygon = fromCircle(circleGeometry, 100),
                circleFeature = new Feature({
                    geometry: circlePolygon
                }),
                circleStyle = new Style({
                    fill: new Fill({
                        color: "rgba(255, 255, 255, 0.2)"
                    }),
                    stroke: new Stroke({
                        color: "rgb(84, 169, 210)",
                        width: 2
                    })
                }),
                existingLayer = map.getLayers().getArray().find(l => l.get("name") === "definedCircleWfsSumQuery");

            source.clear();
            circleFeature.setStyle(circleStyle);
            source.addFeature(circleFeature);

            if (!existingLayer) {
                dispatch("Maps/addLayer", vector, {root: true});
            }

            payload = {geometry: circleFeature.getGeometry(), type: "circleFromPolygon"};
            dispatch("fetchFeaturesFromSelection", payload);
            commit("setNewDrawend", true);
        });
    },
    /**
     * Removes the layer representing the defined circle from the map and sets the circle radius to zero in the store.
     * @returns {void}
     */
    removeDefinedCircleLayer () {
        const map = mapCollection.getMap("2D"),
            layer = map.getLayers().getArray().find(l => l.get("name") === "definedCircleWfsSumQuery");

        map.removeLayer(layer);
    }
};

export default actions;
