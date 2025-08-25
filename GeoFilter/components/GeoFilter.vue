<script>
import {mapGetters, mapActions} from "vuex";
import layerCollection from "@core/layers/js/layerCollection";
import FlatButton from "@shared/modules/buttons/components/FlatButton.vue";
import SpinnerItem from "@shared/modules/spinner/components/SpinnerItem.vue";
import filterFeaturesByGeometry from "../utils/filterFeaturesByGeometry";

/**
 * Checks if the given layer is a polygon layer.
 * @param {Object} layer - The layer to check.
 * @returns {boolean} - True if the layer is a polygon layer, false otherwise.
 */
function isPolygonLayer (layer) {
    return layer.layerSource.getFeatures()[0].getGeometry().getType() === "Polygon";
}

export default {
    name: "GeoFilter",
    components: {
        SpinnerItem,
        FlatButton
    },
    data () {
        return {
            selectedFilterLayer: null,
            selectedTargetLayer: null,
            loading: false
        };
    },
    computed: {
        ...mapGetters("Menu", [
            "mainMenu",
            "mainExpanded"
        ]),
        ...mapGetters("Modules/GeoFilter", ["filterLayerTypes", "targetLayerIds"]),
        filterLayers () {
            return layerCollection.getLayers().filter(layer => this.filterLayerTypes.includes(layer.layer.get("typ")) && isPolygonLayer(layer)).map(layer => {
                return {
                    id: layer.layer.get("id"),
                    name: layer.layer.get("name")
                };
            });
        },
        targetLayers () {
            let targetLayers = [];

            if (this.targetLayerIds.length > 0) {
                targetLayers = layerCollection.getLayers().filter(layer => this.targetLayerIds.includes(layer.layer.get("id")));
            }
            else {
                targetLayers = layerCollection.getLayers().filter(layer => layer.layer.get("typ") === "WFS");
            }
            return targetLayers.map(layer => {
                return {
                    id: layer.layer.get("id"),
                    name: layer.layer.get("name")
                };
            });
        },
        filterLayersAvailable () {
            return this.filterLayers.length > 0;
        },
        targetLayersAvailable () {
            return this.targetLayers.length > 0;
        },
        layersAvailable () {
            return this.filterLayers.length > 0 && this.targetLayers.length > 0;
        },
        /**
         * Checks if the ImporterAddon is available/configured in the main menu only
         * @returns {Boolean} True if importerAddon is available in main menu
         */
        isImporterAddonAvailable () {
            return this.isModuleInSections(this.mainMenu?.sections, "importerAddon");
        }
    },
    mounted () {
        this.selectedFilterLayer = this.filterLayers[0] || null;
        this.selectedTargetLayer = this.targetLayers[0] || null;
    },
    methods: {
        ...mapActions("Modules/GeoFilter", ["addFilteredFeaturesToTree"]),
        ...mapActions("Alerting", ["addSingleAlert"]),
        ...mapActions("Modules/LayerSelection", ["changeVisibility"]),
        ...mapActions("Menu", ["changeCurrentComponent", "toggleMenu"]),

        openImporterAddon () {
            if (!this.isImporterAddonAvailable) {
                return;
            }

            // Ensure main menu is open
            if (!this.mainExpanded) {
                this.toggleMenu("mainMenu");
            }

            // Change to importerAddon component in main menu
            this.changeCurrentComponent({
                type: "importerAddon",
                side: "mainMenu",
                props: {
                    name: "common:modules.importerAddon.name"
                }
            });
        },
        /**
         * Recursively searches for a module type in menu sections
         * @param {Array} sections - The menu sections to search in
         * @param {String} moduleType - The module type to search for
         * @returns {Boolean} True if module is found
         */
        isModuleInSections (sections, moduleType) {
            if (!Array.isArray(sections)) {
                return false;
            }

            for (const section of sections) {
                if (Array.isArray(section)) {
                    // Handle array of sections
                    if (this.isModuleInSections(section, moduleType)) {
                        return true;
                    }
                }
                else if (section && typeof section === "object") {
                    // Check if this section has the module type
                    if (section.type === moduleType) {
                        return true;
                    }
                    // Check if this is a folder with elements
                    if (section.type === "folder" && section.elements) {
                        if (this.isModuleInSections(section.elements, moduleType)) {
                            return true;
                        }
                    }
                    // Check if this section has elements
                    if (section.elements && this.isModuleInSections(section.elements, moduleType)) {
                        return true;
                    }
                }
            }
            return false;
        },

        async applyFilter () {
            if (!this.selectedFilterLayer || !this.selectedTargetLayer) {
                return;
            }
            this.loading = true;

            const filterLayer = layerCollection.getLayerById(this.selectedFilterLayer.id),
                targetLayer = layerCollection.getLayerById(this.selectedTargetLayer.id);

            try {
                const features = await filterFeaturesByGeometry({targetLayer, filterLayer});

                if (!features || features.length === 0) {
                    this.addSingleAlert({
                        type: "warning",
                        content: this.$t("additional:modules.tools.geoFilter.emptyFeaturesResponse"),
                        title: this.$t("additional:modules.tools.geoFilter.title")
                    });
                    return;
                }
                this.addFilteredFeaturesToTree({
                    layerId: this.selectedTargetLayer.id,
                    features: features
                });
            }
            catch (error) {
                console.error("Error during WFS request:", error);
                this.addSingleAlert({
                    type: "error",
                    content: this.$t("additional:modules.tools.geoFilter.errorMessage"),
                    title: this.$t("additional:modules.tools.geoFilter.title")
                });
            }
            finally {
                this.loading = false;
            }
        }
    }

};
</script>

<template lang="html">
    <div
        id="geoFilter"
        class="row"
    >
        <hr>
        <SpinnerItem v-if="loading" />
        <div
            v-if="!filterLayersAvailable"
            class="mt-3"
        >
            {{ $t("additional:modules.tools.geoFilter.noLayersAvailable") }}
            <FlatButton
                :text="$t(`additional:modules.tools.geoFilter.importFilterLayer`)"
                @click="openImporterAddon"
            />
        </div>
        <div
            v-else
            class="mt-3"
        >
            <div v-if="layersAvailable">
                <div>
                    {{ $t("additional:modules.tools.geoFilter.chooseLayerText") }}
                </div>
                <select
                    id="geofilter-select-filterlayer"
                    v-model="selectedFilterLayer"
                    class="form-select mt-3"
                >
                    <option
                        v-for="(layer, idx) in filterLayers"
                        :key="idx"
                        :value="layer"
                    >
                        {{ layer.name }}
                    </option>
                </select>
                <select
                    id="geofilter-select-targetlayer"
                    v-model="selectedTargetLayer"
                    class="form-select mt-3"
                >
                    <option
                        v-for="(layer, idx) in targetLayers"
                        :key="idx"
                        :value="layer"
                    >
                        {{ layer.name }}
                    </option>
                </select>
                <FlatButton
                    class="mt-3"
                    :disabled="!selectedFilterLayer && !selectedTargetLayer"
                    :text="$t(`additional:modules.tools.geoFilter.filterButton`)"
                    @click="applyFilter"
                />
            </div>
        </div>
    </div>
</template>


<style>
</style>
