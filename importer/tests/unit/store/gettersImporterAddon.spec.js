import {expect} from "chai";
import getters from "../../../store/gettersImporterAddon.js";

describe("addons/importer/store/gettersImporterAddon.js", () => {
    it("exports getters object", () => {
        expect(getters).to.be.an("object");
    });
});
