import Vector3 from '../../../lib/models/Vector.js';
import { RENDER } from '../constants.js';

/** @typedef {import('p5')} p5 */
/** @typedef {import('../../../lib/models/Vertex.js').default} Vertex */

const { VERTEX_SPHERE_DETAIL } = RENDER;

/**
 * @param {*} sketch
 * @param {Vertex} polyhedron
 * @param {number} edgeRadius
 * @param {number} vertexRadius
 * @param {string} edgeColor
 * @param {string} vertexColor
 * @returns {import('p5').Geometry}
 */
const makeModel = (sketch, polyhedron, edgeRadius, vertexRadius, edgeColor, vertexColor) => {
  sketch.beginGeometry();

  sketch.push();
  sketch.noStroke();
  sketch.fill(vertexColor);
  polyhedron.forEach(({ vector3: v }) => {
    sketch.push();
    sketch.translate(v.x, v.y, v.z);
    sketch.sphere(vertexRadius, VERTEX_SPHERE_DETAIL, VERTEX_SPHERE_DETAIL);
    sketch.pop();
  });
  sketch.pop();

  sketch.fill(edgeColor);
  const verticalVector = new Vector3(0, 1, 0);
  polyhedron.edges.forEach(([{ vector3: a }, { vector3: b }]) => {
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
