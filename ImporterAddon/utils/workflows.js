import WORKFLOWS from "../constants/workflows";

/**
 * Return the names of all workflows.
 *
 * @returns {String[]} List of the names of all workflows.
 */
export function getWorkflowNames () {
    return Object.keys(WORKFLOWS);
}

export default {
    getWorkflowNames
};
