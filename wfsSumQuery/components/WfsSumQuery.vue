<script>
import {mapGetters, mapMutations, mapActions} from "vuex";
import {Draw} from "ol/interaction.js";
import GraphicalSelect from "../../../src/shared/modules/graphicalSelect/components/GraphicalSelect.vue";
import ExportButtonCSV from "../../../src/shared/modules/buttons/components/ExportButtonCSV.vue";
import FlatButton from "../../../src/shared/modules/buttons/components/FlatButton.vue";
import NavTab from "../../../src/shared/modules/tabs/components/NavTab.vue";
import thousandsSeparator from "../../../src/shared/js/utils/thousandsSeparator.js";
import SwitchInput from "../../../src/shared/modules/checkboxes/components/SwitchInput.vue";
import Multiselect from "vue-multiselect";

export default {
    name: "WfsSumQuery",
    components: {
        FlatButton,
        ExportButtonCSV,
        GraphicalSelect,
        Multiselect,
        NavTab,
        SwitchInput
    },
    data () {
        return {
            selectedAttributes: [],
            currentTabId: "all",
            visibleLayer: 0,
            definedCircle: false,
            selectedLayerIndex: 0,
            label: "additional:modules.wfsSumQuery.selectQueryLayer"
        };
    },
    computed: {
        ...mapGetters(["allLayerConfigs"]),
        ...mapGetters("Modules/WfsSumQuery", [
            "active",
            "name",
            "allSelectedFeatureProperties",
            "selectedFeatures",
            "uniqueAttributes",
            "circleRadius",
            "selectedLayerId",
            "newDrawend",
            "layerIndex",
            "layersForSelection"
        ]),
        ...mapGetters("Modules/GraphicalSelect", [
            "selectedAreaGeoJson"
        ]),
        /**
         * A computed property that returns the currently selected features.
         * @returns {Array} An array of the selected features.
         */
        featuresSelected () {
            return this.selectedFeatures;
        },
        /**
         * A computed property that generates a list of layers, including a default option followed by all WFS layers available in the configuration. It uses the `translate` method to localize the name of the default option.
         * @returns {Array} An array of layer objects, with each object containing at least a `name` property. The first object represents a default selection prompt.
         */
        layers () {
            const name = this.translate("additional:modules.wfsSumQuery.selectQueryLayer");

            return [{name: name}, ...this.layersForSelection];
        },
        /**
         * A computed property that provides a placeholder message for the sum operation input field. It checks the state of the selected attributes and the current tab to determine the appropriate placeholder to display, using the `translate` method for localization.
         * @returns {String} The placeholder message for the sum operation input, localized to the current language.
         */
        sumPlaceholder () {
            if (this.uniqueAttributes.length < 1) {
                return this.translate("additional:modules.wfsSumQuery.selectFeaturesFirst");
            }
            else if (this.currentTabId !== "sum") {
                return this.translate("additional:modules.wfsSumQuery.selectSumTab");
            }
            return this.translate("additional:modules.wfsSumQuery.sumPlaceholder");
        },
        circleRadiusComputed: {
            /**
             * getter for the computed property circleRadius of the current drawType
             * @info the internal representation of circleRadius is always in meters
             * @returns {Number} the current radius
             */
            get () {
                return this.circleRadius;
            },
            /**
             * setter for the computed property circleRadius of the current drawType
             * @info the internal representation of circleRadius is always in meters
             * @param {Number} value the value to set the target to
             * @returns {void}
             */
            set (value) {
                this.setCircleRadius(parseInt(value, 10));
            }
        }
    },
    watch: {
        /**
         * Watches for changes in `allSelectedFeatureProperties` and triggers the `showFeatures` method if the new value is truthy.
         * @param {Array} newValue - The new value of the `allSelectedFeatureProperties` property.
         * @returns {void} void
         */
        allSelectedFeatureProperties (newValue) {
            if (newValue) {
                this.showFeatures();
            }
        },
        /**
         * Watches for changes in `selectedAreaGeoJson` and updates features based on the new geometry. It retrieves features within the newly selected area and displays them.
         * @param {Object} newValue - The new GeoJSON object representing the selected area.
         * @returns {void}
         */
        selectedAreaGeoJson (newValue) {
            this.fetchFeaturesFromSelection({geometry: newValue, type: "polygonFromGraphicalSelect"});
        },
        /**
         * Watches the `circleRadius` value for changes. If a positive value is set and a circle is defined, it creates a drawing interaction for the circle on the visible layer.
         * @param {Number} newValue - The new value of the circle radius.
         * @returns {void}
         */
        circleRadius (newValue) {
            if (newValue > 0 && this.definedCircle) {
                this.createDrawInteraction(this.visibleLayer);
            }
        },
        /**
         * Watches for a new drawing completion event (`newDrawend`). When a new drawing is completed, it triggers feature display logic and resets the `newDrawend` state to false.
         * @param {Boolean} newValue - The state indicating whether a new drawing has been completed.
         * @returns {void}
         */
        newDrawend (newValue) {
            if (newValue) {
                this.showFeatures();
                this.setNewDrawend(false);
            }
        },
        /**
         * Processes new layer configurations and applies necessary alerts based on layer visibility changes.
         * It iterates over each layer in the new value array to delegate the processing to the `processLayer` method.
         *
         * @param {Array} newValue - The new layer configurations array.
         * @returns {Array} The same layer configurations array passed as an argument (for chaining or further use).
         */
        allLayerConfigs (newValue) {
            newValue.find(layer => this.processLayer(layer));
            return newValue;
        }
    },
    mounted () {
        this.setActive(true);
        this.setCurrentTabId(this.currentTabId);
    },
    beforeUnmount () {
        const map = mapCollection.getMap("2D"),
            circleInteraction = map.getInteractions().getArray().find(interaction => {
                return interaction instanceof Draw;
            });

        this.setActive(false);
        this.resetSelection();
        this.setSelectedLayerId(null);
        this.removeInteraction(circleInteraction);
        this.setCircleRadius(0);
        if (this.$refs.graphicalSelection) {
            this.$refs.graphicalSelection.setStatus(false);
            this.$refs.graphicalSelection.resetView();
        }
    },
    created () {
        this.getLayerForSelection();
        this.makeAllWfsLayersInvisible();
    },
    methods: {
        ...mapMutations("Modules/WfsSumQuery", ["setAllSelectedFeatureProperties", "setUniqueAttributes", "setSelectedFeatures", "setCircleRadius", "setSelectedLayerId", "setActive", "setNewDrawend"]),
        ...mapActions("Modules/WfsSumQuery", ["getLayerForSelection", "fetchFeaturesFromSelection", "highlightFeaturesFromSelection", "removeHighlightingWhenDeselected", "createDrawInteraction", "removeDefinedCircleLayer"]),
        ...mapActions("Maps", ["removeInteraction"]),
        ...mapActions("Alerting", ["addSingleAlert"]),
        /**
         * Processes a single layer configuration, checking if it's a WFS layer and applying logic based on
         * the layer's visibility and its relation to the currently visible layer. It may trigger alerts and
         * visibility changes as needed.
         *
         * @param {Object} layer - The layer configuration object to process.
         * @returns {boolean} True if the layer is processed (used or affected), otherwise false.
         */
        processLayer (layer) {
            if (!this.isWfsLayer(layer)) {
                return false; // Early return if not a WFS layer
            }
            const isLayerVisible = layer.name === this.visibleLayer.name,
                isLayerVisibilityChanged = !layer.visibility && !this.visibleLayer.visibility,
                isDifferentLayerVisible = layer.visibility && layer.name !== this.visibleLayer.name;

            if (isLayerVisible && isLayerVisibilityChanged) {
                this.addAlertForLayer("layerSwitchOffWarning", layer.name);
                this.makeLayerVisible(this.selectedLayerIndex);
            }
            else if (isDifferentLayerVisible) {
                this.addAlertForLayer("layerSwitchOnInfo", layer.name, this.visibleLayer.name);
            }
            return isLayerVisible || isDifferentLayerVisible;
        },
        /**
         * Adds a single alert message for layer events such as switching a layer off or on.
         * The message is constructed based on a specified message key and the names of the involved layers.
         * This function abstracts and reduces duplication in alert message creation.
         *
         * @param {string} messageKey - The key representing the message type, used to fetch the actual message template.
         * @param {string} layerName - The name of the layer related to the alert.
         * @param {string|null} selectedLayerName - The name of the currently selected layer, if applicable.
         * @returns {void} void
         */
        addAlertForLayer (messageKey, layerName, selectedLayerName = null) {
            const contentKey = `additional:modules.wfsSumQuery.${messageKey}`,
                contentData = selectedLayerName ? {layerName, selectedLayerName, toolName: this.$t(this.name)} : {layerName, toolName: this.$t(this.name)};

            this.addSingleAlert({
                category: "Info",
                displayClass: "info",
                content: this.translate(contentKey, contentData)
            });
        },
        /**
         * Resets the tool by setting all selections to their default values, removing drawn objects, and reinitializing the drawing interaction.
         * This method clears selected attributes, all selected feature properties, and unique attributes.
         * It also removes any highlighting from previously selected features and sets the current tab to "all".
         * If a circle is defined, it removes the defined circle layer and re-applies highlighting and drawing interactions.
         * If graphical selection is available, it resets and reinitializes the graphical selection interaction.
         * @returns {Void} void
         */
        resetSelection () {
            this.selectedAttributes = [];
            this.setAllSelectedFeatureProperties([]);
            this.setSelectedFeatures([]);
            this.setUniqueAttributes([]);
            this.removeHighlightingWhenDeselected();
            this.setCurrentTabId("all");

            if (this.definedCircle) {
                this.removeDefinedCircleLayer();
                this.removeHighlightingWhenDeselected();
                this.createDrawInteraction(this.visibleLayer);
            }
            else if (this.$refs.graphicalSelection) {
                this.$refs.graphicalSelection.setStatus(true);
                this.$refs.graphicalSelection.createDrawInteraction();
            }
        },
        /**
         * Updates the `definedCircle` property to the provided boolean value. If the new value is `false`, the method resets the selection, removes any defined circle layers, and sets the circle radius to 0.
         * If the new value is `true`, it resets the selection and clears any graphical selections.
         * @param {boolean} value - The new value for the `definedCircle` property, indicating whether a circle is defined (true) or not (false).
         * @returns {void} - void
         */
        circleSwitchStatus (value) {
            this.definedCircle = value;
            this.removeHighlightingWhenDeselected();
            if (!value) {
                this.resetSelection();
                this.removeDefinedCircleLayer();
                this.setCircleRadius(0);
            }
            else {
                this.resetSelection();
                this.clearGraphicalSelect();
            }
        },
        /**
         * Translates the given key, checkes if the key exists and throws a console warning if not.
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
         * Removes drawn objects and interactions from graphicalSelection.
         * @returns {void}
         */
        clearGraphicalSelect () {
            this.$refs.graphicalSelection.setStatus(false);
            this.$refs.graphicalSelection.resetView();
        },
        /**
         * Converts the content of an HTML table to a nested Array.
         * @function tableToCSV
         * @param {Function} onsuccess The function to hand over the data to downloadWithHandler().
         * @description This function converts the content of an HTML table to a nested Array.
         * @returns {void}
         */
        tableToCSV (onsuccess) {
            const downloadHandlerData = [],

                table = document.querySelector("table"),
                rows = table.getElementsByTagName("tr");

            for (let i = 0; i < rows.length; i++) {
                const row = [],
                    cols = rows[i].querySelectorAll("td, th");

                for (let j = 0; j < cols.length; j++) {
                    const cellData = cols[j].textContent.trim();

                    row.push(cellData);
                }

                downloadHandlerData.push(row);
            }
            onsuccess(downloadHandlerData);
        },
        /**
         * Set the current tab id after clicking.
         * @param {String} id The id of current tab.
         * @returns {Void} void
         */
        setCurrentTabId (id) {
            if (id) {
                this.currentTabId = id;
                if (id === "sum") {
                    this.showSum();
                }
                else if (id === "all") {
                    this.showFeatures();
                }
            }
        },
        /**
         * Updates the `selectedFeatures` array by filtering and mapping the `allSelectedFeatureProperties` based on `uniqueAttributes`. Each feature's properties are checked against the `uniqueAttributes`, and only those that match are included in the transformed `selectedFeatures`.
         * This function serves to refine the features displayed to the user, ensuring only relevant attributes are considered.
         * After updating `selectedFeatures`, the function proceeds to remove any existing highlighting on the map and then applies new highlighting to the features corresponding to the `visibleLayer`.
         * This ensures the visual representation on the map is consistent with the current selection and attribute filtering.
         * @description Filters and transforms features based on selected attributes, updates the state, and manages feature highlighting on the map.
         * @returns {void} void
         */
        showFeatures () {
            const featuresWithAttributes = this.allSelectedFeatureProperties.map(feature => {
                const selectedFeature = {properties: {}};

                this.uniqueAttributes.forEach(attribute => {
                    if (feature[attribute]) {
                        selectedFeature.properties[attribute] = feature[attribute];
                    }
                });
                return selectedFeature;
            });

            this.setSelectedFeatures(featuresWithAttributes);
            this.removeHighlightingWhenDeselected();
            this.highlightFeaturesFromSelection(this.visibleLayer);
        },
        /**
         * Updates selectedFeatures with numeric attribute values or '-' if values are not numeric.
         * @function showSum
         * @description Updates selectedFeatures with either numeric attribute values or '-' for non-numeric values based on the selectedAttributes.
         * @returns {void} void
         */
        showSum () {
            if (this.selectedAttributes.length > 0) {
                const featuresWithAttributes = this.allSelectedFeatureProperties.map(feature => {
                    const selectedFeature = {properties: {}};

                    this.selectedAttributes.forEach(attribute => {
                        if (Object.prototype.hasOwnProperty.call(feature, attribute)) {
                            const value = feature[attribute];

                            selectedFeature.properties[attribute] = value;
                        }
                    });
                    return selectedFeature;
                });

                this.setSelectedFeatures(featuresWithAttributes);
            }
        },
        /**
         * Calculates the sum of numeric attribute values across selectedFeatures.
         * @function calculateSum
         * @param {string} attribute - The attribute for which the sum needs to be calculated.
         * @description Calculates the sum of numeric attribute values across selectedFeatures for the given attribute.
         * @returns {number|string} - Returns the sum of numeric values for the provided attribute or '-' if no numeric values were found.
         */
        calculateSum (attribute) {
            let sum = 0;

            this.featuresSelected.forEach((feature) => {
                const value = feature.properties[attribute];

                if (!isNaN(parseFloat(value)) && isFinite(value)) {
                    sum += parseFloat(value);
                }
            });
            return sum !== 0 ? thousandsSeparator(sum) : "-";
        },
        /**
         * Checks layer type and returns true if it is a WFS layer.
         * @function isWfsLayer
         * @param {Object} layer - The layer that will be exmined.
         * @description - Checks layer type and returns true if it is a WFS layer.
         * @returns {Boolean} - Returns if layer type is WFS or not.
         */
        isWfsLayer (layer) {
            return layer.typ?.toUpperCase() === "WFS";
        },
        /** Makes the selected layer visible in the map.
         * @function makeLayerVisible
         * @param {Number} index - The index of the selected layer in the layer array.
         * @description - Makes the selected layer visible in the map.
         * @returns {void}
         */
        makeLayerVisible (index) {
            if (index) {
                const layer = this.layers[index].layerFromConfig;

                if (layer) {
                    this.resetSelection();
                    this.setSelectedLayerId(layer.id);
                    this.makeAllWfsLayersInvisible();
                    layer.visibility = true;
                    this.visibleLayer = layer;
                    this.selectedLayerIndex = index;
                }
            }
        },
        /** Makes all WFS layers invisible in the map.
         * @function makeAllWfsLayersInvisible
         * @description - Makes all WFS layers invisible in the map.
         * @returns {void}
         */
        makeAllWfsLayersInvisible () {
            this.visibleLayer = 0;
            this.layers?.forEach(layer => {
                if (this.isWfsLayer(layer)) {
                    layer.layerFromConfig.visibility = false;
                }
            });
        }
    }
};
</script>

