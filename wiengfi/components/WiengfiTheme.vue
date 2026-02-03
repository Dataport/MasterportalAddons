<script>

import {mapGetters, mapMutations} from "vuex";
import * as convertFunctions from "../converters";

import getters from "@modules/getFeatureInfo/store/gettersGetFeatureInfo";
import WienGfiGetters from "../store/gettersWienGfi";
import {sanitizeHtml} from "bootstrap/js/src/util/sanitizer";

export default {
    name: "WiengfiTheme",
    props: {
        feature: {
            type: Object,
            required: true
        }
    },
    computed: {
        ...mapGetters("Tools/Gfi", Object.keys(getters)),
        ...mapGetters("Modules/WiengfiTheme", Object.keys(WienGfiGetters)),
        ...mapGetters("Modules/GetFeatureInfo", {
            gfiFeatures: "gfiFeaturesReverse"
        }),
        /**
         * Computed dropdownSelection property to use selectedOption store variable via model
         */
        dropdownSelection: {
            get () {
                return this.selectedOption;
            },
            set (value) {
                this.setSelectedOption(value);
            }
        },
        /**
         * Filtered attributes based on the configured tableAttributes
         */
        filteredAttributes: function () {
            return Object.fromEntries(
                this.tableAttributes
                    .filter(key => key in this.dropdownSelection)
                    .map(key => [key, this.dropdownSelection[key]])
            );
        }
    },
    watch: {
        // When the gfi window switched with arrow, the connection will be refreshed
        feature: {
            handler (feature) {
                this.setActiveFeature(feature);
                this.updateMultiformat();
            },
            immediate: true
        }
    },
    mounted () {
        this.dropdownSelection = this.multiformatItems[0];
    },
    methods: {
        sanitizeHtml,
        ...mapMutations("Modules/GetFeatureInfo", {
            removeGfiFeatureByLayerId: "removeGfiFeatureByLayerId",
            setGfiFeatures: "setGfiFeatures"
        }),
        ...mapMutations("Modules/WiengfiTheme", ["setSelectedOption", "setActiveFeature", "setMultiformatItems", "addMultiformatItem"]),
        /**
         * Updates multiformatItems by comparing configured attribute values from the all gfi pages with the current feature.
         * Also sets the dropdownSelection to the first item in the multiformatItems.
         * @returns {void}
         */
        updateMultiformat: function () {
            this.setMultiformatItems([]);

            const currItems = this.gfiFeatures;
            let featureWithMoreFormats = null;
            let matchCount = 0;

            currItems.forEach((item) => {
                this.matchAttributes.forEach((match) => {
                    if (Object.prototype.hasOwnProperty.call(this.feature.getMappedProperties(), match) &&
                        Object.prototype.hasOwnProperty.call(item.getProperties(), match) &&
                        this.feature.getMappedProperties()[match] === item.getProperties()[match]) {
                        matchCount++;
                    }

                    if (matchCount === this.matchAttributes.length) {
                        this.addMultiformatItem(item.getProperties());
                        if (this.multiformatItems.length > 1) {
                            this.removeGfiFeatureByLayerId(item.getLayerId());
                            featureWithMoreFormats = this.gfiFeatures.find(feature => feature.getLayerId() === this.feature.getLayerId());
                            featureWithMoreFormats.formats = this.multiformatItems;
                        }
                        matchCount = 0;
                    }
                });
            });

            this.dropdownSelection = this.multiformatItems[0];
        },
        /**
         * Checks if the given fieldKey is the dropdownAttributeKey.
         * @param {String} fieldKey the field key to check
         * @returns {Boolean} true if the fieldKey is the dropdownAttributeKey, false otherwise
         */
        isDropDown: function (fieldKey) {
            return this.dropDownAttributeKey === fieldKey;
        },
        /**
         * Converts the given value with the configured value converter.
         * @param {String} field the field to convert
         * @param {String} value the value to convert
         * @returns {String} the converted value
         */
        applyConversion: function (field, value) {
            return this.valueConverters[field] ? convertFunctions[this.valueConverters[field]](value) : value;
        },
        /**
         * Builds the replacement object for the translation.
         * @returns {Object} the replacement object
         */
        buildReplacementObject: function () {
            return this.attributions?.replacements ? Object.fromEntries(this.attributions.replacements.map((replacement) => {
                return [replacement, this.sanitizeHtml(this.feature.getMappedProperties()[replacement])];
            })) : {};
        },
        /**
         * Builds the download link for the current product.
         * It interpolates replacement attributes and applies search and replace on the download path.
         * @param {Object} currentProperties the current properties of the product
         * @returns {String} the download link
         */
        downloadLinkProduct: function (currentProperties) {
            let path = this.download.literal;

            const attributes = [...path.matchAll(/{{([^}]*)}}/g)].map(match => match[1]);

            attributes.forEach((attribute) => {
                if (Object.hasOwn(currentProperties, attribute)) {
                    path = path.replace(`{{${attribute}}}`, currentProperties[attribute]);
                }
            });

            return path.replace(new RegExp(this.download.search || ""), this.download.replace || "");
        },
        /**
         * Reacts on click on download button. Opens the downloadLink.
         * @param {Object} item item with properties
         * @param {Object} evt the dedicated event
         * @returns {void}
         */
        onClick (item, evt) {
            evt.stopPropagation();
            window.open(this.downloadLinkProduct(item));
        }
    }
};
</script>

