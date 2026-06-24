import {expect} from "chai";
import actions from "../../../store/actionsImporterAddon.js";

describe("addons/importer/store/actionsImporterAddon.js", () => {
    it("exports actions object", () => {
        expect(actions).to.be.an("object");
    });
});
