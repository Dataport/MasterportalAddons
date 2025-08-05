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
        // Note: Selection of boundary (complete dataset vs current map extent)
        // was implemented, but removed.
        // Last commit that contains the selection of boundary is
        // 0e3191c2b1a685b13c5acb1eb6f6032a3e8db3ae
        selectedExportFormat: undefined,
        capabilitiesUrl: undefined
    },

    /**
     * @property {Boolean} active Current status of the Tool.
     * @property {Boolean} deactivateGFI If set to true, the activation of the tool deactivates the GFI tool.
     * @property {String} icon icon used in the header of the window.
     * @property {String} id Internal Identifier for the Tool.
     * @property {Boolean} isVisibleInMenu If true, the tool is listed in the menu.
     * @property {String} name Title of the Tool. Can be configured through the config.json.
     * @property {Boolean} renderToWindow Decides whether the Tool should be displayed as a window or as a sidebar.
     * @property {Boolean} resizableWindow Determines whether the Tool window can be resized.
     * @property {Boolean} withoutGUI Determines whether the window for the tool is rendered or not.
     * @property {Number} initialWidth Size of the sidebar when opening.
     * @property {Number} initialWidthMobile Mobile size of the sidebar when opening.
     * @property {String} currentStep The name of the currently active step.
     * @property {String} currentWorkflow The name of the currently active workflow.
     * @property {Boolean} currentFormValid True, if the currently visible form is valid. False otherwise.
     * @property {Function} onExportFinished A function that is triggered, when the export has finished.
     * @property {Object} selectedLayer The currently selected layer to export.
     * @property {String[]} supportedExportFormats List of supported export formats.
     * @property {String} selectedExportFormat The currently selected export format.
     * @property {String} capabilitiesUrl The url for a WFS GetCapabilities request (needed for externalWfs workflow).
     */
    state = {
        active: false,
        deactivateGFI: true,
        icon: "bi-download",
        id: "exporterAddon",
        isVisibleInMenu: true,
        renderToWindow: false,
        resizableWindow: true,
        withoutGUI: false,
        name: "additional:modules.tools.exporterAddon.title",
        initialWidth: 500,
        initialWidthMobile: 300,
        ...DEFAULT_VALUES
    };

export default state;
