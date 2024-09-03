import Wiengaz from "../../js/wiengaz.js";
import store from "../../../../../src/app-store";
import {expect} from "chai";
import SearchInterface from "../../../../../src/modules/searchBar/searchInterfaces/searchInterface.js";

describe("ADDONS: addons/searchInterfaces/Wiengaz.js", () => {
    let wiengaz;

    before(() => {
        store.getters = {
            "Maps/projectionCode": "EPSG:3857"
        };
        wiengaz = new Wiengaz();
    });

    afterEach(() => {
        wiengaz.clearSearchResults();
    });

    describe("prototype", () => {
        it("should be an instance of SearchInterface", () => {
            expect(wiengaz).to.be.an.instanceof(SearchInterface);
        });

        it("should have a search method", () => {
            expect(wiengaz).to.respondTo("search");
        });
    });

    describe("createPossibleActions", () => {
        it("should create possible actions from search result", () => {
            const coordinates = [566601.20, 5928101.43],
                searchResult = {
                    name: "Result Name1",
                    geometry: {
                        coordinates: coordinates
                    },
                    properties: {
                        attribute1: "value1",
                        attribute2: "value2",
                        attribute3: "value3"
                    }
                },
                searchInterfaces = [
                    {
                        attributesToShow: ["attribute1", "attribute2", "attribute3"],
                        title: "Search Interface 1"
                    }
                ],
                mockStore = {
                    getters: {
                        "Modules/SearchBar/searchInterfaces": searchInterfaces
                    }
                },
                newSearchInterface = new Wiengaz(mockStore),
                actions = newSearchInterface.createPossibleActions(searchResult);

            expect(actions).to.have.property("setMarker");
            expect(actions.setMarker).to.have.property("coordinates");
            expect(actions.setMarker.coordinates).to.deep.equal(searchResult.geometry.coordinates);
            expect(actions).to.have.property("zoomToResult");
            expect(actions.zoomToResult).to.have.property("coordinates");
            expect(actions.zoomToResult.coordinates).to.deep.equal(searchResult.bbox);
        });
    });
});
