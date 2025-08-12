<script>
/**
 * RadioButton component that mimics LayerCheckBox styling.
 * @module addons/ExporterAddon/components/RadioButton
 * @vue-prop {String} id - The unique identifier for the button.
 * @vue-prop {String} text - The text to display in the button.
 * @vue-prop {*} value - The value of this radio button option.
 * @vue-prop {*} selectedValue - The currently selected value.
 * @vue-prop {String} [name="radio-group"] - The name attribute for radio grouping.
 * @vue-prop {Boolean} [disabled=false] - Whether the button is disabled.
 * @vue-data {Function} interaction - Function to call when button is clicked.
 */
export default {
    name: "RadioButton",
    props: {
        id: {
            type: String,
            required: true
        },
        text: {
            type: String,
            required: true
        },
        value: {
            type: [String, Number, Object, Boolean],
            required: true
        },
        selectedValue: {
            type: [String, Number, Object, Boolean],
            required: false,
            default: null
        },
        name: {
            type: String,
            default: "radio-group"
        },
        disabled: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        /**
         * Returns true if this button is selected
         * @returns {Boolean} true if selected
         */
        isSelected () {
            return this.selectedValue === this.value;
        }
    },
    methods: {
        /**
         * Handles button click
         * @param {Event} event - The click event
         * @returns {void}
         */
        handleClick (event) {
            event.preventDefault();
            event.stopPropagation();

            if (!this.disabled) {
                this.$emit("change", this.value);
            }
        },

        /**
         * Handles keydown events
         * @param {Event} event - The keydown event
         * @returns {void}
         */
        handleKeydown (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                event.stopPropagation();
                this.handleClick(event);
            }
        }
    }
};
</script>

<template>
    <button
        :id="id"
        :disabled="disabled"
        type="button"
        class="btn d-flex w-100 layer-tree-layer-title pe-2 p-1 btn-light radio-button"
        :title="text"
        @click="handleClick"
        @keydown="handleKeydown"
    >
        <span
            :class="[
                'layer-tree-layer-checkbox ps-1 pe-3',
                {
                    'bi-check-circle': isSelected,
                    'bi-circle': !isSelected
                }
            ]"
        />
        <span
            :class="['layer-tree-layer-label', 'mt-0 d-flex flex-column align-self-start', isSelected ? 'font-bold' : '']"
            :aria-label="text"
        >
            <span>{{ text }}</span>
        </span>
    </button>
</template>

<style lang="scss" scoped>
.radio-button.layer-tree-layer-title {
    overflow: hidden;
    line-height: normal;
}

.radio-button .layer-tree-layer-label {
    overflow: hidden;
}

.radio-button .layer-tree-layer-label span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
