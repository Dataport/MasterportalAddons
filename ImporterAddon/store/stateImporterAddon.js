import {getWorkflowNames} from "../utils/workflows";

export const DEFAULT_VALUES = {
        currentWorkflow: undefined,
        selectedWorkflow: "wms",
        currentStep: undefined,
        capabilitiesUrl: "",
        capabilitiesVersion: undefined,
        currentFormValid: false,
        selectedLayers: [],
        layerTreeFolderId: undefined,
        idCounter: 100,
        styleFillColor: [104, 170, 204, 1],
        styleStrokeColor: [153, 153, 153, 1],
        styleStrokeWidth: 5,
        styleCircleRadius: 10,
        inputFile: undefined,
        onImportFinished: undefined,
        supportedImportWorkflows: getWorkflowNames(),
        fileUploadIcon: "bi bi-cloud-arrow-up-fill",
        removeFileIcon: "bi bi-x-circle-fill"
    },

    /**
     * @property {Boolean} active Current status of the Tool.
     * @property {Boolean} deactivateGFI If set to true, the activation of the tool deactivates the GFI tool.
     * @property {String} icon icon next to title (config-param)
     * @property {String} id Internal Identifier for the Tool.
     * @property {Boolean} isVisibleInMenu If true, the tool is listed in the menu.
     * @property {String} name Title of the Tool. Can be configured through the config.json.
     * @property {Boolean} renderToWindow Decides whether the Tool should be displayed as a window or as a sidebar.
     * @property {Boolean} resizableWindow Determines whether the Tool window can be resized.
     * @property {Boolean} withoutGUI Determines whether the window for the tool is rendered or not.
     * @property {Number} initialWidth Size of the sidebar when opening.
     * @property {Number} initialWidthMobile Mobile size of the sidebar when opening.
     * @property {String} currentWorkflow The name of the currently active workflow.
     * @property {String} selectedWorkflow The name of the currently selected workflow (needed for workflow selection radios).
     * @property {String} currentStep The name of the currently active step.
     * @property {String} wfsExampleBase The base url for the example wfs.
     * @property {String} wfsExampleQuery The query part of the example wfs.
     * @property {String} wmsExampleBase The base url for the example wms.
     * @property {String} wmsExampleQuery The query part of the example wms.
     * @property {String} capabilitiesUrl The capabilities url.
     * @property {String} capabilitiesVersion The capabilities version.
     * @property {Boolean} currentFormValid True, if the currently visible form is valid. False otherwise.
     * @property {Object[]} selectedLayers List of layers to be imported. Each object follows the structure of the masterportal layer parser.
     * @property {String} layerTreeFolderId The id of the folder in the layer tree, where layers should be added to.
     * @property {Number} idCounter The numeric part of the generated layer id. This is used to avoid id collisions.
     * @property {File} inputFile The input file for local uploads.
     * @property {Function} onImportFinished A function that is triggered, when the import has finished.
     * @property {String[]} supportedImportWorkflows The import workflows that will be supported.
     * @property {String} fileUploadIcon The icon string for the upload icon.
     * @property {String} removeFileIcon The icon string for the remove-file icon.
     */
    state = {
        active: false,
        deactivateGFI: true,
        icon: "bi-upload",
        id: "importerAddon",
        type: "importerAddon",
        isVisibleInMenu: true,
        renderToWindow: false,
        resizableWindow: true,
        withoutGUI: false,
        name: "additional:modules.tools.importerAddon.title",
        initialWidth: 500,
        initialWidthMobile: 300,
        ...DEFAULT_VALUES
    };

export default state;
