<script>
import {mapMutations} from "vuex";

export default {
    name: "MarineForecastTheme",
    props: {
        feature: {
            type: Object,
            required: true
        }
    },
    computed: {
        mimeType () {
            return this.feature.getMimeType();
        },
        htmlContent () {
            if (this.mimeType === "text/html") {
                return this.feature.getDocument();
            }

            let props = {};

            if (typeof this.feature.getMappedProperties === "function") {
                props = this.feature.getMappedProperties();
            }
            else if (typeof this.feature.getProperties === "function") {
                props = this.feature.getProperties();
            }

            if (props && typeof props === "object" && Object.keys(props).length > 0) {
                const htmlProperties = Object.entries(props).filter(([, value]) => typeof value === "string" && value.includes("<table") && value.includes("class=\"featureInfo\""));

                if (htmlProperties.length > 0) {
                    const params = this.feature.getTheme?.()?.params || {},
                        stationNameProperty = params.stationNameProperty || "stationbf",
                        textVersionProperty = params.textVersionProperty || "text_link",
                        hasCustomMappings = Boolean(params.propertyMappings),
                        propertyMappings = params.propertyMappings || this.getDefaultPropertyMappings(),
                        position = props.position || "",
                        stationBf = props[stationNameProperty] || props.stationbf || "";

                    let combinedHtml = "",
                        stationName = props[stationNameProperty] || props.name || "",
                        textVersionUrl = props[textVersionProperty] || "";

                    if (!textVersionUrl && stationBf) {
                        textVersionUrl = `https://marineforecast.bsh.de/Meeresinformationen/bf/${stationBf}.html`;
                    }

                    stationName = this.formatStationName(stationName);

                    combinedHtml += `<h3>${stationName}${position ? ` <span style="font-weight: normal; font-size: 0.74em;">(${position})</span>` : ""}</h3>`;

                    if (textVersionUrl) {
                        combinedHtml += `<p class="text-version"><a href="${textVersionUrl}" target="_blank" rel="noopener noreferrer">Link zur Textversion</a></p>`;
                    }

                    if (hasCustomMappings) {
                        Object.keys(propertyMappings).forEach((key) => {
                            const value = props[key];

                            if (typeof value === "string" && value.includes("<table") && value.includes("class=\"featureInfo\"")) {
                                const mapping = propertyMappings[key],
                                    title = mapping.title || key,
                                    timestampProperty = mapping.timestampProperty,
                                    timestamp = timestampProperty ? props[timestampProperty] || "" : "",
                                    sectionTitle = timestamp ? `${title} ${timestamp}` : title;

                                if (sectionTitle) {
                                    combinedHtml += `<h4>${sectionTitle}</h4>`;
                                }
                                combinedHtml += value;
                            }
                        });
                    }
                    else {
                        Object.entries(props).forEach(([key, value]) => {
                            if (typeof value === "string" && value.includes("<table") && value.includes("class=\"featureInfo\"")) {
                                let sectionTitle = "";

                                if (propertyMappings[key]) {
                                    const mapping = propertyMappings[key],
                                        title = mapping.title || key,
                                        timestampProperty = mapping.timestampProperty,
                                        timestamp = timestampProperty ? props[timestampProperty] || "" : "";

                                    sectionTitle = timestamp ? `${title} ${timestamp}` : title;
                                }
                                else {
                                    sectionTitle = key.replace(/_/g, " ");
                                }

                                if (sectionTitle) {
                                    combinedHtml += `<h4>${sectionTitle}</h4>`;
                                }
                                combinedHtml += value;
                            }
                        });
                    }

                    return combinedHtml;
                }

                let rows = "";

                Object.entries(props).forEach(([key, value]) => {
                    rows += `<tr><td>${key}</td><td>${value}</td></tr>`;
                });
                return `<table class="featureInfo"><tbody>${rows}</tbody></table>`;
            }
            return "";
        },
        renderInIframe () {
            if (this.mimeType === "text/html") {
                return true;
            }
            return typeof this.htmlContent === "string" && (/<table[\s\S]*?>/i).test(this.htmlContent);
        }
    },
    watch: {
        feature () {
            this.$nextTick(this.injectHtmlContent);
        }
    },
    mounted () {
        this.setCurrentMenuWidth({side: "secondaryMenu", width: "35%"});
        this.$nextTick(this.injectHtmlContent);
    },
    unmounted () {
        this.setCurrentMenuWidth({side: "secondaryMenu", width: "25%"});
    },
    methods: {
        ...mapMutations("Menu", ["setCurrentMenuWidth"]),
        getDefaultPropertyMappings () {
            return {
                "windvorhersage": {
                    "title": "DWD Windvorhersagen",
                    "timestampProperty": "stand_wind"
                },
                "temp_vs": {
                    "title": "Wasseroberflächentemperaturvorhersage",
                    "timestampProperty": "wtemp_stand"
                },
                "ws_vorhersage": {
                    "title": "Wasserstandsvorhersage",
                    "timestampProperty": "stand"
                },
                "mondereignisse": {
                    "title": "Mondereignisse"
                },
                "sonnenereignisse": {
                    "title": "Sonnenereignisse"
                }
            };
        },
        formatStationName (name) {
            if (typeof name !== "string") {
                return name;
            }
            return name.replace(/_/g, " ");
        },
        injectHtmlContent () {
            const iframe = this.$el.querySelector(".marine-iframe"),
                content = this.mimeType === "text/html" ? this.feature.getDocument() : this.htmlContent;

            if (typeof content === "string" && content.length > 0) {
                if (!iframe) {
                    return;
                }

                const params = this.feature.getTheme?.()?.params || {},
                    fontFamily = params.fontFamily || "Arial, sans-serif",
                    fontSize = params.fontSize || "14px",
                    tableFontSize = params.tableFontSize || params.fontSize || "14px",
                    headerFontSize = params.headerFontSize || "1.35em",
                    subHeaderFontSize = params.subHeaderFontSize || "1.1em",
                    backgroundColor = params.backgroundColor || "#ffffff",
                    tableRowOddColor = params.tableRowOddColor || "#e9e9e9",
                    tableRowEvenColor = params.tableRowEvenColor || "#e9e9e9",
                    tableHeaderColor = params.tableHeaderColor || "#4070a0",
                    tableHeaderTextColor = params.tableHeaderTextColor || "#e1e1e1",
                    tableBorderSpacing = params.tableBorderSpacing || "0",
                    style = `
                    <style>
                        body {
                            color: #000;
                            background: ${backgroundColor};
                            margin: 0;
                            padding: 10px;
                            font-family: ${fontFamily};
                            font-size: ${fontSize};
                        }
                        h3 {
                            margin: 0 0 5px 0;
                            font-size: ${headerFontSize};
                            text-align: left;
                            font-family: ${fontFamily};
                        }
                        h4 {
                            margin: 15px 0 5px 0;
                            font-size: ${subHeaderFontSize};
                            text-align: left;
                            font-family: ${fontFamily};
                        }
                        p {
                            margin: 5px 0;
                            text-align: left;
                            font-family: ${fontFamily};
                        }
                        p.station-position {
                            margin: 0 0 10px 0;
                            font-style: italic;
                        }
                        p.text-version {
                            margin: 5px 0 10px 0;
                        }
                        a {
                            color: #0066cc;
                            text-decoration: none;
                        }
                        a:hover {
                            text-decoration: underline;
                        }
                        table.featureInfo {
                            margin: 5px 0 5px 0;
                            border-collapse: ${tableBorderSpacing === "0" ? "collapse" : "separate"};
                            border-spacing: ${tableBorderSpacing};
                            width: 100%;
                            font-family: ${fontFamily};
                            font-size: ${tableFontSize};
                        }
                        table.featureInfo tbody {
                            color: #000;
                        }
                        table.featureInfo tbody tr:nth-child(odd) {
                            background: ${tableRowOddColor};
                        }
                        table.featureInfo tbody tr:nth-child(even) {
                            background: ${tableRowEvenColor};
                        }
                        table.featureInfo tbody td,
                        table.featureInfo tbody th {
                            padding: 6px 8px;
                            text-align: left;
                            border: 1px solid #ffffff;
                        }
                        table.featureInfo tbody td:first-child,
                        table.featureInfo tbody th:first-child {
                            color: ${tableHeaderTextColor};
                            background: ${tableHeaderColor};
                            font-weight: bold;
                            border-right: 2px solid #ffffff;
                        }
                        table.featureInfo p {
                            text-align: center;
                        }
                    </style>`,
                    doc = `<!doctype html><html><head><meta charset="utf-8">${style}</head><body>${content}</body></html>`;

                iframe.contentWindow.document.open();
                iframe.contentWindow.document.write(doc);
                iframe.contentWindow.document.close();
            }
        }
    }
};
</script>

<template>
    <div>
        <iframe
            v-if="renderInIframe"
            class="marine-iframe"
            title="Marine Forecast"
        />
        <div v-else>
            <div
                v-if="htmlContent"
                class="marine-html"
                v-html="htmlContent"
            />
            <p v-else>
                No HTML content available.
            </p>
        </div>
    </div>
</template>

<style scoped>
.marine-iframe {
    width: 100%;
    height: 900px;
}
.marine-html {
    overflow-x: auto;
    overflow-y: auto;
    line-height: normal;
    max-height: 80vh;
}
.marine-html table {
    width: max-content;
    border-collapse: collapse;
}
.marine-html td,
.marine-html th {
    white-space: nowrap;
}
.marine-html {
    color: #000;
    background: #e9e9e9;
    text-align: center;
}
.marine-html table.featureInfo tbody tr:nth-child(even) {
    background: #f1f1f1;
}
.marine-html table.featureInfo tbody td:first-child,
.marine-html table.featureInfo tbody th:first-child {
    color: #e1e1e1;
    background: #4070a0;
    font-weight: bold;
}
</style>

<style>
.gfi-pager-left-margin {
    margin-left: 0 !important;
}

.gfi-title.mx-3 {
    margin-left: 0.7rem !important;
}
</style>
