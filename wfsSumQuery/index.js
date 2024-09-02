import WfsSumQueryComponent from "./components/WfsSumQuery.vue";
import WfsSumQueryStore from "./store/indexWfsSumQuery.js";
import deLocale from "./locales/de/additional.json";
import enLocale from "./locales/en/additional.json";

export default {
    component: WfsSumQueryComponent,
    store: WfsSumQueryStore,
    locales: {
        de: deLocale,
        en: enLocale
    }
};
