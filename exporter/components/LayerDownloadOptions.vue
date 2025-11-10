<script>
import {mapGetters, mapActions, mapMutations} from "vuex";
import RadioButton from "./RadioButton.vue";

import mutations from "../store/mutationsExporterAddon";

import LAYERTYPES from "../constants/layertypes";

export default {
    name: "LayerDownloadOptions",
    components: {
        RadioButton
    },
    data () {
        return {
            inputValid: true
        };
    },
    computed: {
        ...mapGetters("Modules/Exporter", [
            "selectedLayer",
            "supportedExportFormatsForSelectedLayer",
            "selectedExportFormat",
            "selectedBoundary"
        ]),
        layertypes () {
            return LAYERTYPES;
        }
    },
    created () {
        const isValid = this.isFormValid();

        this.setCurrentFormValid(isValid);
    },
    methods: {
        ...mapActions("Modules/Exporter", [
        ]),
        ...mapMutations("Modules/Exporter", Object.keys(mutations)),

        /**
         * Handler for the radio change events.
         *
         * @param {String} value - The selected format value.
         * @returns {void}
         */
        onRadioChange (value) {
            this.setSelectedExportFormat(value);
            this.inputValid = this.isFormValid();
            this.setCurrentFormValid(this.isFormValid());
        },

        /**
         * Check if the form is valid.
         *
         * @returns {Boolean} True, if form is valid. False otherwise.
         */
        isFormValid () {
            const formatIsSelected = Boolean(this.selectedExportFormat);

            return formatIsSelected;
        }
    }
};
</script>

<template lang="html">
    <div class="exporter-addon-layer-download-options">
        <form>
            <div class="input-group">
                <span class="format-selection-text">
                    {{ $t("additional:modules.tools.exporter.formatSelectionText") }}
                </span>
                <div
                    v-for="format in supportedExportFormatsForSelectedLayer"
                    :key="format"
                    class="format-selection-buttons"
                >
                    <RadioButton
                        :id="`exporter-format-radio-${format}`"
                        :value="format"
                        :selected-value="selectedExportFormat"
                        :text="format"
                        name="format-selection"
                        @change="onRadioChange"
                    />
                </div>
            </div>
        </form>
    </div>
</template>

<style lang="scss" scoped>
    .input-group {
        padding-bottom: 0.625rem;
        padding-left: 0.625rem;
        display: block;

        .format-selection-text {
            font-size: large;
            margin-bottom: 0.5rem;
        }
    }

    .format-selection-buttons {
        margin: 0.25rem 0;
    }
</style>
