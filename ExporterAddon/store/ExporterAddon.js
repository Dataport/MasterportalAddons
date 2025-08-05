import getters from "./gettersExporterAddon";
import mutations from "./mutationsExporterAddon";
import actions from "./actionsExporterAddon";
import state from "./stateExporterAddon";

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
};
