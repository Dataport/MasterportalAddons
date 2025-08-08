<script>
import {mapGetters, mapMutations} from "vuex";

export default {
    name: "WorkflowSelection",
    props: {
        workflows: {
            type: Array,
            required: true
        }
    },
    computed: {
        ...mapGetters("Modules/ImporterAddon", ["selectedWorkflow"]),
        workflowRadioValue: {
            get () {
                return this.selectedWorkflow;
            },
            set (value) {
                this.setSelectedWorkflow(value);
            }
        }
    },
    created () {
        const isValid = this.isFormValid();

        this.setCurrentFormValid(isValid);
    },
    mounted () {
        this.focusOnWorkflowRadio();
    },
    methods: {
        ...mapMutations("Modules/ImporterAddon", [
            "setSelectedWorkflow",
            "setCurrentFormValid"
        ]),

        /**
         * Check if the form is valid.
         *
         * @returns {Boolean} True, if form is valid. False otherwise.
         */
        isFormValid () {
            const workflowSelected = this.selectedWorkflow !== undefined && this.selectedWorkflow.length > 0;

            return workflowSelected;
        },

        /**
         * Focus on the workflow radio.
         *
         * @returns {void}
         */
        focusOnWorkflowRadio () {
            this.$nextTick(() => {
                const workflowId = "importer-addon-workflow-radio-" + this.workflowRadioValue,
                    workflowRadio = document.getElementById(workflowId);

                if (workflowRadio) {
                    workflowRadio.focus({focusVisible: true});
                }
            });
        }
    }
};
</script>

<template lang="html">
    <div class="importer-addon-workflow-selection">
        <div class="form-group">
            <div
                v-for="workflow in workflows"
                :key="workflow"
                class="form-check"
            >
                <input
                    :id="'importer-addon-workflow-radio-' + workflow"
                    :ref="'importer-addon-workflow-' + workflow"
                    v-model="workflowRadioValue"
                    type="radio"
                    name="workflow_selection"
                    :value="workflow"
                    class="form-check-input"
                >
                <label
                    :for="'importer-addon-workflow-radio-' + workflow"
                    class="form-check-label"
                >
                    {{ $t("additional:modules.tools.importerAddon.workflows." + workflow) }}
                </label>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>

</style>
