<script>
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersImporterAddon";
import mutations from "../store/mutationsImporterAddon";

import FILETYPES from "../constants/filetypes";
import MIMETYPES from "../constants/mimetypes";

import {isMimeTypeAccepted, isFileExtensionAccepted} from "../utils/file";
import {generateId} from "../utils/layer";

export default {
    name: "FileUpload",
    props: {
        // TODO add other supported file upload formats
        serviceType: {
            type: String,
            required: true,
            validator: value => {
                return [
                    "geojson",
                    "shapezip",
                    "geopackage"
                ].includes(value);
            }
        },
        fileuploadIcon: {
            type: String,
            required: false,
            default: "bi-cloud-arrow-up-fill"
        },
        removefileIcon: {
            type: String,
            required: false,
            default: "bi-x-circle-fill"
        }
    },
    data () {
        return {
            inputValid: true
        };
    },
    computed: {
        ...mapGetters("Modules/ImporterAddon", Object.keys(getters)),
        acceptedMimeTypes: {
            get () {
                let mimeTypes;

                switch (this.serviceType) {
                    case "geojson":
                        mimeTypes = [].concat(FILETYPES.geojson, MIMETYPES.geojson).join(", ");
                        break;
                    case "shapezip":
                        mimeTypes = [].concat(FILETYPES.shapezip, MIMETYPES.shapezip).join(", ");
                        break;
                    case "geopackage":
                        mimeTypes = [].concat(FILETYPES.geopackage, MIMETYPES.geopackage).join(", ");
                        break;
                    default:
                        mimeTypes = "*";
                        break;
                }
                return mimeTypes;
            }
        }
    },
    created () {
        const isValid = this.isFormValid();

        this.setCurrentFormValid(isValid);
    },
    mounted () {
        if (this.currentFormValid) {
            this.focusOnHiddenInput();
        }
    },
    methods: {
        ...mapActions("Modules/ImporterAddon", [
            "setSelectedLayerFromFile"
        ]),
        ...mapMutations("Modules/ImporterAddon", Object.keys(mutations)),

        /**
         * Handler for the drop event.
         *
         * @param {Object} evt The triggered event.
         * @returns {void}
         */
        onFileDrop (evt) {
            evt.preventDefault();
            const file = evt.dataTransfer.files[0];

            if (!file) {
                return;
            }

            // eslint-disable-next-line one-var
            const fileTypeAccepted = isMimeTypeAccepted(file.type, this.serviceType),
                fileExtensionAccepted = isFileExtensionAccepted(file.name, this.serviceType),
                isValid = fileTypeAccepted || fileExtensionAccepted;

            if (isValid) {
                this.setInputFile(file);
            }
            else {
                this.setInputFile(undefined);
            }
            this.handleFileUpload(file);
            this.inputValid = isValid;
            this.setCurrentFormValid(this.isFormValid());
            this.focusOnHiddenInput();
        },

        /**
         * Handler for the click event on the upload icon.
         *
         * @returns {void}
         */
        onUploadIconClick () {
            const hiddenInput = this.$el.querySelector(".hidden-input");

            hiddenInput.click();
        },

        /**
         * Handler for the file input event.
         *
         * @returns {void}
         */
        onFileInput () {
            const hiddenInput = this.$el.querySelector(".hidden-input"),
                fileList = hiddenInput.files,
                file = fileList[0];

            this.setInputFile(file);
            this.handleFileUpload(file);
            this.inputValid = true;
            this.setCurrentFormValid(this.isFormValid());
            this.focusOnHiddenInput();
        },

        /**
         * Focus on the hidden input field.
         * This is needed in order to submit via Enter-button.
         *
         * @returns {void}
         */
        focusOnHiddenInput () {
            this.$nextTick(() => {
                const hiddenInputRef = "importer-addon-hidden-input",
                    hiddenInput = this.$refs[hiddenInputRef];

                if (hiddenInput) {
                    hiddenInput.focus();
                }
            });
        },

        /**
         * Handler for the drag over event.
         *
         * @param {Object} evt The triggered event
         * @returns {void}
         */
        onDragOver (evt) {
            evt.preventDefault();
        },

        /**
         * Handler for the key up event.
         *
         * @returns {void}
         */
        onKeyUp (evt) {
            if (evt.key === "Enter" || evt.key === " ") {
                this.onUploadIconClick();
            }
        },

        /**
         * Handles the file upload.
         *
         * @param {File} file The file to handle
         * @returns {void}
         */
        handleFileUpload (file) {
            this.incrementIdCounter();
            const layerId = generateId(this.idCounter);

            this.setSelectedLayerFromFile({
                file,
                layerId,
                fileType: this.serviceType,
                folderId: this.layerTreeFolderId
            });
        },

        /**
         * Handler for the click event when removing a file.
         *
         * @returns {void}
         */
        onRemoveFileClick () {
            this.setInputFile(undefined);
            this.inputValid = false;
            this.setCurrentFormValid(this.isFormValid());
        },

        /**
         * Check if the form is valid.
         *
         * @returns {Boolean} True, if form is valid. False otherwise.
         */
        isFormValid () {
            const fileProvided = this.inputFile !== undefined;

            return fileProvided;
        }
    }
};
</script>

