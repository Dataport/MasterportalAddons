import {expect} from "chai";
import getters from "../../../store/gettersStrassenBefahrung";
import stateStrassenBefahrung from "../../../store/stateStrassenBefahrung";


const {
    active,
    id,
    name,
    icon,
    renderToWindow,
    resizableWindow,
    isVisibleInMenu,
    deactivateGFI} = getters;

describe("addons/StrassenBefahrung/store/gettersStrassenBefahrung", function () {
    it("returns the active from state", function () {
        expect(active(stateStrassenBefahrung)).to.be.false;
    });
    it("returns the id from state", function () {
        expect(id(stateStrassenBefahrung)).to.equals("StrassenBefahrung");
    });

    describe("testing default values", function () {
        it("returns the name default value from state", function () {
            expect(name(stateStrassenBefahrung)).to.be.equals("StraßenBefahrung");
        });
        it("returns the icon default value from state", function () {
            expect(icon(stateStrassenBefahrung)).to.equals("bi-play");
        });
        it("returns the renderToWindow default value from state", function () {
            expect(renderToWindow(stateStrassenBefahrung)).to.be.false;
        });
        it("returns the resizableWindow default value from state", function () {
            expect(resizableWindow(stateStrassenBefahrung)).to.be.true;
        });
        it("returns the isVisibleInMenu default value from state", function () {
            expect(isVisibleInMenu(stateStrassenBefahrung)).to.be.true;
        });
        it("returns the deactivateGFI default value from state", function () {
            expect(deactivateGFI(stateStrassenBefahrung)).to.be.true;
        });

    });
});
