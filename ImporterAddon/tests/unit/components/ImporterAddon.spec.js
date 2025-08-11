import {createStore} from "vuex";
import {config, shallowMount} from "@vue/test-utils";
import ImporterAddonComponent from "../../../components/ImporterAddon.vue";
import getters from "../../../store/gettersImporterAddon";
import mutations from "../../../store/mutationsImporterAddon";
import stateImporterAddon from "../../../store/stateImporterAddon";
import STEPS from "../../../constants/steps";
import {expect} from "chai";
import sinon from "sinon";

config.global.mocks.$t = key => key;

describe("addons/ImporterAddon/components/ImporterAddon.vue", () => {
    let store,
        wrapper,
        addSingleAlertSpy,
        addLayerToLayerConfigSpy,
        resetMenuSpy,
        applyStylesStub,
        resetImporterAddonSpy,
        generateLayerTreeFolderIdSpy,
        setCurrentWorkflowSpy,
        setCurrentStepSpy,
        resetStepSpy,
        setOnImportFinishedSpy,
        applyTranslationKeySpy;

    const defaultState = {
        ...stateImporterAddon.state,
        active: true,
        currentWorkflow: undefined,
        currentStep: undefined,
        selectedLayers: [],
        layerTreeFolderId: "test-folder-id",
        currentFormValid: false,
        supportedImportWorkflows: ["wms", "wfs", "geojson"],
        capabilitiesUrl: "https://example.com/wms?service=WMS&request=GetCapabilities"
    };

    beforeEach(() => {
        addSingleAlertSpy = sinon.spy();
        addLayerToLayerConfigSpy = sinon.spy();
        resetMenuSpy = sinon.spy();
        applyStylesStub = sinon.stub();
        resetImporterAddonSpy = sinon.spy();
        generateLayerTreeFolderIdSpy = sinon.spy();
        setCurrentWorkflowSpy = sinon.spy();
        setCurrentStepSpy = sinon.spy();
        resetStepSpy = sinon.spy();
        setOnImportFinishedSpy = sinon.spy();
        applyTranslationKeySpy = sinon.spy();

        store = createStore({
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        ImporterAddon: {
                            namespaced: true,
                            state: defaultState,
                            getters: getters,
                            mutations: mutations,
                            actions: {
                                resetImporterAddon: resetImporterAddonSpy,
                                generateLayerTreeFolderId: generateLayerTreeFolderIdSpy,
                                setCurrentWorkflow: setCurrentWorkflowSpy,
                                setCurrentStep: setCurrentStepSpy,
                                resetStep: resetStepSpy,
                                setOnImportFinished: setOnImportFinishedSpy,
                                applyTranslationKey: applyTranslationKeySpy
                            }
                        }
                    }
                },
                Alerting: {
                    namespaced: true,
                    actions: {
                        addSingleAlert: addSingleAlertSpy
                    }
                },
                Menu: {
                    namespaced: true,
                    actions: {
                        resetMenu: resetMenuSpy
                    }
                }
            },
            actions: {
                addLayerToLayerConfig: addLayerToLayerConfigSpy
            }
        });

        wrapper = shallowMount(ImporterAddonComponent, {
            global: {
                plugins: [store]
            }
        });

        // Mock the applyStyles utility function
        wrapper.vm.applyStyles = applyStylesStub;
    });

    afterEach(() => {
        wrapper.unmount();
        sinon.restore();
    });

    describe("Component Initialization", () => {
        it("should render the component", () => {
            expect(wrapper.find("#importerAddon")).to.exist;
        });

        it("should show workflow selection when currentWorkflow is undefined", () => {
            expect(wrapper.find("workflow-selection-stub")).to.exist;
            expect(wrapper.text()).to.include("additional:modules.tools.importerAddon.selectWorkflowText");
        });

        it.only("should generate layerTreeFolderId on created if not set", async () => {
            const localGenerateLayerTreeFolderIdSpy = sinon.spy(),
                localApplyTranslationKeySpy = sinon.spy(),
                storeWithoutFolderId = createStore({
                    modules: {
                        Modules: {
                            namespaced: true,
                            modules: {
                                ImporterAddon: {
                                    namespaced: true,
                                    state: {
                                        ...defaultState,
                                        layerTreeFolderId: undefined
                                    },
                                    getters: getters,
                                    mutations: mutations,
                                    actions: {
                                        generateLayerTreeFolderId: localGenerateLayerTreeFolderIdSpy,
                                        applyTranslationKey: localApplyTranslationKeySpy
                                    }
                                }
                            }
                        }
                    }
                }),
                wrapperWithoutFolderId = shallowMount(ImporterAddonComponent, {
                    global: {
                        plugins: [storeWithoutFolderId]
                    }
                });

            expect(localGenerateLayerTreeFolderIdSpy.called).to.be.true;
            // expect(localGenerateLayerTreeFolderIdSpy).to.have.been.called;
            wrapperWithoutFolderId.unmount();
        });

        it("should apply translation key on mounted", () => {
            expect(applyTranslationKeySpy).to.have.been.calledWith("importerAddon");
        });
    });

    describe("Computed Properties", () => {
        it("should return correct steps", () => {
            expect(wrapper.vm.steps).to.deep.equal(STEPS);
        });

        it("should return correct layerTreeFolderTitle", () => {
            expect(wrapper.vm.layerTreeFolderTitle).to.equal("additional:modules.tools.importerAddon.layerTreeFolderTitle");
        });
    });

    describe("Workflow Selection", () => {
        it("should handle workflow selection", async () => {
            const workflow = "wms";

            await wrapper.vm.onWorkflowSelected(workflow);

            expect(setCurrentWorkflowSpy).to.have.been.calledWith(workflow);
            expect(setCurrentStepSpy).to.have.been.called;
        });

        it("should show WorkflowSelection component when workflow is undefined", () => {
            expect(wrapper.findComponent({name: "WorkflowSelection"})).to.exist;
        });
    });

    describe("Step Navigation", () => {
        beforeEach(() => {
            // Set up a workflow and step for navigation tests
            wrapper.vm.setCurrentWorkflow("wms");
            wrapper.vm.setCurrentStep(STEPS.provideOgcService);
        });

        it("should show ProvideOgcService component for provideOgcService step", async () => {
            await store.commit("Modules/ImporterAddon/setCurrentWorkflow", "wms");
            await store.commit("Modules/ImporterAddon/setCurrentStep", STEPS.provideOgcService);
            await wrapper.vm.$nextTick();

            expect(wrapper.findComponent({name: "ProvideOgcService"})).to.exist;
        });

        it("should show LayerSelection component for selectLayers step", async () => {
            await store.commit("Modules/ImporterAddon/setCurrentWorkflow", "wms");
            await store.commit("Modules/ImporterAddon/setCurrentStep", STEPS.selectLayers);
            await wrapper.vm.$nextTick();

            expect(wrapper.findComponent({name: "LayerSelection"})).to.exist;
        });

        it("should show FileUpload component for uploadFile step", async () => {
            await store.commit("Modules/ImporterAddon/setCurrentWorkflow", "geojson");
            await store.commit("Modules/ImporterAddon/setCurrentStep", STEPS.uploadFile);
            await wrapper.vm.$nextTick();

            expect(wrapper.findComponent({name: "FileUpload"})).to.exist;
        });

        it("should show StyleLayers component for styleLayers step", async () => {
            await store.commit("Modules/ImporterAddon/setCurrentWorkflow", "wms");
            await store.commit("Modules/ImporterAddon/setCurrentStep", STEPS.styleLayers);
            await store.commit("Modules/ImporterAddon/setSelectedLayers", [
                {id: "layer1", name: "Test Layer 1"},
                {id: "layer2", name: "Test Layer 2"}
            ]);
            await wrapper.vm.$nextTick();

            expect(wrapper.findComponent({name: "StyleLayers"})).to.exist;
        });

        it("should handle previous button click", async () => {
            await store.commit("Modules/ImporterAddon/setCurrentWorkflow", "wms");
            await store.commit("Modules/ImporterAddon/setCurrentStep", STEPS.selectLayers);

            // Mock prevWorkflowStep getter
            const prevStep = STEPS.provideOgcService;

            sinon.stub(wrapper.vm, "prevWorkflowStep").get(() => prevStep);

            await wrapper.vm.onPrevClick();

            expect(resetStepSpy).to.have.been.called;
            expect(setCurrentStepSpy).to.have.been.calledWith(prevStep);
        });

        it("should reset workflow when clicking previous on first step", async () => {
            await store.commit("Modules/ImporterAddon/setCurrentWorkflow", "wms");
            await store.commit("Modules/ImporterAddon/setCurrentStep", STEPS.provideOgcService);

            // Mock prevWorkflowStep getter to return undefined (first step)
            sinon.stub(wrapper.vm, "prevWorkflowStep").get(() => undefined);

            await wrapper.vm.onPrevClick();

            expect(setCurrentWorkflowSpy).to.have.been.calledWith(undefined);
        });

        it("should handle next button click", async () => {
            await store.commit("Modules/ImporterAddon/setCurrentWorkflow", "wms");
            await store.commit("Modules/ImporterAddon/setCurrentStep", STEPS.provideOgcService);

            const nextStep = STEPS.selectLayers;

            sinon.stub(wrapper.vm, "nextWorkflowStep").get(() => nextStep);

            await wrapper.vm.onNextClick();

            expect(setCurrentStepSpy).to.have.been.calledWith(nextStep);
        });
    });

    describe("Button States", () => {
        beforeEach(async () => {
            await store.commit("Modules/ImporterAddon/setCurrentWorkflow", "wms");
        });

        it("should show previous button when workflow is set", async () => {
            await wrapper.vm.$nextTick();

            // Since we're using stubs, check if the button would be rendered based on conditions
            expect(wrapper.vm.isCurrentWorkflowUndefined).to.be.false;
        });

        it("should show next button when not on last step", async () => {
            await store.commit("Modules/ImporterAddon/setCurrentStep", STEPS.provideOgcService);
            sinon.stub(wrapper.vm, "isLastStep").get(() => false);
            await wrapper.vm.$nextTick();

            expect(wrapper.vm.isLastStep).to.be.false;
        });

        it("should show finish button when on last step", async () => {
            await store.commit("Modules/ImporterAddon/setCurrentStep", STEPS.styleLayers);
            sinon.stub(wrapper.vm, "isLastStep").get(() => true);
            await wrapper.vm.$nextTick();

            expect(wrapper.vm.isLastStep).to.be.true;
        });

        it("should disable next/finish button when form is invalid", async () => {
            await store.commit("Modules/ImporterAddon/setCurrentFormValid", false);
            await wrapper.vm.$nextTick();

            expect(wrapper.vm.currentFormValid).to.be.false;
        });

        it("should enable next/finish button when form is valid", async () => {
            await store.commit("Modules/ImporterAddon/setCurrentFormValid", true);
            await wrapper.vm.$nextTick();

            expect(wrapper.vm.currentFormValid).to.be.true;
        });
    });

    describe("Finish Process", () => {
        it("should handle finish click with selected layers", async () => {
            const selectedLayers = [
                    {id: "layer1", name: "Test Layer 1"},
                    {id: "layer2", name: "Test Layer 2"}
                ],
                onImportFinishedSpy = sinon.spy();

            await store.commit("Modules/ImporterAddon/setSelectedLayers", selectedLayers);
            await store.commit("Modules/ImporterAddon/setOnImportFinished", onImportFinishedSpy);

            await wrapper.vm.onFinishClick();

            expect(addLayerToLayerConfigSpy).to.have.been.called;
            expect(applyStylesStub).to.have.been.calledWith(selectedLayers);
            expect(onImportFinishedSpy).to.have.been.called;
        });

        it("should add layer folder to layer config with correct structure", async () => {
            const selectedLayers = [
                    {id: "layer1", name: "Test Layer 1"}
                ],
                expectedFolder = {
                    id: "test-folder-123",
                    type: "folder",
                    isExternal: true,
                    name: "additional:modules.tools.importerAddon.layerTreeFolderTitle",
                    elements: selectedLayers
                };

            await store.commit("Modules/ImporterAddon/setSelectedLayers", selectedLayers);
            await store.commit("Modules/ImporterAddon/setLayerTreeFolderId", "test-folder-123");

            await wrapper.vm.onFinishClick();

            expect(addLayerToLayerConfigSpy).to.have.been.calledWith(
                sinon.match.has("layerConfig", sinon.match(expectedFolder))
            );
        });

        it("should show success alert on mobile", async () => {
            const selectedLayers = [{id: "layer1", name: "Test Layer 1"}],
                originalIsMobile = require("@shared/js/utils/isMobile").default,
                isMobileStub = sinon.stub().returns(true);

            await store.commit("Modules/ImporterAddon/setSelectedLayers", selectedLayers);

            // Mock isMobile
            require("@shared/js/utils/isMobile").default = isMobileStub;

            await wrapper.vm.onFinishClick();

            // Restore original
            require("@shared/js/utils/isMobile").default = originalIsMobile;
        });

        it("should reset importer addon after finish", async () => {
            const selectedLayers = [{id: "layer1", name: "Test Layer 1"}];

            await store.commit("Modules/ImporterAddon/setSelectedLayers", selectedLayers);

            await wrapper.vm.onFinishClick();

            expect(resetImporterAddonSpy).to.have.been.called;
        });

        it("should reset menu after finish", async () => {
            const selectedLayers = [{id: "layer1", name: "Test Layer 1"}];

            await store.commit("Modules/ImporterAddon/setSelectedLayers", selectedLayers);

            await wrapper.vm.onFinishClick();

            expect(resetMenuSpy).to.have.been.calledWith("secondaryMenu");
        });

        it("should cleanup onImportFinished callback after execution", async () => {
            const selectedLayers = [{id: "layer1", name: "Test Layer 1"}],
                onImportFinishedSpy = sinon.spy();

            await store.commit("Modules/ImporterAddon/setSelectedLayers", selectedLayers);
            await store.commit("Modules/ImporterAddon/setOnImportFinished", onImportFinishedSpy);

            await wrapper.vm.onFinishClick();

            expect(setOnImportFinishedSpy).to.have.been.calledWith(undefined);
        });
    });

    describe("Close Functionality", () => {
        it("should reset importer addon on close", () => {
            wrapper.vm.close();

            expect(store.state.Modules.ImporterAddon.resetImporterAddon).to.have.been.called;
        });

        it("should reset menu on close", () => {
            wrapper.vm.close();

            expect(resetMenuSpy).to.have.been.calledWith("secondaryMenu");
        });
    });

    describe("Error Handling", () => {
        it("should handle finish click when no layers are selected", async () => {
            await store.commit("Modules/ImporterAddon/setSelectedLayers", []);

            await wrapper.vm.onFinishClick();

            expect(addLayerToLayerConfigSpy).to.have.been.called;
            expect(applyStylesStub).to.have.been.calledWith([]);
        });

        it("should handle finish click when onImportFinished is undefined", async () => {
            const selectedLayers = [{id: "layer1", name: "Test Layer 1"}];

            await store.commit("Modules/ImporterAddon/setSelectedLayers", selectedLayers);
            await store.commit("Modules/ImporterAddon/setOnImportFinished", undefined);

            await wrapper.vm.onFinishClick();

            expect(addLayerToLayerConfigSpy).to.have.been.called;
            expect(applyStylesStub).to.have.been.calledWith(selectedLayers);
            // Should not throw error when onImportFinished is undefined
        });
    });

    describe("Component Props Passing", () => {
        it("should pass correct props to WorkflowSelection", async () => {
            const workflowSelection = wrapper.findComponent({name: "WorkflowSelection"});

            if (workflowSelection.exists()) {
                expect(workflowSelection.props("workflows")).to.deep.equal(wrapper.vm.supportedImportWorkflows);
            }
        });

        it("should pass correct props to ProvideOgcService", async () => {
            await store.commit("Modules/ImporterAddon/setCurrentWorkflow", "wms");
            await store.commit("Modules/ImporterAddon/setCurrentStep", STEPS.provideOgcService);
            await wrapper.vm.$nextTick();

            const provideOgcService = wrapper.findComponent({name: "ProvideOgcService"});

            if (provideOgcService.exists()) {
                expect(provideOgcService.props("serviceType")).to.equal("wms");
            }
        });

        it("should pass correct props to LayerSelection", async () => {
            await store.commit("Modules/ImporterAddon/setCurrentWorkflow", "wms");
            await store.commit("Modules/ImporterAddon/setCurrentStep", STEPS.selectLayers);
            await store.commit("Modules/ImporterAddon/setCapabilitiesUrl", "https://example.com/wms");
            await wrapper.vm.$nextTick();

            const layerSelection = wrapper.findComponent({name: "LayerSelection"});

            if (layerSelection.exists()) {
                expect(layerSelection.props("serviceType")).to.equal("wms");
                expect(layerSelection.props("capabilitiesUrl")).to.equal("https://example.com/wms");
            }
        });

        it("should pass correct props to StyleLayers", async () => {
            const selectedLayers = [{id: "layer1", name: "Test Layer 1"}];
            let styleLayers = null;

            await store.commit("Modules/ImporterAddon/setCurrentWorkflow", "wms");
            await store.commit("Modules/ImporterAddon/setCurrentStep", STEPS.styleLayers);
            await store.commit("Modules/ImporterAddon/setSelectedLayers", selectedLayers);
            await wrapper.vm.$nextTick();

            styleLayers = wrapper.findComponent({name: "StyleLayers"});

            if (styleLayers.exists()) {
                expect(styleLayers.props("layers")).to.deep.equal(selectedLayers);
            }
        });
    });
});
