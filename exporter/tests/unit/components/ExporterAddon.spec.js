import {createStore} from "vuex";
import {expect} from "chai";
import sinon from "sinon";
import {shallowMount} from "@vue/test-utils";
import ExporterAddon from "../../../components/ExporterAddon.vue";
import ExporterStore from "../../../store/ExporterAddon.js";
import {DEFAULT_VALUES} from "../../../store/stateExporterAddon.js";
import STEPS from "../../../constants/steps.js";
import * as downloadModule from "../../../utils/download.js";

describe("addons/exporter/components/ExporterAddon.vue", () => {
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
                        Exporter: {
                            ...ExporterStore,
                            state: {
                                ...ExporterStore.state,
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
                }
            }
        });

        return shallowMount(ExporterAddon, {
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
        it("renders the exporter root element", () => {
            wrapper = createWrapper();
            expect(wrapper.find("#exporter").exists()).to.be.true;
        });

        it("shows loading text and hides content when isLoading is true", async () => {
            wrapper = createWrapper();
            await wrapper.setData({isLoading: true});
            expect(wrapper.text()).to.include("additional:modules.tools.exporter.loadingText");
            expect(wrapper.find(".exporter-addon-wizard-content").exists()).to.be.false;
        });

        it("shows LayerSelection on selectLayer step", () => {
            wrapper = createWrapper({currentStep: STEPS.selectLayer});
            expect(wrapper.findComponent({name: "LayerSelection"}).exists()).to.be.true;
        });

        it("shows LayerDownloadOptions on downloadLayer step", () => {
            wrapper = createWrapper({currentStep: STEPS.downloadLayer});
            expect(wrapper.findComponent({name: "LayerDownloadOptions"}).exists()).to.be.true;
        });

        it("shows next button when not on last step", () => {
            wrapper = createWrapper({currentStep: STEPS.selectLayer});
            const buttons = wrapper.findAllComponents({name: "FlatButton"});
            const texts = buttons.map(b => b.props("text"));

            expect(texts).to.include("additional:modules.tools.exporter.next");
        });

        it("shows finish button on last step", () => {
            wrapper = createWrapper({currentStep: STEPS.downloadLayer});
            const buttons = wrapper.findAllComponents({name: "FlatButton"});
            const texts = buttons.map(b => b.props("text"));

            expect(texts).to.include("additional:modules.tools.exporter.finish");
        });

        it("hides prev button on first step", () => {
            wrapper = createWrapper({currentStep: STEPS.selectLayer});
            const buttons = wrapper.findAllComponents({name: "FlatButton"});
            const texts = buttons.map(b => b.props("text"));

            expect(texts).to.not.include("additional:modules.tools.exporter.prev");
        });

        it("shows prev button on second step", () => {
            wrapper = createWrapper({currentStep: STEPS.downloadLayer});
            const buttons = wrapper.findAllComponents({name: "FlatButton"});
            const texts = buttons.map(b => b.props("text"));

            expect(texts).to.include("additional:modules.tools.exporter.prev");
        });
    });

    describe("onNextClick", () => {
        it("advances to downloadLayer step", async () => {
            wrapper = createWrapper({currentStep: STEPS.selectLayer, currentFormValid: true});
            await wrapper.vm.onNextClick();
            expect(wrapper.vm.currentStep).to.equal(STEPS.downloadLayer);
        });
    });

    describe("onPrevClick", () => {
        it("goes back to selectLayer step", async () => {
            wrapper = createWrapper({currentStep: STEPS.downloadLayer});
            await wrapper.vm.onPrevClick();
            expect(wrapper.vm.currentStep).to.equal(STEPS.selectLayer);
        });
    });

    describe("onFinishClick", () => {
        it("executes download, manages loading state, and calls callback", async () => {
            let resolveDownload;

            sinon.stub(downloadModule, "downloadLayer").returns(
                new Promise(resolve => {
                    resolveDownload = resolve;
                })
            );
            const onExportFinished = sinon.stub();

            wrapper = createWrapper({
                currentStep: STEPS.downloadLayer,
                selectedLayer: {id: "layer1"},
                selectedExportFormat: "geoJson",
                downloadProjection: "EPSG:4326",
                onExportFinished
            });

            const finishPromise = wrapper.vm.onFinishClick();

            // Verify loading state starts
            expect(wrapper.vm.isLoading).to.be.true;

            resolveDownload();
            await finishPromise;

            // Verify loading state ends and callbacks executed
            expect(wrapper.vm.isLoading).to.be.false;
            expect(onExportFinished.calledOnce).to.be.true;
            expect(wrapper.vm.active).to.be.false;
        });

        it("dispatches alert on download error", async () => {
            const error = new Error("download failed");

            sinon.stub(downloadModule, "downloadLayer").rejects(error);
            global.i18next = {t: key => key};

            const addSingleAlertStub = sinon.stub();

            store = createStore({
                modules: {
                    Modules: {
                        namespaced: true,
                        modules: {
                            Exporter: {
                                ...ExporterStore,
                                state: {
                                    ...ExporterStore.state,
                                    ...DEFAULT_VALUES,
                                    active: true,
                                    currentStep: STEPS.downloadLayer
                                }
                            }
                        }
                    },
                    Alerting: {
                        namespaced: true,
                        actions: {
                            addSingleAlert: addSingleAlertStub
                        }
                    }
                }
            });

            wrapper = shallowMount(ExporterAddon, {
                global: {
                    plugins: [store],
                    mocks: {$t: key => key}
                }
            });

            await wrapper.vm.onFinishClick();

            expect(addSingleAlertStub.calledOnce).to.be.true;
        });
    });

    describe("close", () => {
        it("sets active to false when close is called", () => {
            wrapper = createWrapper();
            wrapper.vm.close();
            expect(wrapper.vm.active).to.be.false;
        });
    });
});
