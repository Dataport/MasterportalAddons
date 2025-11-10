import ExporterAddonComponent from "./components/ExporterAddon.vue";
import ExporterAddonStore from "./store/ExporterAddon";
import deLocale from "./locales/de/additional.json";
import enLocale from "./locales/en/additional.json";

export default {
    component: ExporterAddonComponent,
    store: ExporterAddonStore,
    locales: {
        de: deLocale,
        en: enLocale
    }
};
