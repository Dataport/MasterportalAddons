import SearchInterface from "../../../../src/modules/searchBar/searchInterfaces/searchInterface";
import store from "../../../../src/app-store";
import {uniqueId} from "../../../../src/shared/js/utils/uniqueId";
import crs from "@masterportal/masterportalapi/src/crs";
import {getValueFromObjectByPath} from "../../../../src/shared/js/utils/getValueFromObjectByPath";

/**
 * The Vienna search interface as addon.
 * @constructs
 * @extends SearchInterface
 * @param {String} [hitTemplate="default"] The template for rendering the hits.
 * @param {Object} [resultEvents] Actions that are executed when an interaction, such as hover or click, is performed with a result list item.
 * @param {String[]} [resultEvents.onClick=["setMarker", "zoomToFeature"]] Actions that are fired when clicking on a result list item.
 * @param {String[]} [resultEvents.onHover=["setMarker"]] Actions that are fired when hovering on a result list item.
 * @param {String} [searchInterfaceId="exampleSearch"] The id of the service interface.
 * @returns {void}
 */
export default function Wiengaz ({hitTemplate, resultEvents, serviceId, zoomLevel, icon, displayNameSourceProperty, tooltipSourceProperty, categorySourceProperty, pathToCrsSourceProperty, epsg, expandToHouseNumberSearch} = {}) {
    SearchInterface.call(this,
        "request",
        serviceId,
        resultEvents || {
            onClick: ["setMarker", "zoomToResult"],
            onHover: ["setMarker"]
        },
        hitTemplate
    );

    store.commit("Modules/SearchBar/setZoomLevel", zoomLevel);

    if (!displayNameSourceProperty) {
        console.warn("No name property defined for search interface 'wiengaz'. Default property 'name' is used.");
    }

    if (!categorySourceProperty) {
        console.warn("No category property defined for search interface 'wiengaz'. result wont be categorized.");
    }

    this.serviceId = serviceId;
    this.icon = icon || "bi-signpost-2";
    this.displayNameSourceProperty = displayNameSourceProperty || "name";
    this.tooltipSourceProperty = tooltipSourceProperty || this.displayNameSourceProperty;
    this.categorySourceProperty = categorySourceProperty || "";
    this.pathToCrsSourceProperty = pathToCrsSourceProperty || "";
    this.icon = icon || "bi-signpost-2";
    this.epsg = epsg || "EPSG:3857";
    this.expandToHouseNumberSearch = expandToHouseNumberSearch || false;
}

Wiengaz.prototype = Object.create(SearchInterface.prototype);

/**
 * Search in location finder search interface.
 * @override
 * @param {String} searchInput The search input.
 * @returns {void}
 */
Wiengaz.prototype.search = async function (searchInput) {
    const resultData = await this.requestSearch(this.createSearchUrl(searchInput), "GET");

    this.epsg = getValueFromObjectByPath(resultData, this.pathToCrsSourceProperty) || this.epsg;

    if (resultData) {
        this.pushHitsToSearchResults(this.normalizeResults(resultData.features));
    }

    if (this.expandToHouseNumberSearch && this.searchResults.length === 1 && this.searchResults[0].category === "Strassenname") {
        const resultDataWithHouseNumbers = await this.requestSearch(this.createSearchUrl(searchInput + " 0"), "GET");

        if (resultDataWithHouseNumbers) {
            this.pushHitsToSearchResults(this.normalizeResults(resultDataWithHouseNumbers.features));
        }
    }

    return this.searchResults;
};

/**
 * Normalizes the search results to display them in a SearchResult.
 * @param {Object} searchResult The search result of bkg geo search.
 * @returns {Object[]} The normalized search result.
 */
Wiengaz.prototype.normalizeResult = function (searchResult) {
    return {
        events: this.normalizeResultEvents(this.resultEvents, searchResult, {}),
        category: searchResult.properties[this.categorySourceProperty] || "",
        id: uniqueId("wiengaz"),
        icon: this.icon,
        name: searchResult.properties[this.displayNameSourceProperty],
        toolTip: searchResult.properties[this.tooltipSourceProperty]
    };
};

/**
 * Normalizes the search results to display them in a SearchResult.
 * @param {Object[]} searchResults The search results of bkg geo search.
 * @returns {Object[]} The normalized search result.
 */
Wiengaz.prototype.normalizeResults = function (searchResults) {
    const normalizedResults = [];

    searchResults.forEach(searchResult => {
        normalizedResults.push(this.normalizeResult(searchResult));
    });

    return normalizedResults;
};

/**
 * Creates the search url with GET parameters.
 * @param {String} searchInput The search Input
 * @returns {String} The search url.
 */
Wiengaz.prototype.createSearchUrl = function (searchInput) {
    const searchUrl = store?.getters?.restServiceById(this.serviceId)?.url;

    return `${searchUrl}?Address=${encodeURIComponent(searchInput)}`;
};

/**
 * Creates the possible actions and fills them.
 * @param {Object} searchResult The search result of locationFinder.
 * @returns {Object} The possible actions.
 */
Wiengaz.prototype.createPossibleActions = function (searchResult) {
    let extent = searchResult.bbox,
        coordinatesForMarker = searchResult.geometry.coordinates;

    if (store.getters["Maps/projectionCode"] !== this.epsg) {
        const lowerLeft = crs.transformToMapProjection(mapCollection.getMap("2D"), this.epsg, [parseFloat(extent[0]), parseFloat(extent[1])]),
            upperRight = crs.transformToMapProjection(mapCollection.getMap("2D"), this.epsg, [parseFloat(extent[2]), parseFloat(extent[3])]);

        extent = [lowerLeft[0], lowerLeft[1], upperRight[0], upperRight[1]];
        coordinatesForMarker = crs.transformToMapProjection(mapCollection.getMap("2D"), this.epsg, [parseFloat(coordinatesForMarker[0]), parseFloat(coordinatesForMarker[1])]);
    }

    return {
        setMarker: {
            coordinates: coordinatesForMarker
        },
        zoomToResult: {
            coordinates: extent
        }
    };
};
