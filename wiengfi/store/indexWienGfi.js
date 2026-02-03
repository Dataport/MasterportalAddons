import getters from "./gettersWienGfi";
import mutations from "./mutationsWienGfi";
import state from "./stateWienGfi";

export default {
    namespaced: true,
    state: {...state},
    mutations,
    getters
};
