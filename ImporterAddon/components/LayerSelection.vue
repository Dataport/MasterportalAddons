<script>
import {mapGetters, mapMutations} from "vuex";
import mutations from "../store/mutationsImporterAddon";
import {createCapabilitiesUrl, fetchCapabilities, getLayersFromCapabilities, getVersionFromCapabilities, isValidCapabilitiesUrl} from "../utils/capabilities";
import {createLayerConfigs, generateId} from "../utils/layer";
import SpinnerItem from "@shared/modules/spinner/components/SpinnerItem.vue";

export default {
    name: "LayerSelection",
    components: {
        SpinnerItem
    },
    props: {
        serviceType: {
            type: String,
            required: true,
            validator: value => {
                return [
                    "wms",
                    "wfs"
                ].includes(value);
            }
        },
        capabilitiesUrl: {
            type: String,
            required: true,
            validator: value => {
                return isValidCapabilitiesUrl(value);
            }
        }
    },
    data () {
        return {
            isLoading: false,
            showErrorMessage: false,
            inputValid: false,
            layerSelectionList: undefined
        };
    },
    computed: {
        ...mapGetters("Modules/ImporterAddon", [
            "idCounter",
            "capabilitiesBaseUrl",
            "capabilitiesVersion",
            "layerTreeFolderId"
        ])
    },
    watch: {
        capabilitiesUrl: async function () {
            await this.handleCapabilitiesDocument();

            const isValid = this.isFormValid();

            this.setCurrentFormValid(isValid);
        }
    },
    async created () {
        await this.handleCapabilitiesDocument();

        const isValid = this.isFormValid();

        this.setCurrentFormValid(isValid);
    },
    methods: {
        ...mapMutations("Modules/ImporterAddon", Object.keys(mutations)),

        async handleCapabilitiesDocument () {
            this.showErrorMessage = false;
            this.isLoading = true;
            try {
                const url = createCapabilitiesUrl(this.capabilitiesUrl, this.serviceType),
                    capDocument = await fetchCapabilities(url);

                this.loadLayerNames(capDocument);
                this.loadServiceVersion(capDocument);
            }
            catch {
                this.showErrorMessage = true;
            }
            finally {
                this.isLoading = false;
            }
        },

        /**
         * Get all layer names from capabilities document and add them to the state
         * @param {String} capabilitiesDocument The capabilities document.
         * @returns {void}
         */
        async loadLayerNames (capabilitiesDocument) {
            const layers = await getLayersFromCapabilities(this.serviceType, capabilitiesDocument);

            this.layerSelectionList = layers.map(layer => ({
                ...layer,
                selected: false
            }));

            this.focusOnCheckbox();
        },

        /**
         * Get service version from capabilities document and adds it to state.
         *
         * @param {String} capabilitiesDocument The capabilities document.
         * @returns {void}
         */
        loadServiceVersion (capabilitiesDocument) {
            const version = getVersionFromCapabilities(capabilitiesDocument);

            this.setCapabilitiesVersion(version);
        },

        /**
         * Handler for the checkbox change events. Sets the selected layers in the state.
         *
         * @returns {void}
         */
        onCheckboxChange () {
            const selectedLayers = this.layerSelectionList.filter(layer => layer.selected),

                layerOpts = selectedLayers.map(function (item) {
                    this.incrementIdCounter();
                    return {
                        title: item.title,
                        name: item.name,
                        id: generateId(this.idCounter)
                    };
                }.bind(this)),

                layerConfigs = createLayerConfigs(this.serviceType, this.capabilitiesBaseUrl, this.capabilitiesVersion, this.layerTreeFolderId, layerOpts);

            this.setSelectedLayers(layerConfigs);
            this.inputValid = this.isFormValid();
            this.setCurrentFormValid(this.isFormValid());
        },
        /**
         * returns true if at least one layer is selected.
         * @returns {Boolean} True, if at least one layer is selected. False otherwise
         */
        isFormValid () {
            return this.layerSelectionList && this.layerSelectionList.some(layer => layer.selected);
        },

        /**
         * Handler for the checkbox change event of the select all checkbox.
         *
         * @param {Object} evt The triggered event.
         * @returns {void}
         */
        onSelectAllCheckboxChange (evt) {
            const checkboxes = this.$el.querySelectorAll(".layer-checkbox"),
                checked = evt.target.checked;

            // querySelectorAll returns Nodelist, which has no `filter` method.
            // So we convert it into an array.
            [...checkboxes]
                .filter(checkbox => checkbox.checked !== checked)
                .forEach(checkbox => {
                    checkbox.click();
                });
        },

        /**
         * Focus on the layer select checkbox.
         *
         * @returns {void}
         */
        focusOnCheckbox () {
            this.$nextTick(() => {
                const layerSelectRef = "importer-addon-layer-select",
                    layerSelect = this.$refs[layerSelectRef];

                if (layerSelect) {
                    layerSelect.focus({focusVisible: true});
                }
            });
        }
    }
};
</script>

<template lang="html">
    <div class="importer-addon-layer-selection">
        <div v-if="isLoading">
            <SpinnerItem />
            {{ $t("additional:modules.tools.importerAddon.loadingText") }}
        </div>
        <div v-if="showErrorMessage">
            {{ $t("additional:modules.tools.importerAddon.layerLoadingErrorText") }}
        </div>
        <div v-if="layerSelectionList">
            <span class="mb-2">
                {{ $t("additional:modules.tools.importerAddon.layerSelectionText") }}
            </span>
            <div class="form-group m-1">
                <label class="form-check-label layer-select-all">
                    <input
                        ref="importer-addon-layer-select"
                        type="checkbox"
                        class="form-check-input"
                        value="all"
                        @change="onSelectAllCheckboxChange"
                    >
                    {{ $t("additional:modules.tools.importerAddon.layerSelectionSelectAllText") }}
                </label>
            </div>
            <div
                v-for="(layer, index) in layerSelectionList"
                :key="`${layer.name}-${index}`"
                class="form-check m-1"
            >
                <input
                    :id="'importer-addon-layer-selection-checkbox-' + `${layer.name}-${index}`"
                    v-model="layer.selected"
                    type="checkbox"
                    class="form-check-input layer-checkbox"
                    name="layer-checkbox"
                    :value="`${layer.name}-${index}`"
                    @change="onCheckboxChange"
                >
                <label
                    class="form-check-label"
                    :for="'importer-addon-layer-selection-checkbox-' + `${layer.name}-${index}`"
                >
                    {{ layer.title }}
                </label>
            </div>
            <span
                v-if="!inputValid"
                class="mt-2"
            >
                {{ $t("additional:modules.tools.importerAddon.layerSelectionRequiredText") }}
            </span>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.layer-select-all {
    font-weight: bold;
}
</style>
