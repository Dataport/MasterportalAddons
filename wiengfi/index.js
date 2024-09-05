import component from "./components/WiengfiTheme.vue";
import WienGfiStore from "./store/indexWienGfi";
import deLocale from "./locales/de/additional.json";
import enLocale from "./locales/en/additional.json";

export default {
    component: component,
    store: WienGfiStore,
    locales: {
        de: deLocale,
        en: enLocale
    }
};
