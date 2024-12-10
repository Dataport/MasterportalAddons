import BulkDownloadComponent from "./components/BulkDownload.vue";
import BulkDownloadStore from "./store/indexBulkDownload";
import deLocale from "./locales/de/additional.json";
import enLocale from "./locales/en/additional.json";

export default {
    component: BulkDownloadComponent,
    store: BulkDownloadStore,
    locales: {
        de: deLocale,
        en: enLocale
    }
};
