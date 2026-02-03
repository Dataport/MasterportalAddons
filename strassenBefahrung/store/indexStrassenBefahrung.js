import getters from "./gettersStrassenBefahrung";
import mutations from "./mutationsStrassenBefahrung";
import state from "./stateStrassenBefahrung";

export default {
    namespaced: true,
    state: {...state},
    mutations,
    getters
};
