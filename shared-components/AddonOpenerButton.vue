<script>
import {mapGetters, mapActions} from "vuex";
import FlatButton from "@shared/modules/buttons/components/FlatButton.vue";

export default {
    name: "AddonOpenerButton",
    components: {
        FlatButton
    },
    props: {
        buttonText: {
            type: String,
            default: "Import"
        },
        buttonClass: {
            type: String,
            default: "mt-3"
        },
        addonId: {
            type: String,
            default: "importerAddon"
        },
        addonName: {
            type: String,
            default: "Import"
        }
    },
    computed: {
        ...mapGetters("Menu", [
            "mainMenu",
            "secondaryMenu",
            "mainExpanded",
            "secondaryExpanded"
        ]),
        ...mapGetters("Menu", ["currentComponentName"]),

        /**
         * Checks if the ImporterAddon is available/configured in the main menu or secondary menu
         * @returns {Boolean} True if importerAddon is available
         */
        isAddonAvailable () {
            return this.isModuleInSections(this.mainMenu?.sections, this.addonId) ||
                   this.isModuleInSections(this.secondaryMenu?.sections, this.addonId);
        },

        addonMenu () {
            let menu = null;

            if (this.isModuleInSections(this.mainMenu?.sections, this.addonId)) {
                menu = "mainMenu";
            }
            else if (this.isModuleInSections(this.secondaryMenu?.sections, this.addonId)) {
                menu = "secondaryMenu";
            }
            return menu;
        },

        addonIsOpen () {
            if (this.isAddonAvailable) {
                return this.currentComponentName(this.addonMenu) === this.addonName;
            }
            return null;
        }
    },
    methods: {
        ...mapActions("Menu", ["changeCurrentComponent", "toggleMenu"]),

        openAddon () {
            if (!this.isAddonAvailable) {
                return;
            }
            const menuExpanded = this.addonMenu === "mainMenu" ? this.mainExpanded : this.secondaryExpanded;

            if (!menuExpanded) {
                this.toggleMenu(this.addonMenu);
            }
            // Change to addon component
            this.changeCurrentComponent({
                type: this.addonId,
                side: this.addonMenu,
                props: {
                    name: this.addonName
                }
            });
        },

        /**
         * Recursively searches for a module type in menu sections
         * @param {Array} sections - The menu sections to search in
         * @param {String} moduleType - The module type to search for
         * @returns {Boolean} True if module is found
         */
        isModuleInSections (sections, moduleType) {
            if (!Array.isArray(sections)) {
                return false;
            }

            for (const section of sections) {
                if (Array.isArray(section)) {
                    // Handle array of sections
                    if (this.isModuleInSections(section, moduleType)) {
                        return true;
                    }
                }
                else if (section && typeof section === "object") {
                    // Check if this section has the module type
                    if (section.type === moduleType) {
                        return true;
                    }
                    // Check if this is a folder with elements
                    if (section.type === "folder" && section.elements) {
                        if (this.isModuleInSections(section.elements, moduleType)) {
                            return true;
                        }
                    }
                    // Check if this section has elements
                    if (section.elements && this.isModuleInSections(section.elements, moduleType)) {
                        return true;
                    }
                }
            }
            return false;
        }
    }
};
</script>

<template>
    <FlatButton
        v-if="!addonIsOpen && isAddonAvailable"
        :class="buttonClass"
        :text="buttonText"
        @click="openAddon"
    />
</template>
