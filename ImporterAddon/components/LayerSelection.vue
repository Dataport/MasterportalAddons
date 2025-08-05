<script>
import {mapGetters, mapActions, mapMutations} from "vuex";

import mutations from "../store/mutationsImporterAddon";

import {createCapabilitiesUrl, fetchCapabilities, getLayersFromCapabilities, getVersionFromCapabilities, isValidCapabilitiesUrl} from "../utils/capabilities";
import {createLayerConfigs, generateId} from "../utils/layer";

export default {
    name: "LayerSelection",
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
            inputValid: true,
            layerSelectionList: undefined
        };
    },
    computed: {
        ...mapGetters("Modules/ImporterAddon", [
            "selectedLayerNamesFromLayers",
            "idCounter",
            "capabilitiesBaseUrl",
            "capabilitiesVersion",
            "layerTreeFolderId"
        ]),
        selectedLayerNames: {
            get () {
                return this.selectedLayerNamesFromLayers;
            },
            set (value) {
                const layerOpts = this.layerSelectionList
                        .filter(item => value.indexOf(item.name) > -1)
                        .map(function (item) {
                            this.incrementIdCounter();
                            return {
                                title: item.title,
                                name: item.name,
                                id: generateId(this.idCounter)
                            };
                        }.bind(this)),
                    layerConfigs = createLayerConfigs(this.serviceType, this.capabilitiesBaseUrl, this.capabilitiesVersion, this.layerTreeFolderId, layerOpts);

                this.setSelectedLayers(layerConfigs);
            }
        }
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
        ...mapActions("Modules/ImporterAddon", [
        ]),
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

            this.layerSelectionList = layers;

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
         * Handler for the checkbox change events.
         *
         * @returns {void}
         */
        onCheckboxChange () {
            this.inputValid = this.isFormValid();
            this.setCurrentFormValid(this.isFormValid());
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
         * Check if the form is valid.
         *
         * @returns {Boolean} True, if form is valid. False otherwise.
         */
        isFormValid () {
            return this.selectedLayerNames.length > 0;
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
            <!-- TODO add masterportal loading animation here? -->
            {{ $t("additional:modules.tools.importerAddon.loadingText") }}
        </div>
        <div v-if="showErrorMessage">
            {{ $t("additional:modules.tools.importerAddon.layerLoadingErrorText") }}
        </div>
        <div v-if="layerSelectionList">
            <span>
                {{ $t("additional:modules.tools.importerAddon.layerSelectionText") }}
            </span>
            <div class="checkbox">
                <label class="layer-select-all">
                    <input
                        ref="importer-addon-layer-select"
                        type="checkbox"
                        value="all"
                        @change="onSelectAllCheckboxChange"
                    >
                    {{ $t("additional:modules.tools.importerAddon.layerSelectionSelectAllText") }}
                </label>
            </div>
            <div
                v-for="layer in layerSelectionList"
                :key="layer.name"
                class="checkbox"
            >
                <input
                    :id="'importer-addon-layer-selection-checkbox-' + layer.name"
                    v-model="selectedLayerNames"
                    type="checkbox"
                    class="layer-checkbox"
                    name="layer-checkbox"
                    :value="layer.name"
                    @change="onCheckboxChange"
                >
                <label :for="'importer-addon-layer-selection-checkbox-' + layer.name">
                    {{ layer.title }}
                </label>
            </div>
            <div :class="[{['has-error']: !inputValid}]">
                <span
                    v-if="!inputValid"
                    class="help-block"
                >
                    {{ $t("additional:modules.tools.importerAddon.layerSelectionRequiredText") }}
                </span>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.layer-select-all {
    font-weight: bold;
}
</style>
