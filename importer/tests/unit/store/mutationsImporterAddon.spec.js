import {expect} from "chai";
import mutations from "../../../store/mutationsImporterAddon.js";

describe("addons/importer/store/mutationsImporterAddon.js", () => {
    it("exports mutations object", () => {
        expect(mutations).to.be.an("object");
    });
});
