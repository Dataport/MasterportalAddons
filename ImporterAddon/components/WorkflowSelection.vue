<script>
import {mapGetters, mapMutations} from "vuex";
import LightButton from "@shared/modules/buttons/components/LightButton.vue";

export default {
    name: "WorkflowSelection",
    components: {
        LightButton
    },
    props: {
        workflows: {
            type: Array,
            required: true
        }
    },
    computed: {
        ...mapGetters("Modules/ImporterAddon", ["selectedWorkflow"])
    },
    methods: {
        ...mapMutations("Modules/ImporterAddon", [
            "setSelectedWorkflow",
            "setCurrentFormValid"
        ]),
        /**
         * Handle workflow selection and proceed.
         *
         * @param {String} workflow - The selected workflow
         * @returns {void}
         */
        selectWorkflow (workflow) {
            this.setSelectedWorkflow(workflow);
            this.setCurrentFormValid(true);

            // Event emittieren für den nächsten Schritt
            this.$emit("workflow-selected", workflow);
        },

        /**
         * Get the interaction function for a specific workflow.
         *
         * @param {String} workflow - The workflow identifier
         * @returns {Function} The interaction function
         */
        getWorkflowInteraction (workflow) {
            return () => this.selectWorkflow(workflow);
        }
    }
};
</script>

<template lang="html">
    <div class="importer-addon-workflow-selection">
        <div class="workflow-buttons">
            <LightButton
                v-for="workflow in workflows"
                :key="workflow"
                :text="'additional:modules.tools.importerAddon.workflows.' + workflow"
                :interaction="getWorkflowInteraction(workflow)"
            />
        </div>
    </div>
</template>

<style lang="scss" scoped>
.workflow-buttons {
    display: flex;
    flex-direction: column;
}

.workflow-button {
    width: 100%;
}
</style>
