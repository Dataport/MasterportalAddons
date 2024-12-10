import {createApp} from "vue";
import Vuex from "vuex";
import {shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import WiengfiTheme from "../../../components/WiengfiTheme.vue";
import WienGfi from "../../../store/indexWienGfi";
import defaults from "../../../defaults.json";
const localVue = createApp();


localVue.use(Vuex);
let store;

describe("ADDONS: addons/gfiThemes/wiengfi/components/WiengfiTheme.vue", () => {

    const mappedProps = {
            "name": "Luftaufnahmen 2018",
            "OBJECTID": "35513",
            "BNR5000": "37/1",
            "Shape": "Polygon",
            "SHAPE.AREA": "0",
            "SHAPE.LEN": "0",
            "BNR": "37/1",
            "INFO": "Orthofoto 2016 - 15 Zentimeter Auflösung",
            "PRODUKT": "Orthofoto",
            "DL_FORMAT": "JPG",
            "DL_SPACE": "33785725",
            "DL_PATH": "/ma41/geodaten/op_img/",
            "DL_FILE": "37_1_op_2016.zip",
            "WEBLINK1": "www.wien.gv.at/stadtentwicklung/stadtvermessung/geodaten/orthofoto/"
        },

        item = {
            getMappedProperties: () => mappedProps,
            getProperties: () => mappedProps,
            getTheme: () => defaults
        };

    let wrapper;

    beforeEach(() => {
        store = Vuex.createStore({
            namespaced: true,
            modules: {
                Language: {
                    namespaced: true,
                    getters: {
                        currentLocale: () => "de"
                    }
                },
                Modules: {
                    namespaced: true,
                    modules: {
                        WiengfiTheme: WienGfi,
                        GetFeatureInfo: {
                            namespaced: true,
                            getters: {
                                gfiFeaturesReverse: () => [item]
                            },
                            mutations: {
                                setFeature: () => item
                            }
                        }
                    }
                },
                Tools: {
                    namespaced: true,
                    Gfi: {
                        namespaced: true,
                        getters: {
                            getGfiTheme: () => "wiengfi"
                        }
                    }
                }
            }
        });
        wrapper = shallowMount(WiengfiTheme, {
            global: {
                plugins: [store],
                mocks: {
                    $t: key => key
                }
            },
            props: {
                feature: item
            }
        });
    });

    it("should exist", () => {
        expect(wrapper.find("div").exists()).to.be.true;
    });

    it("should show table", async () => {
        expect(wrapper.findAll("table").at(0).exists()).to.be.true;
        expect(wrapper.findAll("tr").length).to.equal(6);
        expect(wrapper.findAll("th").length).to.equal(6);
        expect(wrapper.findAll("td").length).to.equal(6);
    });

    it("should contain download button", async () => {
        expect(wrapper.find("button").exists()).to.be.true;
        expect(wrapper.find("button").text()).to.equal(mappedProps[defaults.download.buttonTextAttribute]);
    });

});
