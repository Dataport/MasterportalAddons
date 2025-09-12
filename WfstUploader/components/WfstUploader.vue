<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import AddonOpenerButton from "../../AddonOpenerButton.vue";
import FeaturePropertiesDisplay from "./FeaturePropertiesDisplay.vue";
import VectorSource from "ol/source/Vector.js";
import {Select} from "ol/interaction";

export default {
    name: "WfstUploader",
    components: {
        AddonOpenerButton,
        FeaturePropertiesDisplay
    },
    data () {
        return {
            importerAddonId: "importerAddon",
            importerAddonName: "Import",
            selectInteraction: null,
            selectEvent: null,
            selectedWfstLayer: null
        };
    },
    computed: {
        ...mapGetters("Modules/WfstUploader", ["selectedFeature", "wfstLayers"]),
        ...mapGetters(["visibleLayerConfigs", "layerConfigById"]),
        wfstLayersForSelection () {
            return this.visibleLayerConfigs.filter(layer => this.wfstLayers.includes(layer.id)).map(layer => {
                return {
                    id: layer.id,
                    name: layer.name
                };
            });
        }
    },
    watch: {
        selectedFeature () {
            // Handle feature selection changes if needed
        }
    },
    mounted () {
        this.createInteractions();
    },
    unmounted () {
        this.setSelectedFeature(null);
        this.removeInteraction(this.selectEvent);
    },
    methods: {
        ...mapMutations("Modules/WfstUploader", ["setSelectedFeature"]),
        ...mapActions("Maps", ["addInteraction", "removeInteraction"]),
        createInteractions () {
            const select = new Select({
                condition: (event) => event.originalEvent.ctrlKey && event.type === "pointerdown",
                style: null
            });

            select.on("select", (event) => {
                this.setFeaturesFromClick(event.mapBrowserEvent);
            });
            this.selectEvent = select;
            this.addInteraction(this.selectEvent);
        },
        setFeaturesFromClick (event) {
            const map = mapCollection.getMap("2D"),
                coordinate = event.coordinate,
                pixel = map.getPixelFromCoordinate(coordinate);

            map.forEachFeatureAtPixel(pixel, (feature, layer) => {
                if (!layer) {
                    console.warn("No layer found for feature", feature);
                    return true;
                }

                if (layer.get("visible") && layer.get("source") instanceof VectorSource) {
                    this.setSelectedFeature(feature);
                }
                else {
                    console.warn("Layer not visible or not a vector source", layer);
                }
                return true;
            });
        }
    }
};
</script>

<template lang="html">
    <div
        id="wfstUploader"
        class="row"
    >
        <AddonOpenerButton
            :button-text="$t('additional:modules.tools.wfstUploader.uploadButton')"
            :button-class="'mt-3'"
            :addon-id="importerAddonId"
            :addon-name="importerAddonName"
        />
        <span v-if="!selectedFeature">Halten Sie die Strg-Taste gedrückt und klicken Sie auf ein Feature, um es auszuwählen.</span>
        <div v-else>
            <FeaturePropertiesDisplay
                :feature="selectedFeature"
                :title="$t('additional:modules.tools.wfstUploader.selectedFeature')"
                class="mt-3"
            />
            <div class="mt-3">
                Wählen sie einen WFST Layer aus, auf den das Feature hochgeladen werden soll:
            </div>
            <select
                id="wfstUpload-select-wfstlayer"
                v-model="selectedWfstLayer"
                class="form-select mt-3"
            >
                <option
                    v-for="(layer, idx) in wfstLayersForSelection"
                    :key="idx"
                    :value="layer"
                >
                    {{ layer.name }}
                </option>
            </select>
        </div>
    </div>
</template>

<style scoped>
/* Styles for WfstUploader component */
</style>