<template lang="html">
    <div class="importer-addon-file-upload">
        <div v-if="serviceType === 'geojson'">
            <span>
                {{ $t("additional:modules.tools.importerAddon.provideGeoJsonText") }}
            </span>
        </div>
        <div v-if="serviceType === 'shapezip'">
            <span>
                {{ $t("additional:modules.tools.importerAddon.provideShapeZipText") }}
            </span>
        </div>
        <div v-if="serviceType === 'geopackage'">
            <span>
                {{ $t("additional:modules.tools.importerAddon.provideGeoPackageText") }}
            </span>
        </div>
        <div :class="['form-group', {['has-error']: !inputValid, ['has-success']: inputValid && inputFile}]">
            <button
                type="button"
                class="drop-zone"
                aria-label="File upload drop zone"
                @click="onUploadIconClick"
                @keyup="onKeyUp"
                @drop="onFileDrop"
                @dragover="onDragOver"
            >
                <i
                    :class="`${fileuploadIcon} icon`"
                />
                <input
                    type="file"
                    class="hidden-input"
                    name="hidden-input"
                    aria-label="hidden input"
                    :accept="acceptedMimeTypes"
                    @input="onFileInput"
                >
            </button>
            <span
                v-if="inputValid && inputFile"
                id="file-upload-help-block"
                class="help-block"
            >
                <button
                    type="button"
                    class="btn btn-link remove-file"
                    :aria-label="$t('additional:modules.tools.importerAddon.removeFileText')"
                    @click="onRemoveFileClick"
                >
                    <span
                        :class="`${removeFileIcon} icon`"
                        aria-hidden="true"
                    />
                </button>
                {{ inputFile.name }}
            </span>
            <span
                v-if="!inputValid"
                id="file-upload-help-block"
                class="help-block"
            >
                {{ $t("additional:modules.tools.importerAddon.fileUploadRequiredText") }}
            </span>
            <!-- This input is only used as focus target so that we can submit when pressing enter -->
            <!-- eslint-disable-next-line vuejs-accessibility/form-control-has-label -->
            <input
                ref="importer-addon-hidden-input"
                type="text"
                class="hidden-text-input"
            >
        </div>
    </div>
</template>

<style lang="scss" scoped>

.form-group {
    padding: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;

    &.has-error .drop-zone {
        color: #a94442;
        border-color: #a94442;
    }

    &.has-success .drop-zone {
        color: #3c763d;
        border-color: #3c763d;
    }

    .remove-file {
        color: #3c763d;
    }

    .drop-zone {
        display: flex;
        align-items: center;
        justify-content: center;

        width: 85px;
        height: 85px;

        border-style: solid;
        border-color: black;
        border-width: medium;
        border-radius: 25%;

        &:hover {
            cursor: pointer;
            color: #68aacc;
            border-color: #68aacc;
        }

        .icon {
            font-size: xxx-large;
        }

        .hidden-input {
            display: none;
        }
    }

    .hidden-text-input {
        width: 0;
        height: 0;
        opacity: 0;
        position: fixed;
        top: -10000px;
        left: -10000px;
    }
}
</style>
