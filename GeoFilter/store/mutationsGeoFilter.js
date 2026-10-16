import {generateSimpleMutations} from "@shared/js/utils/generators";
import GeoFilterState from "./stateGeoFilter";

const mutations = {
    ...generateSimpleMutations(GeoFilterState)
};

export default mutations;
