import StrassenBefahrungComponent from "./components/StrassenBefahrung.vue";
import StrassenBefahrungStore from "./store/indexStrassenBefahrung";
import deLocale from "./locales/de/additional.json";
import enLocale from "./locales/en/additional.json";

export default {
    component: StrassenBefahrungComponent,
    store: StrassenBefahrungStore,
    locales: {
        de: deLocale,
        en: enLocale
    }
};
