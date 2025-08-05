<script>
import {mapActions, mapGetters, mapMutations} from "vuex";

import {getLayersFromCapabilities} from "../utils/capabilities";
import mutations from "../store/mutationsExporterAddon";

export default {
    name: "ExternalWfsLayerSelection",
    data () {
        return {
            inputValid: true,
            isLoading: false
        };
    },
    computed: {
        ...mapGetters("Modules/ExporterAddon", ["selectedLayer", "layerSelectionList", "capabilitiesUrl"]),
        layerSelectionRadioId (id) {
            return "exporter-external-wfs-layer-radio-" + id;
        },
        layerRadioValue: {
            get () {
                return this.selectedLayer;
            },
            set (value) {
                this.setSelectedLayer(value);
            }
        }
    },
    watch: {
        capabilitiesUrl: async function () {
            const layerSelectionList = await this.getLayerSelectionList();

            this.setLayerSelectionList(layerSelectionList);
            this.setCurrentFormValid(this.isFormValid());
        }
    },
    async created () {
        if (this.layerSelectionList.length === 0 && this.capabilitiesUrl) {
            const layerSelectionList = await this.getLayerSelectionList();

            this.setLayerSelectionList(layerSelectionList);
        }

        const isValid = this.isFormValid();

        this.setCurrentFormValid(isValid);
    },
    methods: {
        ...mapActions("Modules/ExporterAddon", []),
        ...mapMutations("Modules/ExporterAddon", Object.keys(mutations)),

        /**
         * Load the layers from the getCapabilities document.
         *
         * @returns {Object[]} List of downloadable layers.
         */
        async getLayerSelectionList () {
            let layerSelectionList = [];

            this.showErrorMessage = false;
            this.isLoading = true;

            try {
                layerSelectionList = await getLayersFromCapabilities(this.capabilitiesUrl);

                this.showErrorMessage = false;
                return layerSelectionList;
            }
            catch {
                this.showErrorMessage = true;
            }
            finally {
                this.isLoading = false;
            }

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
    <div class="exporter-addon-external-wfs-layer-selection">
        <div v-if="layerSelectionList.length === 0 && !isLoading">
            <h3 class="exporter-addon-empty-layer-selection">
                {{ $t("additional:modules.tools.exporterAddon.emptyLayerSelectionText") }}
            </h3>
        </div>
        <div v-if="isLoading">
            {{ $t("additional:modules.tools.exporterAddon.loadingText") }}
        </div>
        <div v-if="layerSelectionList.length > 0 && !isLoading">
            <span>
                {{ $t("additional:modules.tools.exporterAddon.layerSelectionText") }}
            </span>
            <form>
                <div
                    v-for="layer in layerSelectionList"
                    :key="layer.idx"
                    class="form-check"
                >
                    <input
                        :id="`exporter-external-wfs-layer-radio-${layer.idx}`"
                        v-model="layerRadioValue"
                        type="radio"
                        class="form-check-input"
                        name="exporter-external-wfs-layer-radio"
                        :value="layer"
                        @change="onRadioChange"
                    >
                    <label
                        class="form-check-label"
                        :for="`exporter-external-wfs-layer-radio-${layer.idx}`"
                    >
                        {{ layer.name }}
                    </label>
                    <div
                        v-if="!inputValid"
                        class="help-block"
                    >
                        {{ $t("additional:modules.tools.exporterAddon.layerSelectionRequiredText") }}
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
</style>
