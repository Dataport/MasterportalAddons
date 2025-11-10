<script>
import {mapGetters, mapActions, mapMutations} from "vuex";
import layerCollection from "@core/layers/js/layerCollection";
import AccordionItem from "@shared/modules/accordion/components/AccordionItem.vue";
import RadioButton from "./RadioButton.vue";

import mutations from "../store/mutationsExporterAddon";
import LAYERTYPES from "../constants/layertypes";
import {wfsToDownloadLayer, geoJsonToDownloadLayer, drawLayerToDownloadLayer, vectorBaseDownloadLayer} from "../utils/layer";


export default {
    name: "LayerSelection",
    components: {
        AccordionItem,
        RadioButton
    },
    data () {
        return {
            inputValid: true,
            expandedTypes: {
                [LAYERTYPES.wfs]: true,
                [LAYERTYPES.geoJson]: true,
                [LAYERTYPES.draw]: true,
                [LAYERTYPES.vectorBase]: true
            }
        };
    },
    computed: {
        ...mapGetters("Modules/Exporter", ["selectedLayer", "layerSelectionList"]),
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
    unmounted () {
        this.setCurrentFormValid(false);
        this.setLayerSelectionList([]);
    },
    methods: {
        ...mapActions("Modules/Exporter", [
        ]),
        ...mapMutations("Modules/Exporter", Object.keys(mutations)),

        /**
         * Load the downloadable layers from the layer tree.
         * Drawlayers = layers that have been imported bei the importer addon or the AddWMS Tool.
         * Vectorbaselayers = layers that are created from a selection of a another layer.
         *
         * @returns {any[]} List of downloadable layers.
         */
        getLayerSelectionList () {
            let layerSelectionList = [];

            this.showErrorMessage = false;

            const wfsLayers = layerCollection.getLayers().filter(layer => layer.get("typ").toUpperCase() === LAYERTYPES.wfs).map(wfsToDownloadLayer),
                geojsonLayers = layerCollection.getLayers().filter(layer => layer.get("typ").toUpperCase() === LAYERTYPES.geoJson).map(geoJsonToDownloadLayer),
                drawLayers = layerCollection.getLayers().filter(layer => layer.get("id") === "importDrawLayer" || layer.get("id").startsWith("importedLayer_")).map(drawLayerToDownloadLayer),
                vectorBaseLayers = layerCollection.getLayers().filter(layer => layer.get("typ").toUpperCase() === LAYERTYPES.vectorBase && layer.get("id") !== "importDrawLayer").map(vectorBaseDownloadLayer);

            layerSelectionList = layerSelectionList
                .concat(wfsLayers, geojsonLayers, drawLayers, vectorBaseLayers)
                .map((layer, idx) => {
                    layer.idx = idx;
                    return layer;
                });

            return layerSelectionList;
        },

        /**
         * Handler for the radio change events.
         *
         * @param {Object} value - The selected layer value.
         * @returns {void}
         */
        onRadioChange (value) {
            this.setSelectedLayer(value);
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
        <div
            v-if="layerSelectionList.length === 0"
            class="exporter-addon-empty-layer-selection mb-3"
        >
            {{ $t("additional:modules.tools.exporterAddon.emptyLayerSelectionText") }}
        </div>
        <div v-if="layerSelectionList.length > 0">
            <span class="exporter-addon-layer-selection-text mb-3">
                {{ $t("additional:modules.tools.exporterAddon.layerSelectionText") }}
            </span>
            <div
                v-for="layerType in [layerTypes.wfs, layerTypes.geoJson, layerTypes.draw, layerTypes.vectorBase]"
                :key="layerType"
            >
                <AccordionItem
                    :id="`exporter-layer-type-${layerType}`"
                    :title="layerType === layerTypes.draw ? $t(`additional:modules.tools.exporterAddon.drawLayerText`) : layerType === layerTypes.vectorBase ? $t(`additional:modules.tools.exporterAddon.vectorBaseLayerText`) : layerType"
                    :is-open="layerTypeSelectionList(layerType).length > 0"
                >
                    <div
                        v-for="layer in layerTypeSelectionList(layerType)"
                        :key="layer.idx"
                        class="export-layer-selection-buttons"
                    >
                        <RadioButton
                            :id="`exporter-layer-radio-${layer.idx}`"
                            :value="layer"
                            :selected-value="selectedLayer"
                            :text="layer.name"
                            name="layer-selection"
                            @change="onRadioChange"
                        />
                    </div>
                    <div v-if="layerTypeSelectionList(layerType).length === 0">
                        <span class="exporter-layer-empty">{{ $t("additional:modules.tools.exporterAddon.emptyLayerSelectionTypeText") }}</span>
                    </div>
                </AccordionItem>
            </div>
            <div :class="[{['has-error']: !inputValid}]">
                <span
                    v-if="!inputValid"
                    class="help-block"
                >
                    {{ $t("additional:modules.tools.exporterAddon.layerSelectionRequiredText") }}
                </span>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.exporter-addon-empty-layer-selection {
    color: grey;
    font-size: large;
}

.exporter-addon-layer-selection-text {
    font-size: large;
}

.export-layer-selection-buttons {
    display: flex;
    flex-direction: column;
}

.exporter-layer-empty {
    padding-left: 30px;
    font-style: italic;
    font-weight: lighter;
}

:deep(.accordion-item .accordion-header .accordion-button) {
    font-size: 1rem;
}
</style>
