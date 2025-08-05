import {generateSimpleGetters} from "@shared/js/utils/generators";
import WORKFLOWS from "../constants/workflows";
import stateExporterAddon from "./stateExporterAddon";

const getters = {
    ...generateSimpleGetters(stateExporterAddon),

    currentStepInWorkflow (state) {
        const currentStepIndex = WORKFLOWS[state.currentWorkflow].indexOf(state.currentStep);

        return currentStepIndex;
    },

    /**
     * Check if the current step is the first step in the current workflow.
     *
     * @param {Object} state Current state object of the store.
     * @param {Object} otherGetters All store getters.
     * @returns {Boolean} True, if the current step is the first step. False otherwise.
     */
    isFirstStep (state, otherGetters) {
        if (otherGetters.currentStepInWorkflow === undefined) {
            return true;
        }

        return otherGetters.currentStepInWorkflow === 0;
    },

    /**
     * Check if the current step is the last step in the current workflow.
     *
     * @param {Object} state Current state object of the store.
     * @param {Object} otherGetters All store getters.
     * @returns {Boolean} True, if the current step is the last step. False otherwise.
     */
    isLastStep (state, otherGetters) {
        if (otherGetters.currentStepInWorkflow === undefined) {
            return false;
        }

        return otherGetters.currentStepInWorkflow === WORKFLOWS[state.currentWorkflow].length - 1;
    },

    /**
     * Get the next step.
     *
     * @param {Object} state Current state object of the store.
     * @param {Object} otherGetters All store getters.
     * @returns {String | undefined} Name of the next step in the current workflow.
     */
    nextStep (state, otherGetters) {
        if (otherGetters.isLastStep) {
            return undefined;
        }

        return WORKFLOWS[state.currentWorkflow][otherGetters.currentStepInWorkflow + 1];
    },

    /**
     * Get the previous step in the current workflow.
     *
     * @param {Object} state Current state object of the store.
     * @param {Object} otherGetters All store getters.
     * @returns {String | undefined} Name of the previous step in the current workflow.
     */
    prevStep (state, otherGetters) {
        if (otherGetters.isFirstStep) {
            return undefined;
        }

        return WORKFLOWS[state.currentWorkflow][otherGetters.currentStepInWorkflow - 1];
    },

    /**
     * Get the supported export formats for selected layer.
     *
     * @param {Object} state Current state object of the store.
     * @returns {String[]} List of supported export formats.
     */
    supportedExportFormatsForSelectedLayer (state) {
        if (!state.selectedLayer) {
            return [];
        }

        const formatsForLayer = state.selectedLayer.exportFormats
            .filter(format => state.supportedExportFormats.includes(format));

        return formatsForLayer;
    }
};

export default getters;
