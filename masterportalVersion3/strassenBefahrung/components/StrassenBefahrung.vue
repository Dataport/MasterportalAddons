<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersStrassenBefahrung";
import mutations from "../store/mutationsStrassenBefahrung";
import Feature from "ol/Feature.js";
import Point from "ol/geom/Point.js";
import {Pointer} from "ol/interaction.js";
import {GeoJSON} from "ol/format.js";
import store from "../../../src/app-store";
import styleList from "@masterportal/masterportalapi/src/vectorStyle/styleList";
import createStyle from "@masterportal/masterportalapi/src/vectorStyle/createStyle";
import {useScriptTag} from '@vueuse/core'

export default {
    name: "StrassenBefahrung",
    data() {
        return {
            loading: false,
            startInitInfra3d: false
        };
    },
    computed: {
        ...mapGetters("Modules/StrassenBefahrung", Object.keys(getters)),
        ...mapGetters("Maps", ["clickCoordinate", "center"])
    },
    beforeCreate() {
        useScriptTag("https://infra3d.ch/latest/api/js/infra3dapi.js", () => {
            this.startInitInfra3d = true;
            console.log("Infra3D API script loaded successfully.");
        });
    },
    watch: {
        async startInitInfra3d(newValue) {
            if (newValue) {
                this.applyTranslationKey(this.name);
                this.createEnnLayer();
                await this.createMarkerLayer();
                this.hideMarker();
                this.styleFeature();
                this.initInfra3d();
                this.startInitInfra3d = false;
                this.createInteraction();
            }
        },
    },
    unmounted() {
        this.hideMarker();
    },
    methods: {
        ...mapActions("Maps", {
            addInteractionToMap: "addInteraction",
            removeInteractionFromMap: "removeInteraction",
            addNewLayerIfNotExists: "addNewLayerIfNotExists"
        }),
        ...mapMutations("Modules/StrassenBefahrung", Object.keys(mutations)),
        /**
         * Creates a Layer for the edge-node-network.
         * @returns {void}
         */
        createEnnLayer() {
            if (this.loadEdgeNodeNetwork) {
                store.dispatch("Maps/addNewLayerIfNotExists", "strassenBefahrung_enn").then(layer => {
                    this.setEnnLayer(layer);
                })
            }
        },
        /**
         * Creates a Layer for the marker.
         * Sets the style on the feature.
         * @returns {void}
         */
        async createMarkerLayer() {
            this.setCoords(this.center);

            const feature = new Feature({
                geometry: new Point(this.coords)
            });

            const layer = await this.addNewLayerIfNotExists("strassenBefahrung")

            layer.getSource().addFeature(feature);
            this.setMarkerLayer(layer);
            this.styleFeature();
        },
        styleFeature() {
            if (this.markerLayer) {
                const layer = this.markerLayer;
                const feature = layer.getSource ? layer.getSource().getFeatures()[0] : undefined;
                const oldStyle = feature ? feature.getStyle() : undefined;
                const oldImage = oldStyle ? oldStyle.getImage() : null;
                const rotation = oldImage ? oldImage.getRotation() : null;
                const styleObject = styleList.returnStyleObject(this.markerStyleId);

                let newStyle,
                    newImage;

                if (styleObject && feature) {
                    const theStyle = createStyle.createStyle(styleObject, feature, false, Config.wfsImgPath);
                    if (typeof feature?.setStyle !== "function") {
                        return;
                    }
                    feature.setStyle(theStyle);

                    if (rotation) {
                        newStyle = feature.getStyle() || null;
                        newImage = newStyle ? newStyle.getImage() : null;
                        newImage.setRotation(rotation);
                    }
                }
            } else {
                console.error("styleFeature: markerLayer is null!");
            }
        },
        initInfra3d: function () {
            const infra3d = window.infra3d,
                divId = "infra3d-div",
                url = "https://client-v3.infra3d.ch",
                coord = this.coords,
                options = {
                    easting: coord[0],
                    northing: coord[1],
                    epsg: this.epsg,
                    lang: "de",
                    map: false,
                    buttons: [],
                    layer: false,
                    navigation: true,
                    loginurl: "https://auth.infra3d.ch/api/v1/login"
                };

            if (this.user !== "" && this.password !== "") {
                options.credentials = [this.user, this.password];
            }
            if (infra3d) {
                this.loading = true;
                infra3d.init(divId, url, options, this.infra3dInitialized, this);
                this.setMarker(coord);
                this.loading = false;
            } else {
                console.error("Infra3D is not loaded!");
            }
        },
        /**
         * Callback function if infra3d initialized. Listens to positionChanged of API.
         * @returns {void}
         */
        infra3dInitialized() {
            if (this.loadEdgeNodeNetwork) {
                this.getEnn();
            }
            this.setOnPositionChanged();
        },

        /**
         * Gets the edge-node-network and fills the ennLayer.
         * @returns {void}
         */
        getEnn() {
            // const mapView = this.map.getView(),
            //     mapSize = this.map.getSize(),
            //     currentExtent = mapView.calculateExtent(mapSize);
            // console.log(currentExtent);
            this.loading = true;
            window.infra3d.getEnn(this.epsgNumber, function (enn) {
                this.createEdgeNodeNetworkLayer(enn);
            }, this);
        },
        setOnPositionChanged() {
            window.infra3d.setOnPositionChanged(function (easting, northing, height, epsg, orientation) {
                console.log('setOnPositionChanged (easting, northing, height, epsg, orientation): ' + easting + ', ' + northing + ', ' + height + ', ' + epsg + ', ' + orientation);
                this.showMarker([easting, northing, height], orientation);
            }, this);
        },

        /**
         * Fills the ennLayer with the features from the GeoJSON.
         * @param {JSON} json Enn as GeoJSON.
         * @returns {void}
         */
        createEdgeNodeNetworkLayer(json) {
            const layer = this.ennLayer,
                source = layer.getSource(),
                formatJSON = new GeoJSON(),
                features = formatJSON.readFeatures(json),
                // styleModel = Radio.request("StyleList", "returnModelById", this.ennStyleId);
                styleObject = styleList.returnStyleObject(this.ennStyleId);

            if (styleObject && features[0]) {
                // layer.setStyle(styleModel.createStyle(features[0], false));
                const theStyle = createStyle.createStyle(styleObject, features[0], false, Config.wfsImgPath);
                layer.setStyle(theStyle);
            }
            this.clearEnnLayer();
            source.addFeatures(features);
            this.loading = false;
        },
        /**
         * Clears the edge-node-network layer.
         * @returns {void}
         */
        clearEnnLayer() {
            this.ennLayer.getSource().clear();
        },
        setMarker(coord) {
            this.showMarker(coord);
            store.dispatch("Maps/setCenter", coord);
            // this.removeInteraction();
        },
        showMarker(coord, orientation) {

            if (this.markerLayer) {
                const feature = this.markerLayer.getSource()?.getFeatures()[0];
                const style = feature?.getStyle();
                const image = style ? style.getImage() : null;

                let rotationInRad;

                this.markerLayer.setVisible(true);

                feature.getGeometry().setCoordinates(coord);
                if (orientation && image) {
                    rotationInRad = orientation * Math.PI / 180;
                    image.setRotation(rotationInRad);
                }
                this.setCoords(coord);
            }
        },
        hideMarker() {
            console.log(this.markerLayer)
            if (this.markerLayer && this.markerLayer.setVisible) {
                this.markerLayer.setVisible(false);
            }
        },
        /**
         * Adds interaction pointermove to map.
         * @returns {void}
         */
        createInteraction() {

            const pointerMove = new Pointer(
                {
                    handleDownEvent: function () {
                        const position = this.clickCoordinate;

                        console.log(position)
                        this.setCoords(position);

                        if (position && Array.isArray(position) && position.length === 2 && !Number.isNaN(position[0]) && !Number.isNaN(position[1]) && this.active) {
                            window.infra3d.lookAt2DPosition(position[0], position[1]);
                        }
                    }.bind(this)
                },
                this
            );

            this.addInteractionToMap(pointerMove);
        }
    }
};
</script>
<template lang="html">
    <div>
        <div
            id="strassenbefahrung"
        >
            <!-- {{ $t("additional:modules.tools.StrassenBefahrung.content") }} -->
            <!-- <div id="infra3d-btn-list">
                <button
                    class="btn btn-default btn-marker"
                    title="Platzieren Sie den Marker in der Karte um dort mit der Strassenbefahrung zu starten."
                >
                    <span class="glyphicon glyphicon-map-marker" />Platziere Marker in Karte
                </button>
                <button
                    class="btn btn-default btn-nav"
                    title="Wechseln Sie zwischen den verfügbaren Kameras"
                >
                    <span class="glyphicon glyphicon-list" />Kamera wechseln
                </button>
            </div> -->
            <div
                id="infra3d-div"
            />
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";

#strassenbefahrung {
    width: 100%;
    height: 100%;

    #infra3d-btn-list {
        padding: 5px;

        .glyphicon {
            padding-left: 5px;
            padding-right: 5px;
        }
    }

    #infra3d-div {
        height: 100%;
    }
}
</style>
