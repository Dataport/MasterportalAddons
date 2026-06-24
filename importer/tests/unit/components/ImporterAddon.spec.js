import {createStore} from "vuex";
import {expect} from "chai";
import sinon from "sinon";
import {shallowMount} from "@vue/test-utils";
import ImporterAddon from "../../../components/ImporterAddon.vue";
import ImporterStore from "../../../store/ImporterAddon.js";
import {DEFAULT_VALUES} from "../../../store/stateImporterAddon.js";
import STEPS from "../../../constants/steps.js";

describe("addons/importer/components/ImporterAddon.vue", () => {
    let store, wrapper;

    /**
     * Helper function to create a wrapper with optional store overrides.
     *
     * @param {Object} storeOverrides Additional state values to override defaults.
     * @returns {VueWrapper} Mounted component wrapper.
     */
    function createWrapper (storeOverrides = {}) {
        store = createStore({
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        Importer: {
                            ...ImporterStore,
                            state: {
                                ...ImporterStore.state,
                                ...DEFAULT_VALUES,
                                active: true,
                                ...storeOverrides
                            }
                        }
                    }
                },
                Alerting: {
                    namespaced: true,
                    actions: {
                        addSingleAlert: sinon.stub()
                    }
                },
                Menu: {
                    namespaced: true,
                    getters: {
                        mainMenu: () => ({sections: []}),
                        secondaryMenu: () => ({sections: []})
                    },
                    actions: {
                        resetMenu: sinon.stub()
                    }
                }
            },
            actions: {
                addLayerToLayerConfig: sinon.stub()
            }
        });

        return shallowMount(ImporterAddon, {
            global: {
                plugins: [store],
                mocks: {
                    $t: key => key
                }
            }
        });
    }

    afterEach(() => {
        if (wrapper) {
            wrapper.unmount();
        }
        sinon.restore();
    });

    describe("rendering", () => {
        it("renders the importer root element", () => {
            wrapper = createWrapper();
            expect(wrapper.find("#importer").exists()).to.be.true;
        });

        it("shows WorkflowSelection when workflow is undefined", () => {
            wrapper = createWrapper({currentWorkflow: undefined});
            expect(wrapper.findComponent({name: "WorkflowSelection"}).exists()).to.be.true;
        });

        it("shows ProvideOgcService on provideOgcService step", () => {
            wrapper = createWrapper({
                currentWorkflow: "wms",
                currentStep: STEPS.provideOgcService
            });
            expect(wrapper.findComponent({name: "ProvideOgcService"}).exists()).to.be.true;
        });

        it("shows LayerSelection on selectLayers step", () => {
            wrapper = createWrapper({
                currentWorkflow: "wms",
                currentStep: STEPS.selectLayers
            });
            expect(wrapper.findComponent({name: "LayerSelection"}).exists()).to.be.true;
        });

        it("shows FileUpload on uploadFile step", () => {
            wrapper = createWrapper({
                currentWorkflow: "geojson",
                currentStep: STEPS.uploadFile
            });
            expect(wrapper.findComponent({name: "FileUpload"}).exists()).to.be.true;
        });

        it("shows StyleLayers on styleLayers step", () => {
            wrapper = createWrapper({
                currentWorkflow: "wfs",
                currentStep: STEPS.styleLayers,
                selectedLayers: [{name: "test"}]
            });
            expect(wrapper.findComponent({name: "StyleLayers"}).exists()).to.be.true;
        });
    });

    describe("navigation buttons", () => {
        it("shows prev button when workflow is not undefined", () => {
            wrapper = createWrapper({currentWorkflow: "wms"});
            const buttons = wrapper.findAllComponents({name: "FlatButton"});
            const texts = buttons.map(b => b.props("text"));

            expect(texts).to.include("additional:modules.tools.importer.prev");
        });

        it("shows next button when not on last step", () => {
            wrapper = createWrapper({
                currentWorkflow: "wms",
                currentStep: STEPS.provideOgcService
            });
            const buttons = wrapper.findAllComponents({name: "FlatButton"});
            const texts = buttons.map(b => b.props("text"));

            expect(texts).to.include("additional:modules.tools.importer.next");
        });

        it("shows finish button on last step", () => {
            wrapper = createWrapper({
                currentWorkflow: "wfs",
                currentStep: STEPS.styleLayers
            });
            const buttons = wrapper.findAllComponents({name: "FlatButton"});
            const texts = buttons.map(b => b.props("text"));

            expect(texts).to.include("additional:modules.tools.importer.finish");
        });

        it("disables next button when form is invalid", () => {
            wrapper = createWrapper({
                currentWorkflow: "wms",
                currentStep: STEPS.provideOgcService,
                currentFormValid: false
            });
            const nextBtn = wrapper.findAllComponents({name: "FlatButton"})
                .find(b => b.props("text") === "additional:modules.tools.importer.next");

            expect(nextBtn.props("disabled")).to.be.true;
        });
    });

    describe("layer tree folder title", () => {
        it("returns custom title for wms with selected layers", () => {
            wrapper = createWrapper({
                currentWorkflow: "wms",
                selectedLayers: [{layers: "Custom Layer Name"}]
            });

            expect(wrapper.vm.layerTreeFolderTitle).to.equal("Custom Layer Name");
        });

        it("returns generated title for geojson import", () => {
            wrapper = createWrapper({
                currentWorkflow: "geojson",
                geoJsonFolderCounter: 1
            });

            expect(wrapper.vm.layerTreeFolderTitle).to.include("GeoJSON Import");
        });
    });
});
