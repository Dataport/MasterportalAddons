<script>
import AccordionItem from "@shared/modules/accordion/components/AccordionItem.vue";

export default {
    name: "FeaturePropertiesDisplay",
    components: {
        AccordionItem
    },
    props: {
        /**
         * The feature to display properties for
         */
        feature: {
            type: Object,
            required: false,
            default: null
        },
        /**
         * Title for the properties display card
         */
        title: {
            type: String,
            required: false,
            default: "Feature Properties"
        },
        /**
         * Whether the accordion should be initially open
         */
        isOpen: {
            type: Boolean,
            required: false,
            default: true
        }
    },
    computed: {
        /**
         * Returns formatted properties excluding geometry
         * @returns {Object} The formatted properties
         */
        formattedProperties () {
            if (!this.feature) {
                return {};
            }
            const properties = this.feature.getProperties(),
                geometryName = this.feature.getGeometryName(),
                filteredProperties = {};

            // Filter out geometry and other internal properties
            Object.keys(properties).forEach(key => {
                if (key !== geometryName && !key.startsWith("_")) {
                    filteredProperties[key] = properties[key];
                }
            });

            return filteredProperties;
        },
        /**
         * Check if there are any properties to display
         * @returns {Boolean} True if there are properties to show
         */
        hasProperties () {
            return Object.keys(this.formattedProperties).length > 0;
        }
    },
    methods: {
        /**
         * Formats property names for display
         * @param {String} propertyName The property name to format
         * @returns {String} The formatted property name
         */
        formatPropertyName (propertyName) {
            // Convert camelCase and snake_case to readable format
            return propertyName
                .replace(/([A-Z])/g, " $1")
                .replace(/_/g, " ")
                .replace(/^./, str => str.toUpperCase())
                .trim();
        },
        /**
         * Formats property values for display
         * @param {*} value The property value to format
         * @returns {String} The formatted property value
         */
        formatPropertyValue (value) {
            if (value === null || value === undefined) {
                return "-";
            }
            if (typeof value === "boolean") {
                return value ? "Ja" : "Nein";
            }
            if (typeof value === "number") {
                return value.toLocaleString("de-DE");
            }
            if (typeof value === "object") {
                return JSON.stringify(value, null, 2);
            }
            return String(value);
        },
        /**
         * Checks if a value is a URL
         * @param {*} value The value to check
         * @returns {Boolean} True if the value is a URL
         */
        isUrl (value) {
            if (typeof value !== "string") {
                return false;
            }
            try {
                new URL(value);
                return value.startsWith("http://") || value.startsWith("https://");
            }
            catch {
                return false;
            }
        },
        /**
         * Checks if a text is too long for inline display
         * @param {*} value The value to check
         * @returns {Boolean} True if the text is long
         */
        isLongText (value) {
            return typeof value === "string" && value.length > 50;
        }
    }
};
</script>

<template lang="html">
    <AccordionItem
        v-if="feature"
        id="feature-properties"
        :title="title"
        :is-open="isOpen"
    >
        <div v-if="hasProperties">
            <div class="properties-list">
                <div
                    v-for="(value, key) in formattedProperties"
                    :key="key"
                    class="property-item"
                >
                    <div class="property-label">
                        {{ formatPropertyName(key) }}
                    </div>
                    <div class="property-value">
                        <span
                            v-if="isUrl(value)"
                            class="text-truncate d-inline-block"
                            style="max-width: 300px;"
                            :title="value"
                        >
                            <a
                                :href="value"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="property-link"
                            >
                                {{ value }}
                            </a>
                        </span>
                        <span
                            v-else-if="isLongText(value)"
                            class="text-truncate d-inline-block"
                            style="max-width: 300px;"
                            :title="value"
                        >
                            {{ value }}
                        </span>
                        <span v-else>
                            {{ formatPropertyValue(value) }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
        <div v-else>
            <p class="text-muted mb-0">
                {{ $t('additional:modules.tools.wfstUploader.noProperties') }}
            </p>
        </div>
    </AccordionItem>
</template>

<style lang="scss" scoped>
@import "~variables";

.property-item {
    padding: 0.75rem 0;
    border-bottom: 1px solid #e9ecef;
}

.property-item:last-child {
    border-bottom: none;
}

.property-label {
    font-weight: bold;
    color: $dark_grey;
    font-size: $font_size_base;
    margin-bottom: 0.25rem;
    text-transform: uppercase;
}

.property-value {
    font-size: $font_size_base;
    color: $black;
    word-wrap: break-word;
}

.text-truncate {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.property-link {
    color: $link-color;
    text-decoration: $link-decoration;
}

.property-link:hover {
    color: $accent_active;
}
</style>
