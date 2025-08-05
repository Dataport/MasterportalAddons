import getters from "./gettersImporterAddon";
import mutations from "./mutationsImporterAddon";
import actions from "./actionsImporterAddon";
import state from "./stateImporterAddon";

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
};