<template lang="html">
    <div
        v-if="active"
        id="tool-WfsSumQuery"
        class="wfs-sum-query"
    >
        <div class="mb-3">
            {{ translate("additional:modules.wfsSumQuery.destinationLayer") }}
        </div>
        <select
            id="layerSelect"
            v-model="selectedLayerIndex"
            class="form-select"
            :aria-label="label"
            @change="makeLayerVisible($event.target.value)"
        >
            <option
                v-for="(layer, index) in layers"
                :key="index"
                :value="index"
            >
                {{ layer.name }}
            </option>
        </select>
        <div v-if="selectedLayerId">
            <div class="checkbox">
                <div class="checkbox-container">
                    <div class="form-inline">
                        <div class="form-check form-switch mb-3 d-flex align-items-center">
                            <SwitchInput
                                :id="'circleCheckBox'"
                                :aria="translate('additional:modules.wfsSumQuery.definedCircle')"
                                :interaction="($event) => circleSwitchStatus($event.target.checked)"
                                :label="translate('additional:modules.wfsSumQuery.definedCircle')"
                                :checked="definedCircle"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div
                v-if="definedCircle"
                class="form-group form-group-sm row"
            >
                <label
                    class="col-md-5 col-form-label"
                    for="wfs-sum-query-circleRadius"
                >
                    {{ translate('additional:modules.wfsSumQuery.circleRadius') }}
                </label>
                <div class="col-md-7">
                    <input
                        id="wfs-sum-query-circleRadius"
                        v-model="circleRadiusComputed"
                        class="form-control form-control-sm"
                        type="number"
                        step="1"
                        min="0"
                    >
                </div>
            </div>

            <hr>
            <div
                v-show="!definedCircle"
                class="graphicalSelectionContainer row"
            >
                <div class="dropdown">
                    <GraphicalSelect
                        ref="graphicalSelection"
                        :label="'additional:modules.wfsSumQuery.select.action'"
                    />
                </div>
            </div>


            <div>
                <div class="mb-3">
                    {{ translate("additional:modules.wfsSumQuery.sumInfo") }}
                </div>
                <div>
                    <Multiselect
                        v-model="selectedAttributes"
                        class="multiselect"
                        :options="uniqueAttributes"
                        :multiple="true"
                        label="attribute"
                        :custom-label="label => translate(label)"
                        :disabled="uniqueAttributes.length < 1 || currentTabId !=='sum'"
                        :close-on-select="false"
                        :placeholder="sumPlaceholder"
                        @select="showSum"
                    />
                </div>
            </div>
            <div class="d-flex justify-content-center mt-3">
                <FlatButton
                    id="flatButton-reset"
                    :text="translate('additional:modules.wfsSumQuery.reset')"
                    :interaction="() => resetSelection ()"
                />
            </div>
            <hr>
            <div>
                <ul
                    id="wfs-sum-query-tabs"
                    class="nav nav-tabs nav-justified"
                    role="tablist"
                    tabindex="0"
                >
                    <NavTab
                        :id="'all-tab'"
                        :active="currentTabId === 'all'"
                        :target="'#all'"
                        :label="translate('additional:modules.wfsSumQuery.allFeatures')"
                        :interaction="() => setCurrentTabId('all')"
                    />
                    <NavTab
                        :id="'sum-tab'"
                        :active="currentTabId === 'sum'"
                        :target="'#sum'"
                        :label="translate('additional:modules.wfsSumQuery.sumTab')"
                        :interaction="() => setCurrentTabId('sum')"
                    />
                </ul>
            </div>
            <div
                v-if="currentTabId === 'all'"
                class="tab-content"
            >
                <div
                    v-if="selectedFeatures.length > 0"
                    id="allFeaturesTab"
                >
                    <table
                        class="feature-table"
                    >
                        <thead>
                            <tr>
                                <th>Feature</th>
                                <th
                                    v-for="attribute in uniqueAttributes"
                                    :key="attribute"
                                >
                                    {{ attribute }}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                v-for="(feature, index) in selectedFeatures"
                                :key="index"
                            >
                                <td>{{ index + 1 }}</td>
                                <td
                                    v-for="attribute in uniqueAttributes"
                                    :key="attribute"
                                >
                                    {{ feature.properties[attribute] }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div
                v-if="currentTabId === 'sum'"
                class="tab-content"
            >
                <div
                    v-if="selectedAttributes.length > 0"
                    id="sumTab"
                >
                    <table
                        v-if="selectedAttributes.length > 0"
                        class="feature-table"
                    >
                        <thead>
                            <tr>
                                <td>{{ translate("additional:modules.wfsSumQuery.sum") }}</td>
                                <td
                                    v-for="attribute in selectedAttributes"
                                    :key="attribute"
                                >
                                    {{ calculateSum(attribute) }}
                                </td>
                            </tr>
                        </thead>
                        <thead>
                            <tr>
                                <th>{{ $t('additional:modules.wfsSumQuery.feature') }}</th>
                                <th
                                    v-for="attribute in selectedAttributes"
                                    :key="attribute"
                                >
                                    {{ attribute }}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                v-for="(feature, index) in selectedFeatures "
                                :key="index"
                            >
                                <td>{{ index + 1 }}</td>
                                <td
                                    v-for="attribute in selectedAttributes"
                                    :key="attribute"
                                >
                                    {{ feature.properties[attribute] }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div v-if="selectedFeatures.length > 0">
                <hr>
                <ExportButtonCSV
                    :url="false"
                    filename="downloadFilename"
                    :handler="tableToCSV"
                    :use-semicolon="true"
                    :title="$t('additional:modules.wfsSumQuery.downloadCsv')"
                />
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import "/src/assets/css/mixins.scss";

.wfs-sum-query {
    .feature-table {
        border-collapse: collapse;
        width: 100%;
        overflow-y:scroll;
        height:400px;
        display:block;
    }

    .feature-table td,
    .feature-table th {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
    }

    .feature-table th {
        background-color: #f2f2f2;
    }

    .feature-table tfoot {
        background-color: #f2f2f2;
        font-weight: bold;
    }

    .form-horizontal {
        &>* {
            padding-right: 15px;
            padding-left: 15px;
        }

        .graphicalSelectionContainer {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
        }
    }

    .checkbox-container {
        .form-inline {
            font-size: 15px;

            @media (max-width: 767px) {
                font-size: 12px;
            }
        }
    }
}
</style>

<style lang="scss">
@import "~variables";

#tooltip-overlay {
    position: relative;
    background: $accent_active;
    color: $white;
    max-width: 200px;
    padding: 4px 8px;
}

#circle-overlay {
    position: relative;
    top: -20px;
    background: $accent_active;
    color: $white;
    max-width: 70px;
    padding: 4px 8px;
}
</style>
