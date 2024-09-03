
<script>
import axios from "axios";
import store from "../../../src/app-store/index.js";
import {mapGetters, mapMutations, mapActions} from "vuex";
import GraphicalSelect from "../../../src/shared/modules/graphicalSelect/components/GraphicalSelect.vue";
import AccordionItem from "../../../src/shared/modules/accordion/components/AccordionItem.vue";
import SwitchInput from "../../../src/shared/modules/checkboxes/components/SwitchInput.vue";

import crs from "@masterportal/masterportalapi/src/crs";

import layerCollection from "../../../src/core/layers/js/layerCollection";

export default {
    name: "BulkDownload",
    components: {
        GraphicalSelect,
        AccordionItem,
        SwitchInput
    },
    data () {
        return {
            requestCompleted: false,
            requestFailed: false,
            selectedLayersForDownload: [],
            spinnerActive: false,
            selectedDataset: "KAPPAZUNDER 2020", // replace with the dataset that should be used for the download
            errorFailedMessage: "additional:modules.bulkDownload.check.requestFailed",
            mapProjection: "EPSG:3857", // replace with projection of the map
            downloadLayerProjection: "EPSG:31256" // replace with projection of the backend
        };
    },
    computed: {
        ...mapGetters("Modules/GraphicalSelect", [
            "selectedAreaGeoJson"
        ]),
        ...mapGetters("Modules/BulkDownload", [
            "confirmationData",
            "layerForDownload",
            "backendUrl",
            "confirmationUrl"
        ]),
        selectedCoordinates () {
            return this.selectedAreaGeoJson && this.selectedAreaGeoJson.coordinates && this.selectedAreaGeoJson.coordinates.length > 0;
        }
    },
    watch: {
        selectedAreaGeoJson () {
            this.resetRequestedFiles();
        }
    },
    mounted () {
        this.initializeUrls();
        this.initializeLayerForDownload();
        this.setSelectedLayersForDownload();
        this.showNoDownloadMessage();
    },
    beforeUnmount () {
        if (this.$refs.graphicalSelection) {
            this.$refs.graphicalSelection.setStatus(false);
            this.$refs.graphicalSelection.resetView();
            this.setSelectedAreaGeoJson(null);
        }
        this.resetRequestedFiles();
    },
    methods: {
        ...mapMutations("Modules/BulkDownload", [
            "setConfirmationData"
        ]),
        ...mapMutations("Modules/GraphicalSelect", [
            "setSelectedAreaGeoJson"
        ]),
        ...mapActions("Modules/BulkDownload", ["initializeLayerForDownload", "initializeUrls"]),
        /**
         * Makes a request to the backend to get data (points, images) for the selected area.
         * Sets the confirmation data that is needed for the download link if the request was successful.
         * @param  {Object} geoJson GeoJSON to get selected area from
         * @returns {void}
         */
        makeRequest: async function () {
            if (this.selectedLayersForDownload.length === 0) {
                store.dispatch("Alerting/addSingleAlert", {
                    content: this.translate("additional:modules.bulkDownload.check.noSelectedLayer"),
                    category: "error",
                    title: this.translate("additional:modules.bulkDownload.name")
                });
                return;
            }

            this.spinnerActive = true;
            const transformedCoordinates = this.selectedAreaGeoJson.coordinates[0].map(coord => crs.transform(this.mapProjection, this.downloadLayerProjection, coord)),
                options = this.selectedLayersForDownload.length > 1 ? 0 : this.selectedLayersForDownload[0].options,
                payload = {
                    data: {
                        coords: transformedCoordinates,
                        dataset: this.selectedDataset,
                        option: parseInt(options, 10)
                    }
                };

            try {
                const requestUrl = this.backendUrl.endsWith("/") ? this.backendUrl : this.backendUrl + "/",
                    response = await axios.post(`${requestUrl}register`, payload);

                if (response.status === 200) {
                    console.warn("Download request successful:", response.data);
                    this.setConfirmationData(response.data);
                    this.requestCompleted = true;
                }
            }
            catch (error) {
                if (error.response && error.response.data.error) {
                    this.requestFailed = true;
                    // Backend sends error message if request is too large or the selection does not contain any data
                    this.errorFailedMessage = error.response.data.error.message;
                }
                else {
                    this.requestFailed = true;
                    console.error("Error during download request:", error);
                    this.errorFailedMessage = "additional:modules.bulkDownload.check.requestFailed";
                }
            }
            finally {
                this.spinnerActive = false;
            }

        },
        /**
         * Opens a window with a link to download the files for the selected area.
         * The confirmation code, that is part of the successful response to the backend, is part of the url.
         * @returns {void}
         */
        downloadFiles: function () {
            const confirmationCode = this.confirmationData.items.confirmation;

            if (this.confirmationData && confirmationCode) {
                const downloadUrl = this.confirmationUrl.endsWith("/") ? this.confirmationUrl : this.confirmationUrl + "/",
                    url = `${downloadUrl}${confirmationCode}`;

                window.open(url, "_blank");
            }
            else {
                console.error("No confirmation data available.");
            }
        },

        /**
         * Resets the GraphicalSelect.
         * @returns {void}
         */
        resetView: function () {
            this.$refs.graphicalSelection.resetView();
        },
        /**
         * Translates the given key, checkes if the key exists and throws a console warning if not
         * @param {String} key the key to translate
         * @param {Object} [options=null] for interpolation, formating and plurals
         * @returns {String} the translation or the key itself on error
         */
        translate (key, options = null) {
            if (key === "additional:" + this.$t(key)) {
                console.warn("the key " + JSON.stringify(key) + " is unknown to the additional translation");
            }

            return this.$t(key, options);
        },
        /**
         * Sets the data properties 'requestComplete' and 'requestFailed' to false to reset the download request.
         * Sets confirmation data to null to reset the download link.
         * @returns {void}
         */
        resetRequestedFiles () {
            this.setConfirmationData(null);
            this.requestCompleted = false;
            this.requestFailed = false;
        },
        /**
         * Find a layer by id and toggle it's visibility.
         * Sets the layers that were selected for downloading data.
         * @param {number} index of the layer
         * @returns {void}
         */
        toggleLayerVisibility (index) {
            const selectedLayer = this.$store.getters.allLayerConfigs.find(layer => layer.id === index.target.id);

            selectedLayer.visibility = !selectedLayer.visibility;

            this.setSelectedLayersForDownload();
        },
        /**
         * Filters the layers that were configured for bulk download by visibility and sets them as selected layers for download.
         * @returns {void}
         */
        setSelectedLayersForDownload () {
            this.selectedLayersForDownload = this.layerForDownload.filter(layer => layer.visibility);
        },
        /**
         * Shows a message if there are layers visible that are not configured for download.
         * @returns {void}
         */
        showNoDownloadMessage () {
            const noDownloadForTheseLayers = layerCollection.getLayers().filter(
                layer => (!layer.attributes.bulkDownload || layer.attributes.bulkDownload === false)
                        && (!layer.attributes.baselayer || layer.attributes.baselayer === false)
            );

            if (noDownloadForTheseLayers.length > 0) {
                const layerNamesAsString = noDownloadForTheseLayers.map(layer => layer.attributes.name).join(", <br>");

                store.dispatch("Alerting/addSingleAlert", {
                    content: this.translate("additional:modules.bulkDownload.notDownloadLayer") + "<br>" + layerNamesAsString,
                    category: "info",
                    title: this.translate("additional:modules.bulkDownload.name")
                });
            }
        }
    }
};
</script>

