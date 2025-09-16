<script>
import {mapActions, mapGetters} from "vuex";
import FlatButton from "@shared/modules/buttons/components/FlatButton.vue";
import InputText from "@shared/modules/inputs/components/InputText.vue";
import SpinnerItem from "@shared/modules/spinner/components/SpinnerItem.vue";
import wfs from "@masterportal/masterportalapi/src/layer/wfs";
import mapCollection from "@core/maps/js/mapCollection";
import AddonOpenerButton from "../../AddonOpenerButton.vue";
import FeaturePropertiesDisplay from "./FeaturePropertiesDisplay.vue";
import VectorSource from "ol/source/Vector.js";
import {Select} from "ol/interaction";
import getHighlightType from "../utils/getHighlightType";
import validateGeometryCompatibility from "../utils/validateGeometryCompatibility";
import getHighlightStyleFromType from "../utils/getHighlightStyleFromType";

export default {
    name: "WfstUploader",
    components: {
        AddonOpenerButton,
        FeaturePropertiesDisplay,
        FlatButton,
        InputText,
        SpinnerItem
    },
    data () {
        return {
            importerAddonId: "importerAddon",
            importerAddonName: "Import",
            selectInteraction: null,
            selectEvent: null,
            selectedWfstLayer: null,
            selectedFeature: null,
            wfsFeatureProperties: null,
            isloading: false,
            errorMessage: null,
            highlightFeatureObject: {}
        };
    },
    computed: {
        ...mapGetters("Modules/WfstUploader", ["wfstLayers", "wfstAttributesForInput", "highlightStyles"]),
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
        selectedWfstLayer () {
            this.getFeaturePropertiesFromWFST();
        }
    },
    mounted () {
        this.createInteractions();
        this.selectedWfstLayer = this.wfstLayersForSelection[0] || null;
    },
    unmounted () {
        this.reset();
        this.removeInteraction(this.selectEvent);
    },
    methods: {
        ...mapActions("Modules/WfstUploader", ["uploadFeature"]),
        ...mapActions("Maps", ["addInteraction", "removeInteraction", "highlightFeature", "removeHighlightFeature"]),
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
                pixel = map.getPixelFromCoordinate(coordinate),
                pointFeature = ["Point", "MultiPoint"];

            this.reset();

            map.forEachFeatureAtPixel(pixel, (feature, layer) => {
                if (!layer) {
                    console.warn("No layer found for feature", feature);
                    return true;
                }

                if (layer.get("visible") && layer.get("source") instanceof VectorSource) {
                    this.selectedFeature = feature;
                    this.highlightFeatureObject.feature = this.selectedFeature;
                    this.highlightFeatureObject.type = getHighlightType(feature);
                    this.highlightFeatureObject.layer = layer;
                    // reset style for point features does not work so we skip highlighting points. The default is an increase of scale.
                    if (!pointFeature.includes(this.selectedFeature.getGeometry().getType())) {
                        this.highlightFeatureObject.layer.id = this.selectedWfstLayer?.id;
                        this.highlightFeatureObject.styleId = this.visibleLayerConfigs.find(l => l.id === this.selectedWfstLayer?.id)?.styleId;
                        this.highlightFeatureObject.highlightStyle = getHighlightStyleFromType(this.selectedFeature.getGeometry()?.getType(), this.highlightStyles);
                    }
                    this.highlightFeature(this.highlightFeatureObject);
                }
                else {
                    console.warn("Layer not visible or not a vector source", layer);
                }
                return true;
            });
        },
        async getFeaturePropertiesFromWFST () {
            this.isloading = true;
            this.wfsFeatureProperties = null;
            this.errorMessage = null; // Reset error message when changing layer

            const {url, version, featureType, isSecured} = this.layerConfigById(this.selectedWfstLayer.id),
                properties = await wfs.receivePossibleProperties(url, version, featureType, isSecured ?? false);

            if (this.wfstAttributesForInput !== "all") {
                this.wfsFeatureProperties = properties.filter(prop => this.wfstAttributesForInput.includes(prop.label));
            }
            else {
                this.wfsFeatureProperties = properties;
            }
            this.isloading = false;
        },
        /**
         * Updates a property value in the wfsFeatureProperties array
         * @param {Number} index The index of the property to update
         * @param {String} value The new value
         */
        updatePropertyValue (index, value) {
            if (this.wfsFeatureProperties && this.wfsFeatureProperties[index]) {
                this.wfsFeatureProperties[index].value = value;
            }
        },
        async uploadFeatureForTransaction () {
            this.errorMessage = null;

            const targetLayer = this.layerConfigById(this.selectedWfstLayer.id);

            if (!validateGeometryCompatibility(this.selectedFeature, targetLayer)) {
                const featureGeometryType = this.selectedFeature.getGeometry().getType();

                this.errorMessage = this.$t("additional:modules.tools.wfstUploader.geometryTypeConflict", {featureGeometryType});
                console.warn(this.errorMessage);
                return;
            }

            try {
                const payload = {
                    feature: this.selectedFeature,
                    properties: this.wfsFeatureProperties,
                    targetLayer: targetLayer
                };

                await this.uploadFeature(payload);
            }
            catch (error) {
                this.errorMessage = this.$t("additional:modules.tools.wfstUploader.uploadError");
                console.error("Error uploading the feature:", error);
            }
            finally {
                this.reset();
            }
        },
        reset () {
            this.removeHighlightFeature(this.selectedFeature);
            this.selectedFeature = null;
            this.errorMessage = null;
            this.highlightFeatureObject = {};
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
        <span v-if="!selectedFeature">{{ $t('additional:modules.tools.wfstUploader.selectFeatureHint') }}</span>
        <div v-else>
            <!-- Error message display -->
            <div
                v-if="errorMessage"
                class="alert alert-danger mt-3"
                role="alert"
            >
                {{ errorMessage }}
            </div>

            <FeaturePropertiesDisplay
                :feature="selectedFeature"
                :title="$t('additional:modules.tools.wfstUploader.selectedFeature')"
                class="mt-3"
            />
            <div class="mt-3 font-size-big">
                {{ $t('additional:modules.tools.wfstUploader.selectedWfstLayer') }}
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
            <SpinnerItem v-if="isloading" />
            <div class="mt-4 mb-3 font-size-big">
                {{ $t('additional:modules.tools.wfstUploader.properties') }}
            </div>
            <div v-if="wfsFeatureProperties">
                <InputText
                    v-for="(property, idx) in wfsFeatureProperties"
                    :id="`wfs-property-${idx}`"
                    :key="idx"
                    :type="property.type"
                    :label="property.label"
                    :placeholder="property.label"
                    :model-value="property.value || ''"
                    @update:model-value="updatePropertyValue(idx, $event)"
                />
            </div>
            <FlatButton
                class="mt-3"
                :disabled="!selectedWfstLayer"
                :text="$t('additional:modules.tools.wfstUploader.resetButton')"
                @click="reset()"
            />
            <FlatButton
                class="mt-3"
                :disabled="!selectedWfstLayer"
                :text="$t('additional:modules.tools.wfstUploader.uploadFeatureButton')"
                @click="uploadFeatureForTransaction"
            />
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";

.font-size-big {
    font-size: $font_size_big;
}
</style>
