<script>
import {mapGetters} from "vuex";
import getters from "../../../../src/modules/tools/gfi/store/gettersGfi";
import Chart from "chart.js";

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
        displayTitle () {
            let title = "";

            title += this.title?.prefix || "";
            title += this.title?.prefix && (this.title?.attributeValue || this.title?.suffix) ? " " : "";
            title += this.title?.attributeValue ? this.feature.getMappedProperties()[this.title?.attributeValue] : "";
            title += this.title?.attributeValue && this.title?.suffix ? " " : "";
            title += this.title?.suffix || "";

            return title;
        },
        displayLabels () {
            const d = this.theme?.showLabels;

            return typeof d === "undefined" ? true : d;
        },
        parseChartData () {
            let parser = [];

            if (this.theme?.parsingOptions) {
                parser = this.theme?.parsingOptions;
            }

            return this.parseData([this.toFloatParsing, ...parser]);
        },
        germanNumbers () {
            const d = this.theme?.germanNumbers;

            return typeof d === "undefined" ? true : d;
        },
        parseLabelData () {
            let parser = [];

            if (this.theme?.labelingOptions) {
                parser = this.theme?.labelingOptions;
            }

            if (this.germanNumbers) {

                return this.parseData([this.toGermanParsing, ...parser]);
            }
            return this.parseData(parser);
        },
        refinedData: function () {
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
        ...mapGetters("Tools/Gfi", Object.keys(getters)),
        /**
         * Builds parsing function
         * @param {Array} parse an object with parsing properties
         *
         * @returns {function} function which parses strings
         */
        parseData (parse = []) {
            return value => {
                let valueAsString = String(value);

                parse.forEach(({
                    replaceString = "",
                    withString = "",
                    replaceAll = false,
                    appendString = ""
                }) => {
                    if (replaceAll) {
                        valueAsString = valueAsString.replaceAll(replaceString, withString);
                    }
                    else {
                        valueAsString = valueAsString.replace(replaceString, withString);
                    }
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
        createChartOptions: function () {
            const parseLabelData = this.parseLabelData;

            return {
                responsive: this.desktopType() !== "attached",
                legend: {
                    display: this.displayLabels
                },
                title: {
                    display: Boolean(this.displayTitle),
                    text: this.displayTitle
                },
                tooltips: {
                    callbacks: {
                        label: function (tooltipItem, data) {
                            let label = data.labels[tooltipItem.index] || "";

                            if (label) {
                                label += ": ";
                            }

                            label += parseLabelData(data.datasets[0].data[tooltipItem.index]);
							console.log(label);
							console.log(data.datasets[0].data);
                            return label;
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
            return (/^\d+[.,\d]\d*$/).test(value);
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
