import {DEFAULT_VALUES} from "../store/stateExporterAddon";
import STEPS from "../constants/steps";

/**
 * Get the reset values for non step related state variables.
 *
 * @returns {Object} An object where each key-value pair represents a state variable and its reset value.
 */
export function getBasicResetValues () {
    return {
        currentWorkflow: DEFAULT_VALUES.currentWorkflow,
        currentStep: DEFAULT_VALUES.currentStep,
        currentFormValid: DEFAULT_VALUES.currentFormValid,
        capabilitiesUrl: DEFAULT_VALUES.capabilitiesUrl
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
        case STEPS.selectLayer:
            resetValues = {
                selectedLayer: DEFAULT_VALUES.selectedLayer,
                // we have to make sure to create a new object reference here
                layerSelectionList: []
            };
            break;
        case STEPS.downloadLayer:
            resetValues = {
                selectedExportFormat: DEFAULT_VALUES.selectedExportFormat
            };
            break;
        case STEPS.selectExternalWfsLayer:
            resetValues = {
                selectedLayer: DEFAULT_VALUES.selectedLayer,
                // we have to make sure to create a new object reference here
                layerSelectionList: []
            };
            break;
        default:
            resetValues = {};
    }

    return resetValues;
}
