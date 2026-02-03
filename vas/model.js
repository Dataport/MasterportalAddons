import "../../modules/searchbar/model";
import crsModule from "@masterportal/masterportalapi/src/crs";

const VASModel = Backbone.Model.extend(/** @lends VASModel.prototype */ {
    defaults: {
        vasServiceURL: "",
        minChars: 3,
        httpRequest: null
    },

    /**
     * @class VASModel
     * @description Initialization Vienna Address Service (VAS).
     * @extends Backbone.Model
     * @memberof Addons.VAS
     * @constructs
     * @property {String} vasServiceURL="" - The URL to the VAS.
     * @property {Number} minChars=3 - The default minimum amount of required characters to start the search.
     * @property {XMLHttpRequest} httpRequest=null - The request send to the Service.
     * @listens Searchbar#RadioTriggerSearchbarSearch
     * @fires Alerting#RadioTriggerAlertAlert
     * @fires Core#RadioRequestUtilGetProxyURL
     * @fires Core.ConfigLoader#RadioRequestParserGetPortalConfig
     * @fires RestReader#RadioRequestRestReaderGetServiceById
     * @fires Searchbar#RadioTriggerSearchbarAbortSearch
     * @fires Searchbar#RadioTriggerSearchbarCreateRecommendedList
     * @fires Searchbar#RadioTriggerSearchbarPushHits
     * @fires Searchbar#RadioTriggerSearchbarRemoveHits
     * @returns {void}
     */
    initialize: function () {
        const portalConfig = Radio.request("Parser", "getPortalConfig");

        let service = {};

        if (portalConfig.searchBar === undefined) {
            console.error("Vienna Address Service: The searchBar is not defined in the PortalConfig!");
            return;
        }
        service = Radio.request("RestReader", "getServiceById", portalConfig.searchBar.vas.serviceId);

        if (service !== undefined && service.get("url") !== undefined) {
            if (this.get("useProxy")) {
                this.setVASServiceURL(Radio.request("Util", "getProxyURL", service.get("url")));
            }
            else {
                this.setVASServiceURL(service.get("url"));
            }
        }
        if (portalConfig.searchBar.vas.minChars !== undefined) {
            this.setMinChars(portalConfig.searchBar.vas.minChars);
        }

        this.listenTo(Radio.channel("Searchbar"), {
            "search": this.search
        });
    },

    /**
     * Entrypoint for the search using the VAS.
     * If the minimum amount of characters is not given the search does not start.
     *
     * @param {String} request - The user input supposedly containing the address that should be searched.
     * @fires Searchbar#RadioTriggerSearchbarRemoveHits
     * @fires Searchbar#RadioTriggerSearchbarAbortSearch
     * @returns {void}
     */
    search: function (request) {
        if (request.length < this.get("minChars")) {
            Radio.trigger("Searchbar", "abortSearch", "vas");
        }
        else {
            const httpRequest = this.get("httpRequest");

            Radio.trigger("Searchbar", "removeHits", "hitList", {type: "Vienna Address Service"});

            // Aborts an already running HTTP request if present and initiates a new HTTP request.
            if (httpRequest !== null) {
                httpRequest.abort();
                this.setHTTPRequest(null);
            }

            this.sendRequest(this.get("vasServiceURL"), encodeURIComponent(request));
        }
    },

    /**
     * Fires a HTTP GET Request and saves it for possible termination of the request.
     *
     * @param {String} url - The URL the request gets send to.
     * @param {String} request - The requested parameters for the search.
     * @returns {void}
     */
    sendRequest: function (url, request) {
        const xhr = new XMLHttpRequest();

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    this.showSuggestions(xhr.responseText);
                }
                else if (xhr.status !== 0) {
                    this.showError(xhr.responseText);
                }
            }
        };
        xhr.open("GET", url + request);
        this.setHTTPRequest(xhr);
        xhr.send();
    },

    /**
     * If the request to the Service was successful the resulting hits are then pushed to the hitList.
     *
     * @param {String} results - The result text of the Request containing the results in JSON Format in the String.
     * @fires Searchbar#RadioTriggerSearchbarPushHits
     * @fires Searchbar#RadioTriggerSearchbarCreateRecommendedList
     * @returns {void}
     */
    showSuggestions: function (results) {
        // As the results are returned as a String but in JSON format they are first parsed before further processing.
        const res = JSON.parse(results),
            coordSystemName = res.crs.properties.name; // = "EPSG:31256";

        res.features.forEach(hit => {
            Radio.trigger("Searchbar", "pushHits", "hitList", {
                name: hit.properties.Adresse,
                metaName: hit.properties.Adresse,
                type: "Vienna Address Service",
                vas: true,
                glyphicon: "glyphicon-road",
                id: this.uniqueId("vas"),
                coordinate: crsModule.transform(coordSystemName, Radio.request("MapView", "getProjection").getCode(), hit.geometry.coordinates)
            });
        });
        Radio.trigger("Searchbar", "createRecommendedList", "vas");
    },

    /**
     * Returns a unique id, starts with the given prefix
     * @param {string} prefix prefix for the id
     * @returns {string} a unique id
     */
    uniqueId: function (prefix) {
        let counter = this.get("idCounter");
        const id = ++counter;

        this.setIdCounter(id);
        return prefix ? prefix + id : id;
    },

    /**
    * Sets the idCounter.
    * @param {string} value - idCounter
    * @returns {void}
    */
    setIdCounter: function (value) {
        this.set("idCounter", value);
    },

    /**
     * Displays the error message depending on the used language as an Alert to the user.
     *
     * @param {String} error - The result text of the request containing the Error that occurred.
     * @fires Alerting#RadioTriggerAlertAlert
     * @returns {void}
     */
    showError: function (error) {
        Radio.trigger("Alert", "alert", `${i18next.t("additional:modules.searchbar.vas.errorMsg")} - ${error}`);
    },

    /**
     * Sets the URL of the VAS.
     *
     * @param {String} url The URL to the used by the Search Service.
     * @returns {void}
     */
    setVASServiceURL: function (url) {
        this.set("vasServiceURL", url);
    },

    /**
     * Set the minimum amount of needed chars to search in the VAS to the given amount.
     *
     * @param {Number} minChars - The minimal amount chars needed to be entered to start the search.
     * @returns {void}
     */
    setMinChars: function (minChars) {
        this.set("minChars", minChars);
    },

    /**
     * Sets the request for the current search.
     *
     * @param {XMLHttpRequest} request - The request to be executed.
     * @returns {void}
     */
    setHTTPRequest: function (request) {
        this.set("httpRequest", request);
    }
});

export default VASModel;
