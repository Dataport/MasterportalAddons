import {generateSimpleGetters} from "@shared/js/utils/generators";
import WfstUploaderState from "./stateWfstUploader";

const getters = {
    ...generateSimpleGetters(WfstUploaderState)
};

export default getters;
