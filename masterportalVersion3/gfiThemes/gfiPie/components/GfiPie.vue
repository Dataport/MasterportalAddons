<script>
import {mapGetters} from "vuex";
import getters from "../../../../src/modules/getFeatureInfo/store/gettersGetFeatureInfo";
import Chart from "chart.js/auto";

export default {
    name: "GfiPie",
    props: {
        feature: {
            type: Object,
            required: true
        }
    },
    data () {
        return {
            theme: this.feature?.getTheme(),
            configParams: this.feature?.getTheme().params,
            title: this.feature?.getTheme().title,
            width: this.feature?.getTheme()?.width || 500,
            height: this.feature?.getTheme()?.height || 500,
            toFloatParsing: {
                replaceString: ",",
                withString: "."
            },
            toGermanParsing: {
                replaceString: ".",
                withString: ","
            }
        };
    },
    computed: {
        ...mapGetters({
            isMobile: "mobile"
        }),
        ...mapGetters("Tools/Gfi", Object.keys(getters)),
        /**
         * Constructs the display title based on the theme configuration
         * @returns {string} The constructed title
         */
        displayTitle () {
            const {prefix = "", attributeValue, suffix = ""} = this.title || {},
                attribute = attributeValue ? this.feature.getMappedProperties()[attributeValue] : "";

            return `${prefix}${prefix && (attribute || suffix) ? " " : ""}${attribute}${attribute && suffix ? " " : ""}${suffix}`;
        },
        /**
         * Determines whether to display labels based on the theme configuration
         * @returns {boolean} True if labels should be displayed, otherwise false
         */
        displayLabels () {
            return this.theme?.showLabels ?? true;
        },
        /**
         * Parses chart data based on the theme's parsing options
         * @returns {function} The parsing function
         */
        parseChartData () {
            const parser = this.theme?.parsingOptions ?? [];

            return this.parseData([this.toFloatParsing, ...parser]);
        },
        /**
         * Determines whether to use German number formatting based on the theme configuration
         * @returns {boolean} True if German number formatting should be used, otherwise false
         */
        germanNumbers () {
            return this.theme?.germanNumbers ?? true;
        },
        /**
         * Parses label data based on the theme's labeling options and number formatting
         * @returns {function} The parsing function
         */
        parseLabelData () {
            const parser = this.theme?.labelingOptions ?? [];

            return this.germanNumbers ? this.parseData([this.toGermanParsing, ...parser]) : this.parseData(parser);
        },
        /**
         * Refines data for the chart by extracting labels, values, and colors from the feature properties
         * @returns {Object} The refined data object containing labels, values, and colors
         */
        refinedData () {
            const result = {
                    labels: [],
                    values: [],
                    colors: []
                },
                props = this.feature.getMappedProperties();

            Object.entries(props).forEach(([key, value]) => {
                if (this.configParams?.[key] !== undefined && this.isNumeric(value)) {
                    result.labels.push(this.configParams[key].label || key);
                    result.values.push(parseFloat(this.parseChartData(value) || 0));
                    result.colors.push(this.configParams[key].color);
                }
            });

            return result;
        }
    },
    watch: {
        feature: function () {
            this.chart.data = this.createChartData();
            this.chart.options = this.createChartOptions();
            this.chart.update();
        }
    },
    mounted () {
        this.addMissingColors();
        this.drawChart();
    },
    methods: {
        /**
         * Builds parsing function
         * @param {Array} parse an object with parsing properties
         *
         * @returns {function} function which parses strings
         */
        parseData (parse = []) {
            return value => {
                let valueAsString = String(value);

                parse.forEach(({replaceString = "", withString = "", replaceAll = false, appendString = ""}) => {
                    valueAsString = replaceAll
                        ? valueAsString.replaceAll(replaceString, withString)
                        : valueAsString.replace(replaceString, withString);
                    valueAsString += appendString;
                });

                return valueAsString;
            };
        },
        /**
         * Draws a pie chart
         * @returns {void}
         */
        drawChart: function () {
            const canvas = this.$el.getElementsByTagName("canvas")[0];

            this.chart = new Chart(canvas, {
                type: "pie",
                data: this.createChartData(),
                options: this.createChartOptions()
            });

        },
        /**
         * Creates a data object to be used for the chart
         * @returns {Object} Data object
         */
        createChartData: function () {
            return {
                labels: this.refinedData.labels,
                datasets: [{
                    data: this.refinedData.values,
                    backgroundColor: this.refinedData.colors
                }]
            };
        },
        /**
         * Creates an options object to be used for the chart
         * @returns {Object} Data object
         */
        createChartOptions () {
            return {
                responsive: this.mobile,
                plugins: {
                    legend: {
                        display: this.displayLabels
                    },
                    title: {
                        display: Boolean(this.displayTitle),
                        text: this.displayTitle
                    },
                    tooltip: {
                        callbacks: {
                            label: tooltipItem => {
                                let label = tooltipItem.label ? `${tooltipItem.label}: ` : "";

                                label += this.parseLabelData(tooltipItem.raw);
                                return label;
                            }
                        }
                    }
                }
            };
        },
        /**
         * Adds missing colors to configured params
         * @returns {Object} Data object
         */
        addMissingColors () {
            const props = this.feature.getMappedProperties();

            Object.entries(props).forEach(([key]) => {
                if (this.configParams[key] && !this.configParams[key]?.color) {
                    this.configParams[key].color = this.randomRgba();
                }
            });
        },
        /**
         * Creates a random rgba color
         * @returns {Object} Data object
         */
        randomRgba: () => {
            const round = Math.round,
                random = Math.random,
                max = 255;

            return "rgba(" + round(random() * max) + "," + round(random() * max) + "," + round(random() * max) + ", 1)";
        },
        /**
         * Checks if a string is numeric
         * @param {string} value string which is checked
         * @returns {Boolean} true if the string is numeric
         */
        isNumeric: (value) => {
            return typeof parseFloat(value, 10) === "number";
        }
    }
};
</script>

<template>
    <div id="gfiTorte-chart-container">
        <canvas
            :width="width"
            :height="height"
        />
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";
</style>
