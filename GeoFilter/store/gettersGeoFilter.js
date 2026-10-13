import {generateSimpleGetters} from "@shared/js/utils/generators";
import GeoFilterState from "./stateGeoFilter";

const getters = {
    ...generateSimpleGetters(GeoFilterState)
};

export default getters;
