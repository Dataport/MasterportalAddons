<script>
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersImporterAddon";
import mutations from "../store/mutationsImporterAddon";
import {isValidCapabilitiesUrl} from "../utils/capabilities";

export default {
    name: "ProvideOgcService",
    props: {
        serviceType: {
            type: String,
            required: true,
            validator: value => {
                return [
                    "wms",
                    "wfs"
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
        ...mapGetters("Modules/Importer", Object.keys(getters)),
        capabilitiesUrlValue: {
            get () {
                return this.capabilitiesUrl;
            },
            set (value) {
                this.setCapabilitiesUrl(value);
            }
        }
    },
    created () {
        const isValid = this.isFormValid();

        this.setCurrentFormValid(isValid);
    },
    mounted () {
        this.focusOnCapabilitiesInput();
    },
    methods: {
        ...mapActions("Modules/Importer", [
        ]),
        ...mapMutations("Modules/Importer", Object.keys(mutations)),

        /**
         * Handler for the Capabilities URL input events.
         *
         * @param {Object} evt The triggered event.
         * @returns {void}
         */
        onInputChange (evt) {
            const val = evt.target.value,
                isValid = val.length > 0;

            this.inputValid = isValid;
            this.setCurrentFormValid(this.isFormValid());
        },

        /**
         * Check if the form is valid.
         *
         * @returns {Boolean} True, if form is valid. False otherwise.
         */
        isFormValid () {
            return isValidCapabilitiesUrl(this.capabilitiesUrl);
        },

        /**
         * Focus on the capabilities input field.
         *
         * @returns {void}
         */
        focusOnCapabilitiesInput () {
            this.$nextTick(() => {
                const capabilitiesInputRef = "importer-addon-capabilities-input",
                    capabilitiesInput = this.$refs[capabilitiesInputRef];

                if (capabilitiesInput) {
                    capabilitiesInput.focus({focusVisible: true});
                }
            });
        }
    }
};
</script>

<template lang="html">
    <div class="importer-addon-provide-ogc-service">
        <div
            v-if="serviceType === 'wms'"
            class="provide-ogc-service mb-3"
        >
            <span>
                {{ $t("additional:modules.tools.importer.provideWMSText") }}
            </span>
        </div>
        <div
            v-if="serviceType === 'wfs'"
            class="provide-ogc-service mb-3"
        >
            <span>
                {{ $t("additional:modules.tools.importer.provideWFSText") }}
            </span>
        </div>
        <div class="'form-group'">
            <input
                ref="importer-addon-capabilities-input"
                v-model="capabilitiesUrlValue"
                class="form-control"
                :placeholder="$t('additional:modules.tools.importer.capabilitiesUrlPlaceholder')"
                aria-describedby="capabilities-url-help-block"
                @input="onInputChange"
                @blur="onInputChange"
            >
        </div>
    </div>
</template>

<style lang="scss" scoped>
.provide-ogc-service {
  font-size: large;
}

</style>
