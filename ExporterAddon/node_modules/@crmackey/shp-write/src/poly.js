import ext from './extent'
import types from './types';

export function write(
    geometries,
    extent,
    shpView,
    shxView,
    TYPE,
) {
    var shpI = 0,
        shxI = 0,
        shxOffset = 100,
        is3D =
            TYPE === types.geometries.POLYLINEZ ||
            TYPE === types.geometries.POLYGONZ;

    // call for every polygon/polyline feature
    geometries.forEach(writePoly);

    // write a single Polygon Record
    function writePoly(coordinates, i) {
        var flattened = justCoords(coordinates),
            noParts =
                TYPE === types.geometries.POLYLINE ||
                TYPE === types.geometries.POLYLINEZ
                    ? parts([coordinates], TYPE)
                    : parts(coordinates, TYPE), // Number of parts in this poly record
            contentLength = flattened.length * 16 + 48 + (noParts - 1) * 4;

        if (is3D) {
            contentLength += 32 + flattened.length * 16;
        }

        var featureExtent = flattened.reduce(function (extent, c) {
            return ext.enlarge(extent, c);
        }, ext.blank());

        // INDEX
        shxView.setInt32(shxI, shxOffset / 2); // offset
        shxView.setInt32(shxI + 4, contentLength / 2); // offset length

        shxI += 8;
        shxOffset += contentLength + 8;

        shpView.setInt32(shpI, i + 1); // record number
        shpView.setInt32(shpI + 4, contentLength / 2); // length
        shpView.setInt32(shpI + 8, TYPE, true); // POLYLINE=3, POLYGON=5, POLYLINEZ=13, POLYGONZ=15
        shpView.setFloat64(shpI + 12, featureExtent.xmin, true); // EXTENT
        shpView.setFloat64(shpI + 20, featureExtent.ymin, true);
        shpView.setFloat64(shpI + 28, featureExtent.xmax, true);
        shpView.setFloat64(shpI + 36, featureExtent.ymax, true);
        shpView.setInt32(shpI + 44, noParts, true);
        shpView.setInt32(shpI + 48, flattened.length, true); // POINTS
        shpView.setInt32(shpI + 52, 0, true); // The first part - index zero

        var onlyParts = coordinates.reduce(function (arr, coords) {
            if (Array.isArray(coords[0][0])) {
                arr = arr.concat(coords);
            } else {
                arr.push(coords);
            }
            return arr;
        }, []);

        for (var p = 1; p < noParts; p++) {
            var result = onlyParts.reduce(function (a, b, idx) {
                return idx < p ? a + b.length : a;
            }, 0);

            shpView.setInt32(
                // set part index
                shpI + 52 + p * 4,
                result,
                true,
            );
        }

        shpI += 56 + (noParts - 1) * 4;

        flattened.forEach(function writeLine(coords, i) {
            shpView.setFloat64(shpI, coords[0], true); // X
            shpView.setFloat64(shpI + 8, coords[1], true); // Y

            shpI += 16;
        });

        if (is3D) {
            // Write z value range
            shpView.setFloat64(shpI, featureExtent.zmin, true);
            shpView.setFloat64(shpI + 8, featureExtent.zmax, true);
            shpI += 16;

            // Write z values.
            flattened.forEach(function (p, i) {
                shpView.setFloat64(shpI, p[2] || 0, true);
                shpI += 8;
            });

            // Write m value range.
            shpView.setFloat64(shpI, featureExtent.mmin, true);
            shpView.setFloat64(shpI + 8, featureExtent.mmax, true);
            shpI += 16;

            // Write m values;
            flattened.forEach(function (p, i) {
                shpView.setFloat64(shpI, p[3] || 0, true);
                shpI += 8;
            });
        }
    }
};

export function shpLength(geometries, TYPE) {
    var no = 0;

    var is3D =
        TYPE === types.geometries.POLYLINEZ ||
        TYPE === types.geometries.POLYGONZ;

    // loop through every feature
    geometries.forEach(function (feature, i) {
        // this is looking at each record
        var noParts = feature.length;
        var flattened = justCoords(feature);
        var length = 44 + 4 * noParts + 16 * flattened.length + 8; // 2D length

        if (is3D) {
            length += 16 + 8 * flattened.length + (16 + 8 * flattened.length);
        }

        no += length;
    });

    return no;
};

export function shxLength (geometries) {
    return geometries.length * 8;
};

export function extent(coordinates) {
    return justCoords(coordinates).reduce(function (extent, c) {
        return ext.enlarge(extent, c);
    }, ext.blank());
};

export function parts(geometries, TYPE) {
    return geometries.length;
}


function totalPoints(geometries) {
    var sum = 0;
    geometries.forEach(function (g) {
        sum += g.length;
    });
    return sum;
}

function justCoords(coords, l) {
    if (l === undefined) l = [];
    if (typeof coords[0][0] == 'object') {
        return coords.reduce(function (memo, c) {
            Array.prototype.push.apply(memo, justCoords(c));
            return memo;
        }, l);
    } else {
        return coords;
    }
}


export default {
    write,
    parts,
    extent,
    shxLength,
    shpLength,
    justCoords
}