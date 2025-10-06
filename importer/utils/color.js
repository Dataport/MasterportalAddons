/**
 * Converts hex value to rgbarray.
 * @param {String} hex Color as hex string.
 * @returns {Number[]} - Color als rgb array.
 */
function hexToRgb (hex) {
    return hex
        .replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (m, r, g, b) => "#" + r + r + g + g + b + b)
        .substring(1)
        .match(/.{2}/g)
        .map(x => parseInt(x, 16));
}

/**
 * Converts rgb to hex.
 * @param {Number} r Red value.
 * @param {Number} g Green Value.
 * @param {Number} b Blue value.
 * @returns {String} - Hex color string.
 */
function rgbToHex (r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

/**
 * Converts number to hex string.
 * @param {Number} c Color value as number.
 * @returns {String} - Converted color number as hex string.
 */
function componentToHex (c) {
    const hex = Number(c).toString(16);

    return hex.length === 1 ? "0" + hex : hex;
}

export default {
    hexToRgb,
    rgbToHex
};
