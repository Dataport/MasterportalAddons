<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import AddonOpenerButton from "../../AddonOpenerButton.vue";
import VectorSource from "ol/source/Vector.js";
import {Select} from "ol/interaction";

export default {
    name: "WfstUploader",
    components: {
        AddonOpenerButton
    },
    data () {
        return {
            importerAddonId: "importerAddon",
            importerAddonName: "Import",
            selectInteraction: null,
            selectEvent: null
        };
    },
    computed: {
        ...mapGetters("Modules/WfstUploader", ["selectedFeature"])
    },
    watch: {
        selectedFeature (newFeature, oldFeature) {
            console.log("feature-selected event", newFeature);
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
    </div>
</template>

<style scoped></style>
