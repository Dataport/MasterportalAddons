import {expect} from "chai";
import mutations from "../../../store/mutationsExporterAddon.js";

describe("addons/exporter/store/mutationsExporterAddon.js", () => {
    it("exports mutations object", () => {
        expect(mutations).to.be.an("object");
    });
});
