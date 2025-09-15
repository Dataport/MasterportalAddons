<script>
import {mapActions, mapGetters} from "vuex";
import FlatButton from "@shared/modules/buttons/components/FlatButton.vue";
import InputText from "@shared/modules/inputs/components/InputText.vue";
import SpinnerItem from "@shared/modules/spinner/components/SpinnerItem.vue";
import wfs from "@masterportal/masterportalapi/src/layer/wfs";
import layerCollection from "@core/layers/js/layerCollection";
import mapCollection from "@core/maps/js/mapCollection";
import AddonOpenerButton from "../../AddonOpenerButton.vue";
import FeaturePropertiesDisplay from "./FeaturePropertiesDisplay.vue";
import VectorSource from "ol/source/Vector.js";
import {Select} from "ol/interaction";
import getHighlightType from "../utils/getHighlightType";
import validateGeometryCompatibility from "../utils/validateGeometryCompatibility";

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
        ...mapGetters("Modules/WfstUploader", ["wfstLayers", "wfstAttributesForInput"]),
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
        },
        wfsFeatureProperties: {
            handler (newVal, oldVal) {
                if (newVal && oldVal) {
                    this.onPropertiesChanged(newVal);
                }
            },
            deep: true
        }
    },
    mounted () {
        this.createInteractions();
    },
    unmounted () {
        this.removeHighlightFeature(this.selectedFeature);
        this.selectedFeature = null;
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
                pixel = map.getPixelFromCoordinate(coordinate);

            this.errorMessage = null;

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
        /**
         * Called when WFS feature properties change
         * @param {Array} properties The updated properties array
         */
        onPropertiesChanged (properties) {
            // Handle property changes here
            // You can validate, format, or trigger other actions
            properties.forEach((prop) => {
                if (prop.value !== undefined && prop.value !== null && prop.value !== "") {
                    // Property has a value - you can add validation logic here
                }
            });
        },
        async uploadFeatureForTransaction () {
            this.errorMessage = null;

            const targetLayer = this.layerConfigById(this.selectedWfstLayer.id);

            if (!validateGeometryCompatibility(this.selectedFeature, targetLayer)) {
                const featureGeometryType = this.selectedFeature.getGeometry().getType(),
                    layerSource = layerCollection.getLayerById(targetLayer.id).getLayerSource(),
                    existingFeatures = layerSource.getFeatures(),
                    expectedGeometryType = existingFeatures.length > 0 ? existingFeatures[0].getGeometry().getType() : "unbekannt";

                this.errorMessage = `Geometrietyp-Konflikt: Das ausgewählte Feature hat den Geometrietyp "${featureGeometryType}", aber der WFST-Layer erwartet "${expectedGeometryType}".`;
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
                this.errorMessage = "Fehler beim Hochladen des Features. Überprüfen Sie die Konsole für weitere Details.";
                console.error("Fehler beim Hochladen des Features:", error);
            }
            finally {
                this.removeHighlightFeature(this.selectedFeature);
                this.selectedFeature = null;
            }
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
            <div class="mt-3">
                Wählen sie einen WFST Layer aus, auf den das Feature hochgeladen werden soll:
            </div>
            <select
                id="wfstUpload-select-wfstlayer"
                v-model="selectedWfstLayer"
                class="form-select mt-3 mb-3"
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
                text="Verwerfen"
                @click="selectedFeature = null"
            />
            <FlatButton
                class="mt-3"
                :disabled="!selectedWfstLayer"
                text="Hochladen"
                @click="uploadFeatureForTransaction"
            />
        </div>
    </div>
</template>

<style scoped>
/* Styles for WfstUploader component */
</style>
