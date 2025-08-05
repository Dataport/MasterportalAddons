<script>
import {mapGetters, mapActions, mapMutations} from "vuex";

import mutations from "../store/mutationsExporterAddon";
import LAYERTYPES from "../constants/layertypes";
import {drawLayerToDownloadLayer, geoJsonToDownloadLayer, wfsToDownloadLayer} from "../utils/layer";

export default {
    name: "LayerSelection",
    data () {
        return {
            inputValid: true,
            expandedTypes: {
                [LAYERTYPES.wfs]: true,
                [LAYERTYPES.geoJson]: true,
                [LAYERTYPES.draw]: true
            }
        };
    },
    computed: {
        ...mapGetters("Modules/ExporterAddon", ["selectedLayer", "layerSelectionList"]),
        layerSelectionRadioId (id) {
            return "exporter-layer-radio-" + id;
        },
        layerRadioValue: {
            get () {
                return this.selectedLayer;
            },
            set (value) {
                this.setSelectedLayer(value);
            }
        },
        layerTypes () {
            return LAYERTYPES;
        },
        layerTypeSelectionList () {
            return function (type) {
                return this.layerSelectionList.filter(l => l.type === type);
            };
        }
    },
    mounted () {
        if (this.layerSelectionList.length === 0) {
            const layerSelectionList = this.getLayerSelectionList();

            this.setLayerSelectionList(layerSelectionList);
        }

        const isValid = this.isFormValid();

        this.setCurrentFormValid(isValid);
    },
    methods: {
        ...mapActions("Modules/ExporterAddon", [
        ]),
        ...mapMutations("Modules/ExporterAddon", Object.keys(mutations)),

        /**
         * Load the downloadable layers from the layer tree.
         *
         * @returns {any[]} List of downloadable layers.
         */
        getLayerSelectionList () {
            let layerSelectionList = [];

            this.showErrorMessage = false;

            const wfsLayers = Radio.request("ModelList", "getModelsByAttributes", {typ: LAYERTYPES.wfs})
                    .map(wfsToDownloadLayer),
                geojsonLayers = Radio.request("ModelList", "getModelsByAttributes", {typ: LAYERTYPES.geoJson})
                    .map(geoJsonToDownloadLayer),
                drawLayer = this.$store.getters["Tools/Draw/layer"],
                mapView = this.$store.getters["Maps/getView"],
                epsg = mapView.getProjection().getCode(),
                drawLayerName = this.$t("additional:modules.tools.exporterAddon.drawLayerText"),
                drawLayers = drawLayer ? [drawLayerToDownloadLayer(drawLayer, drawLayerName, epsg)] : [];

            layerSelectionList = layerSelectionList
                .concat(wfsLayers, geojsonLayers, drawLayers)
                .map((layer, idx) => {
                    layer.idx = idx;
                    return layer;
                });

            return layerSelectionList;
        },

        /**
         * Handler for the radio change events.
         *
         * @returns {void}
         */
        onRadioChange () {
            this.inputValid = this.isFormValid();
            this.setCurrentFormValid(this.isFormValid());
        },

        /**
         * Toggle the expanded state for given layer type.
         *
         * @param {String} layerType The layerType to toggle.
         * @returns {void}
         */
        toggleLayerType (layerType) {
            if (!Object.prototype.hasOwnProperty.call(this.expandedTypes, layerType)) {
                return;
            }

            this.expandedTypes[layerType] = !this.expandedTypes[layerType];
        },

        /**
         * Check if the form is valid.
         *
         * @returns {Boolean} True, if form is valid. False otherwise.
         */
        isFormValid () {
            return this.selectedLayer !== undefined;
        }
    }
};
</script>

<template lang="html">
    <div class="exporter-addon-layer-selection">
        <div v-if="layerSelectionList.length === 0">
            <h3 class="exporter-addon-empty-layer-selection">
                {{ $t("additional:modules.tools.exporterAddon.emptyLayerSelectionText") }}
            </h3>
        </div>
        <div v-if="layerSelectionList.length > 0">
            <span>
                {{ $t("additional:modules.tools.exporterAddon.layerSelectionText") }}
            </span>
            <form>
                <div
                    v-for="layerType in [layerTypes.wfs, layerTypes.geoJson, layerTypes.draw]"
                    :key="layerType"
                >
                    <button
                        class="btn exporter-addon-collapse-button"
                        type="button"
                        @click="() => toggleLayerType(layerType)"
                    >
                        <i :class="['fas', 'fa-solid', expandedTypes[layerType] ? 'fa-chevron-down' : 'fa-chevron-right']" />
                        {{ layerType === layerTypes.draw ? $t("additional:modules.tools.exporterAddon.drawLayerText") : layerType }}
                    </button>
                    <div
                        id="wfs-collapse"
                        :class="['collapse', expandedTypes[layerType] ? 'show': '']"
                    >
                        <div
                            v-for="layer in layerTypeSelectionList(layerType)"
                            :key="layer.idx"
                            class="form-check exporter-addon-layer-radio-container"
                        >
                            <input
                                :id="`exporter-layer-radio-${layer.idx}`"
                                v-model="layerRadioValue"
                                type="radio"
                                class="form-check-input"
                                name="exporter-layer-radio"
                                :value="layer"
                                @change="onRadioChange"
                            >
                            <label
                                class="form-check-label"
                                :for="`exporter-layer-radio-${layer.idx}`"
                            >
                                {{ layer.name }}
                            </label>
                        </div>
                        <div v-if="layerTypeSelectionList(layerType).length === 0">
                            <span class="exporter-layer-empty">{{ $t("additional:modules.tools.exporterAddon.emptyLayerSelectionTypeText") }}</span>
                        </div>
                    </div>
                </div>
                <div :class="[{['has-error']: !inputValid}]">
                    <span
                        v-if="!inputValid"
                        class="help-block"
                    >
                        {{ $t("additional:modules.tools.exporterAddon.layerSelectionRequiredText") }}
                    </span>
                </div>
            </form>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.exporter-addon-empty-layer-selection {
    color: grey;
}

.exporter-addon-layer-radio-container {
    padding-left: 48px;
}

.exporter-addon-collapse-button {
    background-color: rgba(0, 0, 0, 0);
}

.exporter-layer-empty {
    padding-left: 30px;
    font-style: italic;
    font-weight: lighter;
}
</style>
