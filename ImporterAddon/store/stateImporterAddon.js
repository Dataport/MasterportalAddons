import {getWorkflowNames} from "../utils/workflows";

export const DEFAULT_VALUES = {
        currentWorkflow: undefined,
        selectedWorkflow: "wms",
        currentStep: undefined,
        capabilitiesUrl: "",
        capabilitiesVersion: undefined,
        currentFormValid: false,
        selectedLayers: [],
        layerTreeFolderId: "import_folder ",
        idCounter: 100,
        importedFolderCounter: 0,
        shapeFileFolderCounter: 0,
        geoJsonFolderCounter: 0,
        geoPackageFolderCounter: 0,
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
     * @property {String} icon icon next to title (config-param)
     * @property {String} id Internal Identifier for the Tool.
     * @property {Boolean} isVisibleInMenu If true, the tool is listed in the menu.
     * @property {String} name Title of the Tool. Can be configured through the config.json.
     * @property {String} currentWorkflow The name of the currently active workflow.
     * @property {String} selectedWorkflow The name of the currently selected workflow (needed for workflow selection radios).
     * @property {String} currentStep The name of the currently active step.
     * @property {String} capabilitiesUrl The capabilities url.
     * @property {String} capabilitiesVersion The capabilities version.
     * @property {Boolean} currentFormValid True, if the currently visible form is valid. False otherwise.
     * @property {Object[]} selectedLayers List of layers to be imported. Each object follows the structure of the masterportal layer parser.
     * @property {String} layerTreeFolderId The id of the folder in the layer tree, where layers should be added to.
     * @property {Number} idCounter The numeric part of the generated layer id. This is used to avoid id collisions.
     * @property {Number} importedFolderCounter The counter used for imported folder ids.
     * @property {Number} geoJsonFolderCounter The counter used for geojson folder ids.
     * @property {Number} shapeFileFolderCounter The counter used for shape file folder ids.
     * @property {Number} geoPackageFolderCounter The counter used for geo package folder ids.
     * @property {File} inputFile The input file for local uploads.
     * @property {Function} onImportFinished A function that is triggered, when the import has finished.
     * @property {String[]} supportedImportWorkflows The import workflows that will be supported.
     * @property {String} fileUploadIcon The icon string for the upload icon.
     * @property {String} removeFileIcon The icon string for the remove-file icon.
     */
    state = {
        active: false,
        icon: "bi-upload",
        id: "importerAddon",
        type: "importerAddon",
        name: "additional:modules.tools.importerAddon.title",
        ...DEFAULT_VALUES
    };

export default state;
