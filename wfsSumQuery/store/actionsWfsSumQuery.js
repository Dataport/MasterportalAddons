import {fromCircle} from "ol/geom/Polygon";
import {Draw} from "ol/interaction.js";
import {Vector as VectorSource} from "ol/source.js";
import {Vector as VectorLayer} from "ol/layer.js";
import {Fill, Stroke, Style} from "ol/style.js";
import {Circle} from "ol/geom.js";
import Feature from "ol/Feature.js";
import store from "../../../src/app-store";
import layerCollection from "../../../src/core/layers/js/layerCollection";
import spatialSelection from "../../../src/modules/featureLister/js/getSpatialSelection.js";

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
 * Returns the right type based on the geometry type of the given feature. Does not support Line geometries.
 * @param {Feature} feature - feature from layer.
 * @returns {String} - the type for the highlightObject that is needed in the highlightFeature function.
 */
function assignTypeBasedOnFeature (feature) {
    const geomTypeSet = new Map(),
        geomType = feature.getGeometry().getType();

    geomTypeSet.set("POINT", "increase");
    geomTypeSet.set("POLYGON", "highlightPolygon");
    geomTypeSet.set("MULTIPOLYGON", "highlightMultiPolygon");

    if (!geomTypeSet.get(geomType.toUpperCase())) {
        console.warn("Highlighting not possible because geometry type is not supported.");
    }

    return geomTypeSet.get(geomType.toUpperCase())
        ? geomTypeSet.get(geomType.toUpperCase())
        : "NOT FOUND";
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
                        featurePrefix: layer.featurePrefix,
                        outputFormat: layer.outputFormat || "XML",
                        featureNS: layer.featureNS,
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

        let geomGeoJson = payload.geometry;

        if (payload.type === "circleFromPolygon") {
            const polygon = payload.geometry,
                coordinatesArray = polygon.getCoordinates()[0];

            geomGeoJson = {
                type: "Polygon",
                coordinates: [coordinatesArray]
            };
        }

        const selectedLayer = getters.layersForSelection.filter(layer => layer.id === getters.selectedLayerId)[0];

        const features = await spatialSelection.getSpatialSelection(geomGeoJson, selectedLayer, store.getters["Maps/projectionCode"], {dispatch, commit});

        if (!features || features.length === 0) {
            const infoContent = {
                category: "Info",
                displayClass: "info",
                content: i18next.t("additional:modules.wfsSumQuery.noFeatureFound", selectedLayer.name)
            };

            dispatch("Alerting/addSingleAlert", infoContent, {root: true});
            return;
        }
        const allSelectedFeatureProperties = [],
            uniqueTagNames = Object.keys(features[0].getProperties());

        features.forEach(feature => {
            const selectedFeature = {id: feature.getId(), ...feature.getProperties()};

            allSelectedFeatureProperties.push(selectedFeature);
        });

        if (features && features.length > 0) {
            commit("setUniqueAttributes", uniqueTagNames);
            commit("setAllSelectedFeatureProperties", allSelectedFeatureProperties);
        }

        if (uniqueTagNames.length === 0) {
            const infoContent = {
                category: "Info",
                displayClass: "info",
                content: i18next.t("additional:modules.wfsSumQuery.noAttributesFound", selectedLayer.name)
            };

            dispatch("Alerting/addSingleAlert", infoContent, {root: true});
        }
    },
    /**
     * Highlights the Features that were selected by graphical selection.
     * @param {object} context - The context of the store.
     * @param {object} visibleLayer - The Layer from which the features were selected from.
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
                    featureFromLayer = layerSource?.getFeatureById(featureId) || layerSource?.getFeatureById(`${visibleLayer.featureType}.${featureId}`);

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
