import {generateSimpleMutations} from "@shared/js/utils/generators";
import stateExporterAddon from "./stateExporterAddon";
import {getBasicResetValues, getStepResetValues} from "../utils/resetStep";
import STEPS from "../constants/steps";

const mutations = {
    /**
     * Creates from every state-key a setter.
     * For example, given a state object {key: value}, an object
     * {setKey:   (state, payload) => *   state[key] = payload * }
     * will be returned.
     */
    ...generateSimpleMutations(stateExporterAddon),

    /**
     * If name from config.json starts with "translate#", the corrected key is set to name here.
     * @param {object} state of this component
     * @param {String} payload name of this component
     * @returns {void}
     */
    applyTranslationKey: (state, payload) => {
        if (payload && payload.indexOf("translate#") > -1) {
            state.name = payload.substr("translate#".length);
        }
    },

    /**
     * Reset the state variables of the exporterAddon to their initial values.
     *
     * @param {Object} state of this component
     * @returns {void}
     */
    resetExporterAddon: (state) => {
        // TODO
        const basicResetValues = getBasicResetValues(),
            selectLayersResetValues = getStepResetValues(STEPS.selectLayer),
            downloadLayersResetValues = getStepResetValues(STEPS.downloadLayer),
            resetValues = {
                ...basicResetValues,
                ...selectLayersResetValues,
                ...downloadLayersResetValues
            };

        for (const key in resetValues) {
            state[key] = resetValues[key];
        }
    },

    /**
     * Reset the state of the given step.
     *
     * @param {Object} state of this component
     * @param {Object} payload payload for this mutation.
     * @param {String} payload.stepName The name of the step to reset.
     * @returns {void}
     */
    resetStep: (state, payload) => {
        const stepResetValues = getStepResetValues(payload.stepName);

        for (const key in stepResetValues) {
            state[key] = stepResetValues[key];
        }
    }
};

export default mutations;
