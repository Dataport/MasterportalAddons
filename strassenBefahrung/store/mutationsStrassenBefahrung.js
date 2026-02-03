import {generateSimpleMutations} from "../../../src/shared/js/utils/generators";
import stateStrassenBefahrung from "./stateStrassenBefahrung";

const mutations = {
    /**
     * Creates from every state-key a setter.
     * For example, given a state object {key: value}, an object
     * {setKey:   (state, payload) => *   state[key] = payload * }
     * will be returned.
     */
    ...generateSimpleMutations(stateStrassenBefahrung),

    /**
     * If name from config.json starts with "translate#", the corrected key is set to name here.
     * @param {object} state of this component
     * @param {string} payload name of this component
     * @returns {void}
     */
    applyTranslationKey: (state, payload) => {
        if (payload && payload.indexOf("translate#") > -1) {
            state.name = payload.substr("translate#".length);
        }
    },
    setEnnLayer: (state, ennLayer) => {
        console.log("setEnnLayer", ennLayer)
        state.ennLayer = ennLayer;
    },
    setMarkerLayer: (state, markerLayer) => {
        console.log("setMarkerLayer", markerLayer)
        state.markerLayer = markerLayer;
    },
    setCoords: (state, coords) => {
        state.coords = coords;
    },
};

export default mutations;
