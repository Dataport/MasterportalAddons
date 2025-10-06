<script>
import {mapGetters, mapActions, mapMutations} from "vuex";
import FileUpload from "./FileUpload.vue";
import LayerSelection from "./LayerSelection.vue";
import ProvideOgcService from "./ProvideOgcService.vue";
import WorkflowSelection from "./WorkflowSelection.vue";
import StyleLayers from "./StyleLayers.vue";
import getters from "../store/gettersImporterAddon";
import mutations from "../store/mutationsImporterAddon";
import STEPS from "../constants/steps";
import {treeSubjectsKey} from "@shared/js/utils/constants";
import isMobile from "@shared/js/utils/isMobile";
import {applyStyles} from "../utils/layer";
import FlatButton from "@shared/modules/buttons/components/FlatButton.vue";
import buildTreeStructure from "@appstore/js/buildTreeStructure";
import {processLayersForAdding} from "../utils/processLayersForAdding";

/**
 * ImporterAddon
 * @vue-prop {String} side - The side in which the menu component is being rendered.
 */
export default {
    // eslint-disable-next-line vue/multi-word-component-names, vue/match-component-file-name
    name: "Importer",
    components: {
        FileUpload,
        LayerSelection,
        ProvideOgcService,
        WorkflowSelection,
        StyleLayers,
        FlatButton
    },
    computed: {
        ...mapGetters("Modules/Importer", Object.keys(getters)),
        ...mapGetters("Menu", ["mainMenu", "secondaryMenu"]),

        steps () {
            return STEPS;
        },

        layerTreeFolderTitle () {
            switch (this.currentWorkflow) {
                case "wms":
                case "wfs":
                    if (this.selectedLayers[0]?.layers) {
                        return this.selectedLayers[0]?.layers;
                    }
                    this.setImportedFolderCounter();
                    return this.$t("additional:modules.tools.importer.layerTreeFolderTitle", {count: this.importedFolderCounter});

                case "geojson":
                    this.setGeoJsonFolderCounter();
                    return `GeoJSON Import ${this.geoJsonFolderCounter}`;
                case "shapezip":
                    this.setShapeFileFolderCounter();
                    return `Shapefile Import ${this.shapeFileFolderCounter}`;
                case "geopackage":
                    this.setGeoPackageFolderCounter();
                    return `GeoPackage Import ${this.geoPackageFolderCounter}`;
                default:
                    this.setImportedFolderCounter();
                    return this.$t("additional:modules.tools.importer.layerTreeFolderTitle", {count: this.importedFolderCounter});
            }
        },
        currentMenuSide () {
            let menu = null;

            if (this.isModuleInSections(this.mainMenu?.sections, this.type)) {
                menu = "mainMenu";
            }
            else if (this.isModuleInSections(this.secondaryMenu?.sections, this.type)) {
                menu = "secondaryMenu";
            }
            return menu;
        }
    },
    mounted () {
        this.applyTranslationKey(this.name);
    },
    methods: {
        ...mapMutations("Modules/Importer", Object.keys(mutations)),
        ...mapActions("Alerting", {addSingleAlert: "addSingleAlert"}),
        ...mapActions(["addLayerToLayerConfig"]),
        ...mapActions("Menu", ["resetMenu"]),
        applyStyles,
        processLayersForAdding,
        /**
         * Recursively searches for a module type in menu sections
         * @param {Array} sections - The menu sections to search in
         * @param {String} moduleType - The module type to search for
         * @returns {Boolean} True if module is found
        */
        isModuleInSections (sections, moduleType) {
            if (!Array.isArray(sections)) {
                return false;
            }

            return sections.some(section => {
                if (Array.isArray(section)) {
                    return this.isModuleInSections(section, moduleType);
                }
                if (section && typeof section === "object") {
                    if (section.type === moduleType) {
                        return true;
                    }
                    if (section.type === "folder" && section.elements) {
                        return this.isModuleInSections(section.elements, moduleType);
                    }
                    if (section.elements) {
                        return this.isModuleInSections(section.elements, moduleType);
                    }
                }
                return false;
            });
        },

        /**
         * Handler for closing the tool.
         *
         * @returns {void}
         */
        close () {
            this.resetImporterAddon();
            this.resetMenu(this.currentMenuSide);
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
            if (this.isCurrentWorkflowUndefined && this.selectedWorkflow) {
                this.setCurrentWorkflow(this.selectedWorkflow);
            }
            this.setCurrentStep(this.nextWorkflowStep);
        },

        /**
         * Handler for clicking on the finish button.
         *
         * @returns {void}
         */
        async onFinishClick () {
            const processedLayers = this.processLayersForAdding(this.selectedLayers),
                folder = {
                    id: this.layerTreeFolderId,
                    type: "folder",
                    isExternal: true,
                    name: this.layerTreeFolderTitle,
                    elements: processedLayers
                };

            buildTreeStructure.setIdsAtFolders([folder]);
            await this.addLayerToLayerConfig({layerConfig: folder, parentKey: treeSubjectsKey});

            if (isMobile) {
                this.addSingleAlert(i18next.t("additional:modules.tools.importer.completeMessage"));
            }
            this.applyStyles(processedLayers);
            this.close();
        }
    }
};
</script>

<template lang="html">
    <div
        id="importer"
        class="row"
    >
        <hr>
        <div class="importer-addon-wizard-content">
            <div
                v-if="isCurrentWorkflowUndefined"
            >
                <WorkflowSelection
                    :workflows="supportedImportWorkflows"
                />
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
                />
                <StyleLayers
                    v-if="currentStep === steps.styleLayers"
                    :layers="selectedLayers"
                />
            </div>
        </div>
        <div class="importer-addon-wizard-navigation mt-3">
            <FlatButton
                v-if="!isCurrentWorkflowUndefined"
                type="button"
                :text="$t('additional:modules.tools.importer.prev')"
                class="btn btn-default"
                @click="onPrevClick"
            />
            <FlatButton
                v-if="!isLastStep"
                ref="importer-addon-next-btn"
                type="submit"
                :text="$t('additional:modules.tools.importer.next')"
                :class="{btn: true, 'btn-default': !currentFormValid, 'btn-primary': currentFormValid}"
                :disabled="!currentFormValid"
                @click="onNextClick"
            />
            <FlatButton
                v-if="isLastStep"
                ref="importer-addon-finish-btn"
                type="submit"
                :text="$t('additional:modules.tools.importer.finish')"
                :class="{btn: true, 'btn-default': !currentFormValid, 'btn-primary': currentFormValid}"
                :disabled="!currentFormValid"
                @click="onFinishClick"
            />
        </div>
    </div>
</template>

<style lang="scss">

</style>
