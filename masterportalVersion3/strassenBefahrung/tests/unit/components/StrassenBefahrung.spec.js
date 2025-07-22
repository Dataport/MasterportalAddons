import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import StrassenBefahrungComponent from "../../../components/StrassenBefahrung.vue";
import StrassenBefahrung from "../../../store/index";
import {expect} from "chai";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("addons/StrassenBefahrung/components/StrassenBefahrung.vue", () => {
    const mockConfigJson = {
        Portalconfig: {
            menu: {
                tools: {
                    children: {
                        StrassenBefahrung:
                            {
                                "name": "translate#additional:modules.tools.StrassenBefahrung.title",
                                "glyphicon": "glyphicon-th-list"
                            }
                    }
                }
            }
        }
    };
    let store;

    beforeEach(() => {
        store = new Vuex.Store({
            namespaces: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        StrassenBefahrung
                    }
                }
            },
            state: {
                configJson: mockConfigJson
            }
        });
        store.commit("Tools/StrassenBefahrung/setActive", true);
    });

    it("renders the StrassenBefahrung", () => {
        const wrapper = shallowMount(StrassenBefahrungComponent, {store, localVue});

        expect(wrapper.find("#strassenbefahrung").exists()).to.be.true;
    });

    it("do not render the StrassenBefahrung if not active", () => {
        let wrapper = null;

        store.commit("Tools/StrassenBefahrung/setActive", false);
        wrapper = shallowMount(StrassenBefahrungComponent, {store, localVue});

        expect(wrapper.find("#strassenbefahrung").exists()).to.be.false;
    });

});
