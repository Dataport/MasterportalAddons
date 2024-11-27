import wienGfiState from "./stateWienGfi";
import {generateSimpleGetters} from "../../../MP_Wien/src/shared/js/utils/generators";

const getters = {
    ...generateSimpleGetters(wienGfiState),
    matchAttributes: (state) => state.activeFeature.getTheme().matchAttributes || state.matchAttributes,
    download: (state) => state.activeFeature.getTheme().download || state.download,
    valueConverters: (state) => state.activeFeature.getTheme().valueConverters || state.valueConverters,
    tableAttributes: (state) => state.activeFeature.getTheme().tableAttributes || state.tableAttributes,
    paginationKey: (state) => state.activeFeature.getTheme().paginationKey || state.paginationKey,
    dropDownAttributeKey: (state) => state.activeFeature.getTheme().dropDownAttributeKey || state.dropDownAttributeKey,
    attributions: (state) => state.activeFeature.getTheme().attributions || state.attributions,
    captions: (state) => state.activeFeature.getTheme().captions || state.captions
};

export default getters;
