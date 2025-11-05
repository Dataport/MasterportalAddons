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
        useIframeForWfs () {
            const params = this.feature.getTheme?.()?.params || {};

            return Boolean(params.forceIframe);
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
                // Check if any property contains HTML tables (marine forecast specific)
                const htmlProperties = Object.entries(props).filter(([, value]) => typeof value === "string" && value.includes("<table") && value.includes("class=\"featureInfo\""));

                if (htmlProperties.length > 0) {
                    // Handle marine forecast data: combine all HTML table properties into one view
                    let combinedHtml = "";
                    const stationName = props.stationbf || props.name || "Marine Station",
                        position = props.position || "";

                    // Add station header
                    combinedHtml += `<h3 style="display:inline;font-family:calibri;font-size:1.35em;">${stationName}</h3>`;
                    if (position) {
                        combinedHtml += `<span style="font-size:1em;font-family:calibri;"> (${position}) </span>`;
                    }
                    combinedHtml += "<br>";

                    // Add each HTML property with appropriate headers
                    Object.entries(props).forEach(([key, value]) => {
                        if (typeof value === "string" && value.includes("<table") && value.includes("class=\"featureInfo\"")) {
                            // Add section headers based on property names
                            let sectionTitle = "";

                            switch (key) {
                                case "windvorhersage":
                                    sectionTitle = `DWD Windvorhersagen ${props.stand_wind || ""}`;
                                    break;
                                case "temp_vs":
                                    sectionTitle = `Wasseroberflächentemperaturvorhersage ${props.wtemp_stand || ""}`;
                                    break;
                                case "ws_vorhersage":
                                    sectionTitle = `Wasserstandsvorhersage ${props.stand || ""}`;
                                    break;
                                case "mondereignisse":
                                    sectionTitle = "Mondereignisse";
                                    break;
                                case "sonnenereignisse":
                                    sectionTitle = "Sonnenereignisse";
                                    break;
                                default:
                                    sectionTitle = key.replace(/_/g, " ");
                            }

                            if (sectionTitle) {
                                combinedHtml += `<h4>${sectionTitle}</h4>`;
                            }
                            combinedHtml += value;
                        }
                    });

                    return combinedHtml;
                }

                // Fallback to default table format for non-marine data
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
            // For WFS/JSON: enable iframe either via theme param or when the content contains a table
            return this.useIframeForWfs || (typeof this.htmlContent === "string" && (/<table[\s\S]*?>/i).test(this.htmlContent));
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
        injectHtmlContent () {
            const iframe = this.$el.querySelector(".marine-iframe"),
                content = this.mimeType === "text/html" ? this.feature.getDocument() : this.htmlContent;

            if (typeof content === "string" && content.length > 0) {
                if (!iframe) {
                    return;
                }

                const style = `
                    <style>
                        body { color: #000; background: #e9e9e9; text-align: center; margin: 0; padding: 10px; }
                        h3 { margin: 0 0 10px 0; }
                        h4 { margin: 10px 0 5px 0; font-size: 1.1em; }
                        table.featureInfo { margin: 5px 0 15px 0; }
                        table.featureInfo tbody { color: #000; background: #e9e9e9; text-align: center; }
                        table.featureInfo tbody tr:nth-child(even) { background: #f1f1f1; }
                        table.featureInfo tbody td:first-child, table.featureInfo tbody th:first-child {
                            color: #e1e1e1; background: #4070a0; font-weight: bold;
                        }
                        p { margin: 5px 0; }
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
    height: 800px;
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
/* Theming for inline HTML tables */
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
