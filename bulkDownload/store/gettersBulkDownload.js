import {generateSimpleGetters} from "../../../src/shared/js/utils/generators";
import state from "./stateBulkDownload";

const getters = {
    ...generateSimpleGetters(state)
};

export default getters;
