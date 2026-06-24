import {expect} from "chai";
import getters from "../../../store/gettersExporterAddon.js";

describe("addons/exporter/store/gettersExporterAddon.js", () => {
    it("exports getters object", () => {
        expect(getters).to.be.an("object");
    });
});
