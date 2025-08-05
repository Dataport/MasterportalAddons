import {generateSimpleGetters} from "@shared/js/utils/generators";
import stateImporterAddon from "./stateImporterAddon";

import WORKFLOWS from "../constants/workflows";

const getters = {
    ...generateSimpleGetters(stateImporterAddon),

    /**
     * Check if currentWorkflow is undefined.
     *
     * @param {Object} state Current state object of the store.
     * @returns {Boolean} True, if currentWorkflow is undefined. False otherwise.
     */
    isCurrentWorkflowUndefined (state) {
        return state.currentWorkflow === undefined;
    },

    /**
     * Return the steps of the current workflow.
     *
     * @param {Object} state Current state object of the store.
     * @param {Object} otherGetters All store getters.
     * @returns {String[]} List of the steps of the current workflow.
     */
    currentWorkflowSteps (state, otherGetters) {
        if (otherGetters.isCurrentWorkflowUndefined) {
            return [];
        }
        return WORKFLOWS[state.currentWorkflow];
    },

    /**
     * Return the index of the current step in the current workflow.
     *
     * @param {Object} state Current state object of the store.
     * @param {Object} otherGetters All store getters.
     * @returns {Number | undefined} The index of the current step in the current workflow.
     */
    currentStepInWorkflow (state, otherGetters) {
        if (otherGetters.isCurrentWorkflowUndefined) {
            return undefined;
        }
        const currentStepIndex = otherGetters.currentWorkflowSteps.indexOf(state.currentStep);

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

        return otherGetters.currentStepInWorkflow === otherGetters.currentWorkflowSteps.length - 1;
    },

    /**
     * Get the next step in the current workflow.
     *
     * @param {Object} state Current state object of the store.
     * @param {Object} otherGetters All store getters.
     * @returns {String | undefined} Name of the next step in the current workflow.
     */
    nextWorkflowStep (state, otherGetters) {
        if (otherGetters.isLastStep) {
            return undefined;
        }

        return otherGetters.currentWorkflowSteps[otherGetters.currentStepInWorkflow + 1];
    },

    /**
     * Get the previous step in the current workflow.
     *
     * @param {Object} state Current state object of the store.
     * @param {Object} otherGetters All store getters.
     * @returns {String | undefined} Name of the previous step in the current workflow.
     */
    prevWorkflowStep (state, otherGetters) {
        if (otherGetters.isFirstStep) {
            return undefined;
        }

        return otherGetters.currentWorkflowSteps[otherGetters.currentStepInWorkflow - 1];
    },

    /**
     * Get the capabilities base URL.
     *
     * @param {Object} state Current state object of the store.
     * @returns {String} The base URL.
     */
    capabilitiesBaseUrl (state) {
        const url = new URL(state.capabilitiesUrl);

        return url.origin + url.pathname;
    },

    /**
     * Get the names of the selected layers.
     *
     * @param {Object} state Current state object of the store.
     * @returns {String[]} Names of selected layers.
     */
    selectedLayerNamesFromLayers (state) {
        switch (state.currentWorkflow.toLowerCase()) {
            case "wms":
                return state.selectedLayers.map(layer => layer.layers);
            case "wfs":
                return state.selectedLayers.map(
                    layer => layer.featureNS + ":" + layer.featureType);
            default:
                return state.selectedLayers.map(layer => layer.name);
        }
    }
};

export default getters;
