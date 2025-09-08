import {generateSimpleMutations} from "@shared/js/utils/generators";
import WfstUploaderState from "./stateWfstUploader";

const mutations = {
    ...generateSimpleMutations(WfstUploaderState)
};

export default mutations;
