<script>
import {mapGetters, mapActions} from "vuex";
import layerCollection from "@core/layers/js/layerCollection";
import FlatButton from "@shared/modules/buttons/components/FlatButton.vue";
import SpinnerItem from "@shared/modules/spinner/components/SpinnerItem.vue";
import filterFeaturesByGeometry from "../utils/filterFeaturesByGeometry";
import AddonOpenerButton from "../../AddonOpenerButton.vue";

export default {
    name: "GeoFilter",
    components: {
        SpinnerItem,
        FlatButton,
        AddonOpenerButton
    },
    data () {
        return {
            selectedFilterLayer: null,
            selectedTargetLayer: null,
            filterLayerName: "",
            loading: false,
            importerAddonId: "importerAddon",
            importerAddonName: "Import"
        };
    },
    computed: {
        ...mapGetters("Menu", [
            "mainMenu",
            "secondaryMenu",
            "mainExpanded",
            "secondaryExpanded"
        ]),
        ...mapGetters(["visibleLayerConfigs", "layerConfigById", "treeHighlightedFeatures"]),
        ...mapGetters("Menu", ["currentComponentName", "menuBySide"]),
        ...mapGetters("Modules/GeoFilter", ["filterLayerTypes", "targetLayerIds"]),
        configuredTargetLayers () {
            return this.targetLayerIds.map(id => this.layerConfigById(id)).filter(layer => layer).map(layer => layer.name).join(", ");
        },
        filterLayers () {
            return this.visibleLayerConfigs.filter(layer => this.filterLayerTypes.includes(layer.typ)).map(layer => {
                return {
                    id: layer.id,
                    name: layer.name
                };
            });
        },
        targetLayers () {
            let targetLayers = [];

            if (this.targetLayerIds.length > 0) {
                targetLayers = this.visibleLayerConfigs.filter(layer => this.targetLayerIds.includes(layer.id));
            }
            else {
                targetLayers = this.visibleLayerConfigs.filter(layer => layer.typ === "WFS");
            }
            return targetLayers.map(layer => {
                return {
                    id: layer.id,
                    name: layer.name
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
        isPolygonLayer () {
            const layer = layerCollection.getLayerById(this.selectedFilterLayer.id);

            if (!layer) {
                return false;
            }
            return layer.layerSource.getFeatures()[0].getGeometry().getType() === "Polygon";
        }
    },
    watch: {
        visibleLayerConfigs (oldVal, newVal) {
            if (oldVal !== newVal) {
                this.selectedFilterLayer = this.filterLayers[0] || null;
                this.selectedTargetLayer = this.targetLayers[0] || null;
            }
        }
    },
    mounted () {
        this.filterLayerName = this.treeHighlightedFeatures.layerName ? this.treeHighlightedFeatures.layerName : "common:shared.js.utils.selectedFeatures";
        this.selectedFilterLayer = this.filterLayers[0] || null;
        this.selectedTargetLayer = this.targetLayers[0] || null;
    },
    methods: {
        ...mapActions("Modules/GeoFilter", ["addFilteredFeaturesToTree"]),
        ...mapActions("Alerting", ["addSingleAlert"]),
        ...mapActions("Modules/LayerSelection", ["changeVisibility"]),
        async applyFilter () {
            if (!this.selectedFilterLayer || !this.selectedTargetLayer) {
                return;
            }
            if (!this.isPolygonLayer) {
                console.warn("Selected filter layer is not a polygon layer");
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
                this.changeVisibility({
                    layerId: this.selectedTargetLayer.id,
                    value: false
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
                this.addSingleAlert({
                    type: "info",
                    content: this.$t("additional:modules.tools.geoFilter.filteredFeaturesAdded", {layerName: `${this.filterLayerName} ${this.selectedTargetLayer.name}`}),
                    title: this.$t("additional:modules.tools.geoFilter.title")
                });
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
            {{ $t("additional:modules.tools.geoFilter.importFilterLayer") }}
            <AddonOpenerButton
                :button-text="$t(`additional:modules.tools.geoFilter.import`)"
                :button-class="'mt-3'"
                :addon-id="importerAddonId"
                :addon-name="importerAddonName"
            />
        </div>
        <div
            v-else
            class="mt-3"
        >
            <div v-if="filterLayersAvailable">
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
            </div>
            <div
                v-if="!targetLayersAvailable"
                class="mt-3"
            >
                {{ $t("additional:modules.tools.geoFilter.noTargetLayersAvailable") }}
                <span v-if="configuredTargetLayers">
                    {{ $t("additional:modules.tools.geoFilter.configuredLayers") }} {{ configuredTargetLayers }}
                </span>
            </div>
            <div v-if="targetLayersAvailable">
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
