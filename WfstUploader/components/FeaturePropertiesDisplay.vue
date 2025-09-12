<script>
export default {
    name: "FeaturePropertiesDisplay",
    props: {
        /**
         * The selected feature to display properties for
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
                filteredProperties = {};

            // Filter out geometry and other internal properties
            Object.keys(properties).forEach(key => {
                if (key !== "geometry" && !key.startsWith("_")) {
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
    <div
        v-if="feature && hasProperties"
        class="feature-properties-card card"
    >
        <div class="card-header">
            <h5 class="mb-0">
                {{ title }}
            </h5>
        </div>
        <div class="card-body">
            <div class="row">
                <div class="col-12">
                    <table class="table table-striped table-sm">
                        <thead>
                            <tr>
                                <th>{{ $t('additional:modules.tools.wfstUploader.propertyName') }}</th>
                                <th>{{ $t('additional:modules.tools.wfstUploader.propertyValue') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                v-for="(value, key) in formattedProperties"
                                :key="key"
                            >
                                <td class="fw-bold">
                                    {{ formatPropertyName(key) }}
                                </td>
                                <td>
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
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    <div
        v-else-if="feature && !hasProperties"
        class="feature-properties-card card"
    >
        <div class="card-header">
            <h5 class="mb-0">
                {{ title }}
            </h5>
        </div>
        <div class="card-body">
            <p class="text-muted mb-0">
                {{ $t('additional:modules.tools.wfstUploader.noProperties') }}
            </p>
        </div>
    </div>
</template>

<style scoped>
.feature-properties-card {
    border: 1px solid #dee2e6;
    border-radius: 0.375rem;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.card-header {
    background-color: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
    padding: 0.75rem 1rem;
}

.card-body {
    padding: 1rem;
}

.table {
    margin-bottom: 0;
}

.table th {
    background-color: #f8f9fa;
    border-top: none;
    font-weight: 600;
    color: #495057;
}

.table td {
    vertical-align: middle;
    word-wrap: break-word;
}

.text-truncate {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.table-striped tbody tr:nth-of-type(odd) {
    background-color: rgba(0, 0, 0, 0.05);
}

a {
    color: #0d6efd;
    text-decoration: none;
}

a:hover {
    text-decoration: underline;
}
</style>
