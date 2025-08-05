import {DEFAULT_VALUES} from "../store/stateImporterAddon";
import STEPS from "../constants/steps";

/**
 * Get the reset values for non step related state variables.
 *
 * @returns {Object} An object where each key-value pair represents a state variable and its reset value.
 */
export function getBasicResetValues () {
    return {
        currentWorkflow: DEFAULT_VALUES.currentWorkflow,
        selectedWorkflow: DEFAULT_VALUES.selectedWorkflow,
        currentStep: DEFAULT_VALUES.currentStep,
        currentFormValid: DEFAULT_VALUES.currentFormValid
    };
}

/**
 * Get the reset values for requested step.
 *
 * @param {String} stepName The name of the step to get the values for.
 * @returns {Object} An object where each key-value pair represents a state variable and its reset value.
 */
export function getStepResetValues (stepName) {
    let resetValues;

    switch (stepName) {
        case STEPS.provideOgcService:
            resetValues = {
                capabilitiesUrl: DEFAULT_VALUES.capabilitiesUrl
            };
            break;
        case STEPS.selectLayers:
            resetValues = {
                // Object references will remain, so we cannot use the default value here.
                selectedLayers: [],
                capabilitiesVersion: DEFAULT_VALUES.capabilitiesVersion
            };
            break;
        case STEPS.uploadFile:
            resetValues = {
                inputFile: DEFAULT_VALUES.inputFile,
                // Object references will remain, so we cannot use the default value here.
                selectedLayers: []
            };
            break;
        case STEPS.styleLayers:
        default:
            resetValues = {};
    }

    return resetValues;
}
