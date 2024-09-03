import {generateSimpleMutations} from "../../../src/shared/js/utils/generators";
import state from "./stateBulkDownload";

const mutations = {
    ...generateSimpleMutations(state)
};

export default mutations;
