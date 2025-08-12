<script>
import {mapGetters, mapActions, mapMutations} from "vuex";

import LayerDownloadOptions from "./LayerDownloadOptions.vue";
import LayerSelection from "./LayerSelection.vue";

import getters from "../store/gettersExporterAddon";
import mutations from "../store/mutationsExporterAddon";

import {downloadLayer} from "../utils/download";

import STEPS from "../constants/steps";
import FlatButton from "@shared/modules/buttons/components/FlatButton.vue";

export default {
    name: "ExporterAddon",
    components: {
        LayerDownloadOptions,
        LayerSelection,
        FlatButton
    },
    data () {
        return {
            isLoading: false
        };
    },
    computed: {
        ...mapGetters("Modules/ExporterAddon", Object.keys(getters)),

        steps () {
            return STEPS;
        }
    },
    mounted () {
        this.applyTranslationKey(this.name);
    },
    methods: {
        ...mapActions("Modules/ExporterAddon", [
        ]),
        ...mapMutations("Modules/ExporterAddon", Object.keys(mutations)),

        /**
         * Handler for closing the tool.
         *
         * @returns {void}
         */
        close () {
            this.resetExporterAddon();
            this.setActive(false);
        },

        /**
         * Handler for clicking on the previous button.
         *
         * @returns {void}
         */
        onPrevClick () {
            this.resetStep({stepName: this.currentStep});
            this.setCurrentStep(this.prevStep);
        },

        /**
         * Handler for clicking on the next button.
         *
         * @returns {void}
         */
        onNextClick () {
            this.setCurrentStep(this.nextStep);
        },

        /**
         * Handler for clicking on the finish button.
         *
         * @returns {void}
         */
        async onFinishClick () {
            this.isLoading = true;
            try {
                await downloadLayer(this.selectedLayer, this.selectedExportFormat);
            }
            catch (e) {
                let msg = i18next.t("additional:modules.tools.exporterAddon.downloadFailedForFormat");

                if (e.sender === "shapeUnsupportedMultiPolygon") {
                    msg = i18next.t("additional:modules.tools.exporterAddon.shapeUnsupportedMultiPolygon");
                }
                this.$store.dispatch("Alerting/addSingleAlert", {
                    content: msg
                }, {root: true});
            }
            finally {
                this.isLoading = false;
            }

            if (this.onExportFinished) {
                this.onExportFinished();
                this.setOnExportFinished(undefined);
            }
            this.close();
        }
    }
};
</script>


<template>
    <div
        id="exporterAddon"
        class="row"
    >
        <hr>
        <div v-if="isLoading">
            {{ $t("additional:modules.tools.exporterAddon.loadingText") }}
        </div>
        <div v-if="!isLoading">
            <div class="exporter-addon-wizard-content">
                <LayerSelection
                    v-if="currentStep === steps.selectLayer"
                />
                <LayerDownloadOptions
                    v-if="currentStep === steps.downloadLayer"
                />
            </div>
            <div class="exporter-addon-wizard-navigation">
                <FlatButton
                    v-if="!isFirstStep"
                    :text="$t(`additional:modules.tools.exporterAddon.prev`)"
                    class="btn btn-default"
                    @click="onPrevClick"
                />
                <FlatButton
                    v-if="!isLastStep"
                    :text="$t(`additional:modules.tools.exporterAddon.next`)"
                    class="btn btn-default"
                    :disabled="!currentFormValid"
                    @click="onNextClick"
                />
                <FlatButton
                    v-if="isLastStep"
                    :text="$t(`additional:modules.tools.exporterAddon.finish`)"
                    class="btn btn-default"
                    :disabled="!currentFormValid"
                    @click="onFinishClick"
                />
            </div>
        </div>
    </div>
</template>

<style lang="scss">
</style>
