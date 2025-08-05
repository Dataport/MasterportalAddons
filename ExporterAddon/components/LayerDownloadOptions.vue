<script>
import {mapGetters, mapActions, mapMutations} from "vuex";

import mutations from "../store/mutationsExporterAddon";

import LAYERTYPES from "../constants/layertypes";

export default {
    name: "LayerDownloadOptions",
    data () {
        return {
            inputValid: true
        };
    },
    computed: {
        ...mapGetters("Modules/ExporterAddon", [
            "selectedLayer",
            "supportedExportFormatsForSelectedLayer",
            "selectedExportFormat",
            "selectedBoundary"
        ]),
        layertypes () {
            return LAYERTYPES;
        },
        formatRadioValue: {
            get () {
                return this.selectedExportFormat;
            },
            set (value) {
                this.setSelectedExportFormat(value);
            }
        }
    },
    created () {
        const isValid = this.isFormValid();

        this.setCurrentFormValid(isValid);
    },
    methods: {
        ...mapActions("Modules/ExporterAddon", [
        ]),
        ...mapMutations("Modules/ExporterAddon", Object.keys(mutations)),

        /**
         * Handler for the radio change events.
         *
         * @returns {void}
         */
        onRadioChange () {
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
            <!--
                Note: Selection of boundary (complete dataset vs current map extent)
                was implemented, but removed.
                Last commit that contains the selection of boundary is
                0e3191c2b1a685b13c5acb1eb6f6032a3e8db3ae
            -->
            <div class="input-group">
                <span>
                    {{ $t("additional:modules.tools.exporterAddon.formatSelectionText") }}
                </span>
                <div
                    v-for="format in supportedExportFormatsForSelectedLayer"
                    :key="format"
                    class="form-check"
                >
                    <!-- TODO select first format by default -->
                    <input
                        :id="`exporter-format-radio-${format}`"
                        v-model="formatRadioValue"
                        type="radio"
                        class="form-check-input"
                        name="exporter-format-radio"
                        :value="format"
                        @change="onRadioChange"
                    >
                    <label
                        class="form-check-label"
                        :for="`exporter-format-radio-${format}`"
                    >
                        {{ format }}
                    </label>
                </div>
            </div>
        </form>
    </div>
</template>

<style lang="scss" scoped>
    .input-group {
        padding-bottom: 10px;
        padding-left: 10px;
        display: block;
    }
</style>
