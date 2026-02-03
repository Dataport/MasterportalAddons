import {generateSimpleGetters} from "../../../src/shared/js/utils/generators";
import StrassenBefahrungState from "./stateStrassenBefahrung";

const getters = {
    ...generateSimpleGetters(StrassenBefahrungState)
};

export default getters;
