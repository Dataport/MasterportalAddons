import {expect} from "chai";
import actions from "../../../store/actionsExporterAddon.js";

describe("addons/exporter/store/actionsExporterAddon.js", () => {
    it("exports actions object", () => {
        expect(actions).to.be.an("object");
    });
});
