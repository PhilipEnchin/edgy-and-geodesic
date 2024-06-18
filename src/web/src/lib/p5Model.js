import Vector3 from '../../../lib/models/Vector.js';
import { round } from '../../../lib/util/numberFormatters.js';
import { RENDER } from '../constants.js';

/** @typedef {import('p5')} p5 */
/** @typedef {import('../../../lib/models/Vertex.js').default} Vertex */

/** @typedef {'single'|'spectrum'|'highlight'} ColorOptionId */

const {
  SPECTRUM_EDGE_LENGTH_ROUNDING_PLACE,
  SPECTRUM_LIGHTNESS,
  SPECTRUM_SATURATION,
  VERTEX_SPHERE_DETAIL,
} = RENDER;

/**
 * @typedef {object} SingleColorOptions
 * @property {string} edgeColor
 * @property {string} vertexColor
 */

/**
 * @typedef {object} SpectrumColorOptions
 * @property {number} minLengthHue
 * @property {number} maxLengthHue
 * @property {string} vertexColor
 */

/**
 * @param {*} sketch
 * @param {Vertex} polyhedron
 * @param {number} edgeRadius
 * @param {number} vertexRadius
 * @param {SingleColorOptions|SpectrumColorOptions} colorOptions
 * @returns {import('p5').Geometry}
 */
const makeModel = (sketch, polyhedron, edgeRadius, vertexRadius, colorOptions) => {
  /**
   * @param {'edge'|'vertex'} elementType
   * @param {number} [edgeLength]
  */
  const setColor = (() => {
    if ('edgeColor' in colorOptions) {
      const { vertexColor, edgeColor } = colorOptions;
      return (elementType) => {
        if (elementType === 'edge') {
          sketch.fill(edgeColor);
        } else if (elementType === 'vertex') {
          sketch.noStroke();
          sketch.fill(vertexColor);
        }
      };
    } if ('minLengthHue' in colorOptions) {
      const { minLengthHue, maxLengthHue, vertexColor } = colorOptions;
      const hueDiff = maxLengthHue - minLengthHue;
      const edgeToHue = new Map(
        [...new Set(polyhedron.edges.map(([{ vector3: a }, { vector3: b }]) => round(a.distanceTo(b), SPECTRUM_EDGE_LENGTH_ROUNDING_PLACE)))]
          .toSorted((a, b) => a - b)
          .map((edgeLength, index, { length }) => [edgeLength, (index / ((length - 1) || 1)) * hueDiff + minLengthHue]),
      );
      return (elementType, edgeLength) => {
        if (elementType === 'edge') {
          sketch.colorMode(sketch.HSL);
          sketch.fill(edgeToHue.get(round(edgeLength, SPECTRUM_EDGE_LENGTH_ROUNDING_PLACE)), SPECTRUM_SATURATION, SPECTRUM_LIGHTNESS);
        } else if (elementType === 'vertex') {
          sketch.noStroke();
          sketch.fill(vertexColor);
        }
      };
    }
    throw new Error('Unsupported color options object');
  })();

  sketch.beginGeometry();

  polyhedron.forEach(({ vector3: v }) => {
    sketch.push();
    setColor('vertex');
    sketch.translate(v.x, v.y, v.z);
    sketch.sphere(vertexRadius, VERTEX_SPHERE_DETAIL, VERTEX_SPHERE_DETAIL);
    sketch.pop();
  });

  const verticalVector = new Vector3(0, 1, 0);
  polyhedron.edges.forEach(([{ vector3: a }, { vector3: b }]) => {
    setColor('edge', a.distanceTo(b));
    const edgeVector = b.minus(a);
    const edgeLength = edgeVector.magnitude;
    const edgeCenter = a.plus(b).dividedBy(2);
    const rotationVector = verticalVector.cross(edgeVector);

    sketch.push();
    sketch.translate(edgeCenter.x, edgeCenter.y, edgeCenter.z);
    if (rotationVector.magnitude) {
      sketch.rotate(verticalVector.angleTo(edgeVector), [rotationVector.x, rotationVector.y, rotationVector.z]);
    }
    sketch.box(edgeRadius, edgeLength, edgeRadius);
    sketch.pop();
  });

  return sketch.endGeometry();
};

export default makeModel;
