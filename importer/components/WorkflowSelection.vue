<script>
import {mapGetters, mapMutations} from "vuex";
import RadioButton from "./RadioButton.vue";

export default {
    name: "WorkflowSelection",
    components: {
        RadioButton
    },
    props: {
        workflows: {
            type: Array,
            required: true
        }
    },
    data () {
        return {
            inputValid: false
        };
    },
    computed: {
        ...mapGetters("Modules/Importer", ["selectedWorkflow"])
    },
    created () {
        const isValid = this.isFormValid();

        this.setCurrentFormValid(isValid);
    },
    methods: {
        ...mapMutations("Modules/Importer", [
            "setSelectedWorkflow",
            "setCurrentFormValid"
        ]),
        /**
         * Handle workflow radio selection.
         *
         * @param {String} workflow - The selected workflow
         * @returns {void}
         */
        onRadioChange (workflow) {
            this.setSelectedWorkflow(workflow);
            this.inputValid = this.isFormValid();
            this.setCurrentFormValid(this.isFormValid());
        },

        /**
         * Check if the form is valid.
         *
         * @returns {Boolean} True, if form is valid. False otherwise.
         */
        isFormValid () {
            return Boolean(this.selectedWorkflow);
        }
    }
};
</script>

<template lang="html">
    <div class="importer-addon-workflow-selection">
        <form>
            <div class="input-group">
                <span>
                    {{ $t("additional:modules.tools.importer.selectWorkflowText") }}
                </span>
                <div
                    v-for="workflow in workflows"
                    :key="workflow"
                    class="mt-2"
                >
                    <RadioButton
                        :id="`importer-workflow-radio-${workflow}`"
                        :value="workflow"
                        :selected-value="selectedWorkflow"
                        :text="$t('additional:modules.tools.importer.workflows.' + workflow)"
                        name="workflow-selection"
                        @change="onRadioChange"
                    />
                </div>
            </div>
        </form>
    </div>
</template>

<style lang="scss" scoped>
.input-group {
    padding-bottom: 10px;
    padding-left: 10px;
    display: block;
    font-size: large;
}

</style>
