/**
 * Converts a number of bytes to kilobytes and return a string with added unit.
 *
 * @param {number} size The number of bytes to convert.
 * @returns {string} The size in kilobytes.
 */
export function convertBytesToKB (size) {
    return Math.ceil(size / 1024) + " KB";
}
