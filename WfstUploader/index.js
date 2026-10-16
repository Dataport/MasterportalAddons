import WfstUploader from "./components/WfstUploader.vue";
import WfstUploaderStore from "./store/WfstUploader";
import deLocale from "./locales/de/additional.json";
import enLocale from "./locales/en/additional.json";

export default {
    component: WfstUploader,
    store: WfstUploaderStore,
    locales: {
        de: deLocale,
        en: enLocale
    }
};
