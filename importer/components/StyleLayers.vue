<script>
import {mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersImporterAddon";
import mutations from "../store/mutationsImporterAddon";
import ColorUtil from "../utils/color";

import IconButton from "@shared/modules/buttons/components/IconButton.vue";

export default {
    name: "StyleLayers",
    components: {
        IconButton
    },
    props: {
        layers: {
            type: Array,
            required: true
        }
    },
    computed: {
        ...mapGetters("Modules/Importer", Object.keys(getters))
    },
    created () {
        this.layers.forEach(layer => {
            layer.importedStyle = {
                "rules": [
                    {
                        "style": {
                            "type": "circle",
                            "circleFillColor": this.styleFillColor,
                            "circleStrokeColor": this.styleStrokeColor,
                            "circleStrokeWidth": this.styleStrokeWidth,
                            "circleRadius": this.styleCircleRadius,
                            "lineStrokeColor": this.styleStrokeColor,
                            "lineStrokewidth": this.styleStrokeWidth,
                            "polygonFillColor": this.styleFillColor,
                            "polygonStrokeColor": this.styleStrokeColor,
                            "polygonStrokeWidth": this.styleStrokeWidth
                        }
                    }
                ]
            };
        });
    },
    mounted () {
        this.focusOnHiddenInput();
    },
    methods: {
        ...mapMutations("Modules/Importer", Object.keys(mutations)),
        ...mapMutations("Modules/Importer", [
            "removeLayer",
            "updateStyle"
        ]),
        rgbToHex (color) {
            return ColorUtil.rgbToHex(color[0], color[1], color[2]);
        },
        onStyleChanged (evt, layer, type) {
            let value = evt.target.value;
            const layerId = layer.id;

            if (value.includes("#")) {
                const rgbArray = ColorUtil.hexToRgb(value);

                // add alpha channel
                rgbArray.push(1);
                value = rgbArray;
            }

            const style = layer.importedStyle.rules[0].style;

            if (type === "fillColor") {
                style.circleFillColor = value;
                style.polygonFillColor = value;
            }
            else if (type === "strokeColor") {
                style.circleStrokeColor = value;
                style.lineStrokeColor = value;
                style.polygonStrokeColor = value;
            }
            else if (type === "strokeWidth") {
                style.circleStrokeWidth = parseInt(value, 10);
                style.lineStrokewidth = parseInt(value, 10);
                style.polygonStrokeWidth = parseInt(value, 10);
            }

            this.updateStyle({layerId, style});
        },

        /**
         * Removes a layer from the selected layers array.
         * @param {Number} layerId The layer ID.
         * @returns {void}
         */
        onDeleteButtonClick (layerId) {
            this.removeLayer(layerId);
        },

        /**
         * Focus on the hidden input field.
         *
         * @returns {void}
         */
        focusOnHiddenInput () {
            this.$nextTick(() => {
                const hiddenInputRef = "importer-addon-hidden-input",
                    hiddenInput = this.$refs[hiddenInputRef];

                if (hiddenInput) {
                    hiddenInput.focus();
                }
            });
        }
    }
};
</script>

<template lang="html">
    <div class="importer-addon-style-layers">
        <div class="form-group">
            <div
                v-for="layer in layers"
                :key="layer.id"
                class="style-form"
            >
                <div class="style-form-actions">
                    <IconButton
                        :aria="$t('additional:modules.tools.importer.removeLayer')"
                        :icon="'bi bi-trash'"
                        :interaction="() => this.onDeleteButtonClick(layer.id)"
                        :class-array="['btn-light']"
                    />
                </div>
                <p>
                    <b>{{ $t("additional:modules.tools.importer.setStyleMessage") }} "{{ layer.name }}"</b>
                </p>
                <div
                    class="style-selector fill-color"
                >
                    <label for="importer-addon-color">
                        {{ $t("additional:modules.tools.importer.styleSelectFillColor") }}
                    </label>
                    <input
                        :id="`importer-addon-color-${layer.id}`"
                        type="color"
                        :value="rgbToHex(layer.importedStyle.rules[0].style.circleFillColor ?? this.styleFillColor)"
                        @change="(evt) => onStyleChanged(evt, layer, 'fillColor')"
                    >
                </div>
                <div
                    class="style-selector stroke-color"
                >
                    <label for="importer-addon-stroke-color">
                        {{ $t("additional:modules.tools.importer.styleSelectStrokeColor") }}
                    </label>
                    <input
                        :id="`importer-addon-stroke-color-${layer.id}`"
                        type="color"
                        :value="rgbToHex(layer.importedStyle.rules[0].style.circleStrokeColor ?? this.styleStrokeColor)"
                        @change="(evt) => onStyleChanged(evt, layer, 'strokeColor')"
                    >
                </div>
                <div
                    class="style-selector stroke-width"
                >
                    <label for="importer-addon-stroke-width">
                        {{ $t("additional:modules.tools.importer.styleSelectStrokeWidth") }}
                    </label>
                    <input
                        :id="`importer-addon-stroke-width-${layer.id}`"
                        type="number"
                        name="color_selection"
                        :value="layer.importedStyle.rules[0].style.circleStrokeWidth ?? this.styleStrokeWidth"
                        @change="(evt) => onStyleChanged(evt, layer, 'strokeWidth')"
                    >
                </div>
            </div>
            <!-- eslint-disable-next-line vuejs-accessibility/form-control-has-label -->
            <input
                ref="importer-addon-hidden-input"
                type="text"
                class="hidden-text-input"
            >
        </div>
    </div>
</template>

<style lang="scss" scoped>
.style-form {
    position: relative;
    border: 1px solid gray;
    padding: 10px;

    label, input {
        flex: 1;
    }

    p {
        padding-right: 2.5rem;
    }
}
.style-form-actions {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
}
.style-selector {
    display: flex;
    input[type="color"] {
        width: 1.8rem;
    }
    input[type="number"] {
        width: 1.8rem;
    }
}
.hidden-text-input {
    width: 0;
    height: 0;
    opacity: 0;
    position: fixed;
    top: -10000px;
    left: -10000px;
}
</style>
