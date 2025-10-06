<script>
import {mapGetters, mapActions, mapMutations} from "vuex";
import mutations from "../store/mutationsImporterAddon";

import FILETYPES from "../constants/filetypes";
import MIMETYPES from "../constants/mimetypes";

import {isMimeTypeAccepted, isFileExtensionAccepted} from "../utils/file";
import {generateId} from "../utils/layer";

export default {
    name: "FileUpload",
    props: {
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
        }
    },
    data () {
        return {
            inputValid: true
        };
    },
    computed: {
        ...mapGetters("Modules/Importer", [
            "inputFile",
            "idCounter",
            "layerTreeFolderId",
            "currentFormValid",
            "fileUploadIcon",
            "removeFileIcon"
        ]),
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
        ...mapActions("Modules/Importer", [
            "setSelectedLayerFromFile"
        ]),
        ...mapMutations("Modules/Importer", Object.keys(mutations)),

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
            this.setInputFile(file);
            this.handleFileUpload(file);
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
         * Handles the file upload, checks if the file is valid and if so sets the selected layer.
         *
         * @param {File} file The file to handle
         * @returns {void}
         */
        handleFileUpload (file) {
            const fileTypeAccepted = isMimeTypeAccepted(file.type, this.serviceType),
                fileExtensionAccepted = isFileExtensionAccepted(file.name, this.serviceType),
                isValid = fileTypeAccepted || fileExtensionAccepted;

            let layerId;

            this.setCurrentFormValid(this.isFormValid());
            this.focusOnHiddenInput();

            if (!isValid) {
                this.inputValid = false;
                this.setCurrentFormValid(false);
            }
            else {
                this.inputValid = true;
                this.incrementIdCounter();

                layerId = generateId(this.idCounter);

                this.setSelectedLayerFromFile({
                    file,
                    layerId,
                    fileType: this.serviceType,
                    folderId: this.layerTreeFolderId
                });
            }


        },

        /**
         * Handler for the click event when removing a file.
         *
         * @returns {void}
         */
        onRemoveFileClick () {
            this.setInputFile(undefined);
            this.inputValid = true;
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
            <span class="fs-5">
                {{ $t("additional:modules.tools.importerAddon.provideGeoJsonText") }}
            </span>
        </div>
        <div v-if="serviceType === 'shapezip'">
            <span class="fs-5">
                {{ $t("additional:modules.tools.importerAddon.provideShapeZipText") }}
            </span>
        </div>
        <div v-if="serviceType === 'geopackage'">
            <span class="fs-5">
                {{ $t("additional:modules.tools.importerAddon.provideGeoPackageText") }}
            </span>
        </div>
        <div :class="['form-group', 'm-4', {['has-error']: !inputValid, ['has-success']: inputValid && inputFile}]">
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
                    :class="`${fileUploadIcon} icon`"
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
            <div class="text-placeholder mt-3">
                <span
                    v-if="!inputValid && inputFile"
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
                    {{ $t('additional:modules.tools.importerAddon.removeFileText')+ ': ' + inputFile.name }}
                </span>
                <span
                    v-if="!inputFile"
                    id="file-upload-text-required"
                >
                    {{ $t("additional:modules.tools.importerAddon.fileUploadRequiredText") }}
                </span>
            </div>
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

.text-placeholder {
    min-height: 2.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;

    #file-upload-text-required {
        display: block;
    }
}

.form-group {
    display: inline-flex;
    flex-direction: column;

    &.has-error .drop-zone {
        color: #af100d;
        border-color: #af100d;
    }

    &.has-success .drop-zone {
        color: #2a992b;
        border-color: #2a992b;
    }

    .remove-file {
        color: #af100d;

        .icon {
            font-size: large;
        }
    }

    .help-block {
        display: flex;
        align-items: center;
    }

    .drop-zone {
        display: flex;
        align-items: center;
        justify-content: center;

        width: 15em;
        height: 15em;

        border-style: dashed;
        border-color: #ccc;
        border-width: 0,125em;
        border-radius: 15%;

        background-color: rgba(248, 249, 250, 0.3);

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

      @media (max-width: 768px) {
        width: 10em;
        height: 10em;
      }

      @media (max-width: 480px) {
        width: 8em;
        height: 8em;
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