<template>
    <div class="wiengfi">
        <div class="panel">
            <table class="table table-hover">
                <caption>
                    <div
                        v-for="(caption, key) in captions"
                        :key="key"
                    >
                        {{ $t(`additional:modules.tools.gfi.themes.wiengfi.${caption}`) }} {{ dropdownSelection[caption] }}
                    </div>
                </caption>
                <tbody v-if="multiformatItems && multiformatItems.length > 0">
                <tr v-if="paginationKey">
                    <th>
                        {{ $t(`additional:modules.tools.gfi.themes.wiengfi.${paginationKey}`) }}
                    </th>
                    <td>
                        <select
                            v-if="feature.formats?.length > 1 && isDropDown(paginationKey)"
                            v-model="dropdownSelection"
                            :aria-label="$t(`additional:modules.tools.gfi.themes.wiengfi.${paginationKey}`)"
                            :disabled="feature.formats?.length === 1"
                        >
                            <option
                                v-for="(val, key) in feature.formats"
                                :key="key"
                                :value="val"
                            >
                                {{
                                    key + 1
                                }} / {{ multiformatItems.length }}
                            </option>
                        </select>
                        <template v-else>
                            {{
                                multiformatItems.findIndex(element => element[paginationKey] === dropdownSelection[paginationKey]) + 1
                            }} / {{ multiformatItems.length }}
                        </template>
                    </td>
                </tr>
                <tr
                    v-for="(value, attributeKey) in filteredAttributes"
                    :key="attributeKey"
                >
                    <th>
                        {{ $t(`additional:modules.tools.gfi.themes.wiengfi.${attributeKey}`) }}
                    </th>
                    <td>
                        <select
                            v-if="feature.formats?.length > 1 && isDropDown(attributeKey)"
                            v-model="dropdownSelection"
                            :aria-label="$t(`additional:modules.tools.gfi.themes.wiengfi.${attributeKey}`)"
                            :disabled="feature.formats?.length === 1"
                        >
                            <option
                                v-for="(val, key) in feature.formats"
                                :key="key"
                                :value="val"
                            >
                                {{ applyConversion(attributeKey, val[attributeKey]) }}
                            </option>
                        </select>
                        <template v-else>
                            {{ applyConversion(attributeKey, value) }}
                        </template>
                    </td>
                </tr>
                <tr v-if="Object.keys(download)">
                    <th>
                        {{ $t(`additional:modules.tools.gfi.themes.wiengfi.${download.buttonTextAttribute}`) }}
                    </th>
                    <td>
                        <div
                            class="tab-pane downloadButton active"
                        >
                            <button
                                class="btn btn-primary"
                                type="button"
                                @click="onClick(dropdownSelection, $event)"
                            >
                                    <span class="bootstrap-icon">
                                        <i class="bi-download" />
                                    </span>
                                {{ dropdownSelection[download.buttonTextAttribute] }}
                            </button>
                        </div>
                    </td>
                </tr>
                </tbody>
            </table>
            <div
                id="product_attributions"
                v-html="$t(attributions?.translationKey, buildReplacementObject())"
            />
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";
.remove-table-hover tr:hover{
    background-color: unset !important;
}

.wiengfi {
    position: relative;
    overflow-x: auto;
    box-sizing: border-box;
    padding: 5px 20px 5px 20px;

    .downloadButton {
        button {
            outline: none;
        }
    }

    .bootstrap-icon {
        padding-right: 5px;
    }

    table > caption {
        font-size: 1.15em;
        position: relative;
        padding: 0;
        margin: 12px 0;
        font-weight: bold;
    }

    table {
        table-layout: fixed;
    }
    select {
        padding: 0.375rem 0.75rem;
        font-size: 1rem;
        line-height: 1.5;
        background-color: $primary;
        border: 1px solid $light_grey;
        border-radius: 0.25rem;
        transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    }
    thead th {
        text-align: center;
    }

    tbody td {
        text-align: right;
        vertical-align: middle;
    }

    #product_attributions {
        text-align: left;
    }
}

</style>
