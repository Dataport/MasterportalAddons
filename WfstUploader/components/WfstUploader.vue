<script>
import AddonOpenerButton from "../../AddonOpenerButton.vue";

export default {
    name: "WfstUploader",
    components: {
        AddonOpenerButton
    },
    data () {
        return {
            importerAddonId: "importerAddon",
            importerAddonName: "Import"
        };
    }
};
</script>

<template lang="html">
    <div
        id="wfstUploader"
        class="row"
    >
        <AddonOpenerButton
            button-text="Geometrie hochladen - huihuihui"
            :button-class="'mt-3'"
            :addon-id="importerAddonId"
            :addon-name="importerAddonName"
        />
    </div>
</template>

<style scoped></style>
