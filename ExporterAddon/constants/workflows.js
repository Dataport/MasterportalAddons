import STEPS from "./steps";

export const WORKFLOW_NAMES = {
    default: "default",
    externalWfs: "externalWfs"
};

// eslint-disable-next-line one-var
export const WORKFLOWS = {
    [WORKFLOW_NAMES.default]: [STEPS.selectLayer, STEPS.downloadLayer],
    [WORKFLOW_NAMES.externalWfs]: [STEPS.selectExternalWfsLayer, STEPS.downloadLayer]
};

export default WORKFLOWS;
