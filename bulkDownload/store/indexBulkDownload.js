import getters from "./gettersBulkDownload";
import actions from "./actionsBulkDownload";
import mutations from "./mutationsBulkDownload";
import state from "./stateBulkDownload";

export default {
    namespaced: true,
    state: {...state},
    actions,
    mutations,
    getters
};
