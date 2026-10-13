import GeoFilter from "./components/GeoFilter.vue";
import GeoFilterStore from "./store/GeoFilter";
import deLocale from "./locales/de/additional.json";
import enLocale from "./locales/en/additional.json";

export default {
    component: GeoFilter,
    store: GeoFilterStore,
    locales: {
        de: deLocale,
        en: enLocale
    }
};
