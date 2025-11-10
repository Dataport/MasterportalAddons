import EXPORTFORMATS from "../constants/exportformats";
import STEPS from "../constants/steps";
import {WORKFLOW_NAMES} from "../constants/workflows";

export const DEFAULT_VALUES = {
        currentWorkflow: WORKFLOW_NAMES.default,
        currentStep: STEPS.selectLayer,
        currentFormValid: false,
        onExportFinished: undefined,
        selectedLayer: undefined,
        layerSelectionList: [],
        supportedExportFormats: [
            EXPORTFORMATS.geoJson,
            EXPORTFORMATS.gml,
            EXPORTFORMATS.shp,
            EXPORTFORMATS.gpkg
        ],
        selectedExportFormat: undefined
    },

    /**
     * @property {Boolean} active Current status of the Tool.
     * @property {String} icon icon used in the header of the window.
     * @property {String} id Internal Identifier for the Tool.
     * @property {String} name Title of the Tool. Can be configured through the config.json.
     * @property {String} currentStep The name of the currently active step.
     * @property {String} currentWorkflow The name of the currently active workflow.
     * @property {Boolean} currentFormValid True, if the currently visible form is valid. False otherwise.
     * @property {Function} onExportFinished A function that is triggered, when the export has finished.
     * @property {Object} selectedLayer The currently selected layer to export.
     * @property {String[]} supportedExportFormats List of supported export formats.
     * @property {String} selectedExportFormat The currently selected export format.
     */
    state = {
        active: false,
        icon: "bi-download",
        id: "exporter",
        name: "additional:modules.tools.exporterAddon.title",
        ...DEFAULT_VALUES
    };

export default state;
