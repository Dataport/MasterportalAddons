import stateWienGfi from "./stateWienGfi";
import {generateSimpleMutations} from "../../../MP_Wien/src/shared/js/utils/generators";

const mutations = {
    /**
     * Creates from every state-key a setter.
     * For example, given a state object {key: value}, an object
     * {setKey:   (state, payload) => *   state[key] = payload * }
     * will be returned.
     */
    ...generateSimpleMutations(stateWienGfi),
    addMultiformatItem (state, payload) {
        state.multiformatItems.push(payload);
    }
};

export default mutations;
