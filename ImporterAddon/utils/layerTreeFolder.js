/**
 * Sets the title for the folder in the layer tree.
 *
 * @param {String} title The new title for the folder.
 * @param {String} folderId The id of the folder.
 * @returns {void}
 */
export function setLayerTreeFolderTitle (title, folderId) {
    const folderEl = $("div." + folderId + " .control-label")[0];

    if (folderEl) {
        folderEl.innerText = title;
    }
    // make sure folder stays at specified position
    $("#Overlayer").parent().after($("#" + folderId).parent());
}

/**
 * Adds the folder that will contain the layers to the layer tree.
 *
 * @param {String} title The title of the folder.
 * @param {String} folderId The id of the folder.
 * @returns {void}
 */
export function addLayerTreeFolder (title, folderId) {
    console.log(title);
    console.log(folderId)
    //Radio.trigger("Parser", "addFolder", title, folderId, "tree", 0);
    //Radio.trigger("ModelList", "renderTree");
    //$("#Overlayer").parent().after($("#" + folderId).parent());
}

/**
 * Checks if the folder already exists in layer tree.
 *
 * @param {String} folderId The id of the folder.
 * @returns {Boolean} True, if folder already exists. False otherwise.
 */
export function layerTreeFolderExists (folderId) {
    console.log(folderId)
    //return $("#" + folderId).length > 0; // TODO
    return false;
}

export default {
    addLayerTreeFolder,
    layerTreeFolderExists,
    setLayerTreeFolderTitle
};
