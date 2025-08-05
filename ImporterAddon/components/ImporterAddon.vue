<script>
import {mapGetters, mapActions, mapMutations} from "vuex";

import FileUpload from "./FileUpload.vue";
import LayerSelection from "./LayerSelection.vue";
import ProvideOgcService from "./ProvideOgcService.vue";
import WorkflowSelection from "./WorkflowSelection.vue";
import StyleLayers from "./StyleLayers.vue";

import getters from "../store/gettersImporterAddon";
import mutations from "../store/mutationsImporterAddon";

import {setLayerTreeFolderTitle, layerTreeFolderExists, addLayerTreeFolder} from "../utils/layerTreeFolder";

import STEPS from "../constants/steps";
import {treeBaselayersKey, treeSubjectsKey} from "@shared/js/utils/constants";
import sortBy from "@shared/js/utils/sortBy";
import {addLayersToMap, applyStyles} from "../utils/layer";

import isMobile from "@shared/js/utils/isMobile";

/**
 * ImporterAddon
 * @vue-prop {String} side - The side in which the menu component is being rendered.
 */
export default {
    name: "ImporterAddon",
    components: {
        FileUpload,
        LayerSelection,
        ProvideOgcService,
        WorkflowSelection,
        StyleLayers
    },
    computed: {
        ...mapGetters("Modules/ImporterAddon", Object.keys(getters)),
        ...mapGetters(["allLayerConfigsStructured", "showLayerAddButton", "portalConfig"]),
        ...mapGetters("Modules/LayerTree", ["menuSide"]),
        ...mapGetters("Modules/LayerSelection", {layerSelectionType: "type", layerSelectionName: "name"}),

        steps () {
            return STEPS;
        },

        layerTreeFolderTitle () {
            return this.$t("additional:modules.tools.importerAddon.layerTreeFolderTitle");
        }
    },
    watch: {
        layerTreeFolderTitle: function () {
            setLayerTreeFolderTitle(this.layerTreeFolderTitle, this.layerTreeFolderId);
        }
    },
    created () {
        // only generate layerTreeFolderId once
        if (!this.layerTreeFolderId) {
            this.generateLayerTreeFolderId();
        }
        //this.$on("close", this.close); // TODO auskommentiert, weil fehlerhaft
    },
    mounted () {
        this.applyTranslationKey(this.name);
    },
    methods: {
        ...mapActions("Modules/ImporterAddon", []),
        ...mapMutations("Modules/ImporterAddon", Object.keys(mutations)),
        ...mapActions("Alerting", {addSingleAlert: "addSingleAlert"}),
        ...mapActions(["addLayerToLayerConfig"]),
        ...mapActions("Modules/LayerSelection", ["navigateForward"]),
        ...mapActions("Menu", ["changeCurrentComponent", "resetMenu"]),
        ...mapMutations("Modules/LayerSelection", {setLayerSelectionVisible: "setVisible"}),

        /**
         * Handler for closing the tool.
         *
         * @returns {void}
         */
        close () {
            this.resetImporterAddon();
            this.resetMenu("secondaryMenu"); // TODO "secondaryMenu" dynamisch!!!
        },

        /**
         * Sorts the configs by type: first folder, then layer.
         * @param {Array} configs list of layer and folder configs
         * @returns {Array} the sorted configs
         */
        sort (configs) {
            return sortBy(configs, (conf) => conf.type !== "folder");
        },

        /**
         * Shows the component LayerSelection and sets it visible.
         * @returns {void}
         */
        showLayerSelection () {
            const subjectDataLayerConfs = this.sort(this.allLayerConfigsStructured(treeSubjectsKey)),
                baselayerConfs = this.allLayerConfigsStructured(treeBaselayersKey);

            this.changeCurrentComponent({type: this.layerSelectionType, side: this.menuSide, props: {name: this.layerSelectionName}});
            this.navigateForward({lastFolderName: "root", subjectDataLayerConfs, baselayerConfs});
            this.setLayerSelectionVisible(true);
        },

        /**
         * Handler for clicking on the previous button.
         *
         * @returns {void}
         */
        onPrevClick () {
            if (!this.prevWorkflowStep) {
                this.setCurrentWorkflow(undefined);
            }
            this.resetStep({stepName: this.currentStep});
            this.setCurrentStep(this.prevWorkflowStep);
        },

        /**
         * Handler for clicking on the next button.
         *
         * @returns {void}
         */
        onNextClick () {
            if (this.isCurrentWorkflowUndefined) {
                this.setCurrentWorkflow(this.selectedWorkflow);
            }
            this.setCurrentStep(this.nextWorkflowStep);
        },

        /**
         * Handler for clicking on the finish button.
         *
         * @returns {void}
         */
        onFinishClick () {
            if (!layerTreeFolderExists(this.layerTreeFolderId)) {
                // TODO statt ID besser Name prüfen

                // alte Lösung ließ auch doppelten Import zu --> doppelt mit unterschiedlichen Styles --> ist das nachlässig oder doch gewollt

                addLayerTreeFolder(this.layerTreeFolderTitle, this.layerTreeFolderId);
                const folder = {
                    type: "folder",
                    //isExternal: true,
                    name: this.layerTreeFolderTitle,
                    elements: this.selectedLayers
                };

                this.addLayerToLayerConfig({layerConfig: folder, parentKey: treeSubjectsKey}).then((addedLayer) => {
                    if (addedLayer) {
                        this.addSingleAlert({
                            content: this.$t("common:modules.addWMS.completeMessage"),
                            category: "success",
                            title: this.$t("common:modules.addWMS.alertTitleSuccess")});
                    }
                    else {
                        this.addSingleAlert({
                            content: this.$t("common:modules.addWMS.alreadyAdded"),
                            category: "warning",
                            title: this.$t("common:modules.addWMS.errorTitle")});
                    }
                });
            }

            // addLayersToMap(this.selectedLayers); stattdessen:
            this.showLayerSelection();
            // geht so nicht und für trigger click fehlt ref
            // this.$emit("showNode", this.layerTreeFolderTitle, this.selectedLayers);

            if (isMobile) {
                this.addSingleAlert(i18next.t("additional:modules.tools.importerAddon.completeMessage", {count: this.selectedLayers.length}));
            }
            // TODO styleID!!! wird nicht gefunden
            // applyStyles(this.selectedLayers);
            this.close();
            if (this.onImportFinished) {
                this.onImportFinished();
                this.setOnImportFinished(undefined);
            }
        },

        onFormSubmit (evt) {
            evt.preventDefault();
        }
    }
};
</script>

