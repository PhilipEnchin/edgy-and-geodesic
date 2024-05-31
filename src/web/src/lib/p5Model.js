/** @typedef {import('../../../lib/models/Vertex.js').default} Vertex */

import Vector3 from '../../../lib/models/Vector.js';

/**
 *
 * @param {*} sketch
 * @param {Vertex} polyhedron
 * @param {number} radius
 * @returns {import('p5').Geometry}
 */
const makeModel = (sketch, polyhedron, radius) => {
  sketch.beginGeometry();

  polyhedron.forEach(({ vector3: v }) => {
    sketch.push();
    sketch.translate(v.x, v.y, v.z);
    sketch.sphere(radius);
    sketch.pop();
  });

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
    sketch.cylinder(radius, edgeLength);
    sketch.pop();
  });
  return sketch.endGeometry();
};

export default makeModel;