<template lang="html">
    <div
        id="tool-BulkDownload"
        class="bulk-download"
    >
        <div
            v-if="spinnerActive"
            class="overlay"
        >
            <div class="d-flex justify-content-center align-items-center h-100">
                <span class="loading-text">{{ $t("additional:modules.bulkDownload.check.downloadWait") }}</span>
                <div class="spinner-border ms-2" />
            </div>
        </div>
        <div :class="{ 'blurred': spinnerActive }">
            <form class="form-horizontal">
                <div class="mb-3">
                    <AccordionItem
                        id="dataset-select"
                        :title="translate('additional:modules.bulkDownload.dataset')"
                        class="form-control"
                    >
                        <SwitchInput
                            v-for="(layer, index) in layerForDownload"
                            :id="layer.id"
                            :key="index"
                            :label="layer.name"
                            :aria="layer.name"
                            :value="layer.id"
                            :checked="layer.visibility"
                            :interaction="toggleLayerVisibility"
                        />
                    </AccordionItem>
                </div>
                <div class="mb-3">
                    <label
                        for="selection"
                        class="label"
                    >{{ translate('additional:modules.bulkDownload.select.selection') }}</label>
                    <div class="mb-3">
                        {{ translate('additional:modules.bulkDownload.select.info') }}
                    </div>
                    <div class="graphicalSelectionContainer row">
                        <div class="dropdown">
                            <GraphicalSelect
                                ref="graphicalSelection"
                                :label="translate('additional:modules.bulkDownload.select.action')"
                            />
                        </div>
                    </div>
                </div>

                <div class="mb-3">
                    <label
                        for="checkSize"
                        class="label"
                    >{{ translate('additional:modules.bulkDownload.check.size') }}</label>
                    <p>{{ translate('additional:modules.bulkDownload.check.sizeInfo') }}</p>
                    <div :title="!selectedCoordinates ? translate('additional:modules.bulkDownload.check.tooltip') : ''">
                        <button
                            type="button"
                            :aria-label="translate('additional:modules.bulkDownload.check.requestDownload')"
                            class="btn btn-primary mt-2"
                            :disabled="!selectedCoordinates"
                            @click="makeRequest"
                        >
                            {{ translate('additional:modules.bulkDownload.check.requestDownload') }}
                        </button>
                    </div>
                    <div
                        v-if="requestCompleted"
                        class="alert alert-success mt-3"
                    >
                        {{ translate('additional:modules.bulkDownload.check.downloadSize') }}: {{ confirmationData.items.size }} MB
                    </div>
                    <div
                        v-if="requestFailed"
                        class="alert alert-danger mt-3"
                    >
                        {{ translate(errorFailedMessage) }}
                    </div>
                </div>
            </form>
        </div>
        <div class="mb-3, form-horizontal">
            <label
                for="downloadTitle"
                class="label"
            >{{ translate('additional:modules.bulkDownload.download.title') }}</label>
            <p>{{ translate('additional:modules.bulkDownload.download.info') }}</p>
            <div :title="!confirmationData ? translate('additional:modules.bulkDownload.download.tooltip') : ''">
                <button
                    type="button"
                    :aria-label="translate('additional:modules.bulkDownload.download.button')"
                    class="btn btn-primary"
                    :disabled="!confirmationData"
                    @click="downloadFiles"
                >
                    {{ translate('additional:modules.bulkDownload.download.button') }}
                </button>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import "/src/assets/css/mixins.scss";

.bulk-download {
    position: relative;
    padding: 1rem;

    .form-horizontal {
        & > * {
            padding-right: 15px;
            padding-left: 15px;
        }

        .graphicalSelectionContainer {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
        }
    }

    .overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(0.5px);
        z-index: 10;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
    }

    .blurred {
        filter: blur(0.5px);
    }

    .spinner-border {
        width: 25px;
        height: 25px;
        border: 4px solid #D6E3FF;
        border-top: 4px solid #151C27;
        border-radius: 50%;
        aspect-ratio: 1 / 1;
    }

    .label {
        font-size: $font-size-big;
        margin: 0.5em 0;
    }
}
</style>

<style lang="scss">
@import "~variables";
</style>