<template lang="html">
    <div
        id="importerAddon"
    >
        <form @submit="onFormSubmit">
            <div class="importer-addon-wizard-content">
                <div
                    v-if="isCurrentWorkflowUndefined"
                >
                    {{ $t("additional:modules.tools.importerAddon.selectWorkflowText") }}
                    <WorkflowSelection :workflows="supportedImportWorkflows" />
                </div>
                <div
                    v-if="!isCurrentWorkflowUndefined"
                >
                    <ProvideOgcService
                        v-if="currentStep === steps.provideOgcService"
                        :service-type="currentWorkflow"
                    />
                    <LayerSelection
                        v-if="currentStep === steps.selectLayers"
                        :service-type="currentWorkflow"
                        :capabilities-url="capabilitiesUrl"
                    />
                    <FileUpload
                        v-if="currentStep === steps.uploadFile"
                        :service-type="currentWorkflow"
                        :fileupload-icon="fileUploadIcon"
                        :removefile-icon="removeFileIcon"
                    />
                    <StyleLayers
                        v-if="currentStep === steps.styleLayers"
                        :layers="selectedLayers"
                    />
                </div>
            </div>
            <div class="importer-addon-wizard-navigation">
                <button
                    v-if="!isCurrentWorkflowUndefined"
                    type="button"
                    class="btn btn-default"
                    @click="onPrevClick"
                >
                    {{ $t("additional:modules.tools.importerAddon.prev") }}
                </button>
                <button
                    v-if="!isLastStep"
                    ref="importer-addon-next-btn"
                    type="submit"
                    :class="{btn: true, 'btn-default': !currentFormValid, 'btn-primary': currentFormValid}"
                    :disabled="!currentFormValid"
                    @click="onNextClick"
                >
                    {{ $t("additional:modules.tools.importerAddon.next") }}
                </button>
                <button
                    v-if="isLastStep"
                    ref="importer-addon-finish-btn"
                    type="submit"
                    :class="{btn: true, 'btn-default': !currentFormValid, 'btn-primary': currentFormValid}"
                    :disabled="!currentFormValid"
                    @click="onFinishClick"
                >
                    {{ $t("additional:modules.tools.importerAddon.finish") }}
                </button>
            </div>
        </form>
    </div>
</template>

<style lang="scss">
  #sidebar {
      // dont let the sidebar go beyond the footer
      height: calc(100% - 30px) !important;
  }
</style>
