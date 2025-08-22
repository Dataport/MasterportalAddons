<script>
import {mapGetters} from "vuex";
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
        LayersAvailable () {
            return this.filterLayers.length > 0 && this.targetLayers.length > 0;
        }
    },
    mounted () {
        this.selectedFilterLayer = this.filterLayers[0] || null;
        this.selectedTargetLayer = this.targetLayers[0] || null;
    },
    methods: {
        async applyFilter () {
            if (!this.selectedFilterLayer || !this.selectedTargetLayer) {
                return;
            }
            this.loading = true;

            const filterLayer = layerCollection.getLayerById(this.selectedFilterLayer.id),
                targetLayer = layerCollection.getLayerById(this.selectedTargetLayer.id);

            try {

                const features = await filterFeaturesByGeometry(targetLayer, filterLayer);

                // eslint-disable-next-line no-console
                console.log("WFS Features:", features);
            }
            catch (error) {
                console.error("Error during WFS request:", error);
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
            v-if="!LayersAvailable"
            class="mt-3"
        >
            {{ $t("additional:modules.tools.geoFilter.noLayersAvailable") }}
        </div>
        <div
            v-else
            class="mt-3"
        >
            <div v-if="LayersAvailable">
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
