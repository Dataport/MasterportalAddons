<script>
// import {mapActions, mapGetters, mapMutations} from "vuex";
import layerCollection from "@core/layers/js/layerCollection";
import FlatButton from "@shared/modules/buttons/components/FlatButton.vue";
import SpinnerItem from "@shared/modules/spinner/components/SpinnerItem.vue";

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
            filterLayerTypes: ["GeoJSON"],
            targetLayerIds: ["ensemble_elemente", "fundplatz_elemente", "1711"],
            selectedFilterLayer: null,
            selectedTargetLayer: null,
            loading: false
        };
    },
    computed: {
        filterLayers () {
            return layerCollection.getLayers().filter(layer => this.filterLayerTypes.includes(layer.layer.get("typ")) && isPolygonLayer(layer));
        },
        targetLayers () {
            if (this.targetLayerIds.length > 0) {
                return layerCollection.getLayers().filter(layer => this.targetLayerIds.includes(layer.layer.get("id")));
            }
            return layerCollection.getLayers().filter(layer => layer.layer.get("typ") === "WFS");
        },
        filterLayerAvailable () {
            return this.filterLayers.length > 0;
        },
        targetLayerAvailable () {
            return this.targetLayers.length > 0;
        }
    },
    mounted () {
        this.selectedFilterLayer = this.filterLayers[0] || null;
        this.selectedTargetLayer = this.targetLayers[0] || null;
    },
    methods: {
        applyFilter () {
            this.loading = true;
            // Simulate request
            setTimeout(() => {
                this.loading = false;
                console.warn("Filtering with layer:", this.selectedFilterLayer);
                console.warn("Filtering layer:", this.selectedTargetLayer);
            }, 1000);
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
            v-if="!filterLayerAvailable && !targetLayerAvailable"
            class="mt-3"
        >
            {{ $t("additional:modules.tools.geoFilter.noLayersAvailable") }}
        </div>
        <div
            v-else
            class="mt-3"
        >
            <div>
                {{ $t("additional:modules.tools.geoFilter.chooseLayerText") }}
            </div>
            <select
                v-if="filterLayerAvailable"
                id="geofilter-select-filterlayer"
                v-model="selectedFilterLayer"
                class="form-select mt-3"
            >
                <option
                    v-for="(layer, idx) in filterLayers"
                    :key="idx"
                    :value="layer"
                >
                    {{ layer.layer.get("name") }}
                </option>
            </select>
            <select
                v-if="targetLayerAvailable"
                id="geofilter-select-targetlayer"
                v-model="selectedTargetLayer"
                class="form-select mt-3"
            >
                <option
                    v-for="(layer, idx) in targetLayers"
                    :key="idx"
                    :value="layer"
                >
                    {{ layer.layer.get("name") }}
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
</template>


<style>
</style>
