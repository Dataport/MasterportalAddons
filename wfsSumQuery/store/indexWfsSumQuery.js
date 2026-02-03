import actions from "./actionsWfsSumQuery";
import mutations from "./mutationsWfsSumQuery";
import getters from "./gettersWfsSumQuery";
import state from "./stateWfsSumQuery";

export default {
    namespaced: true,
    state: {...state},
    mutations,
    actions,
    getters
};
