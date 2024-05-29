/**
 * @file Functions that map polyhedron info to p5 sketch methods and args
 */

import Vector3 from '../../../lib/models/Vector.js';

/** @typedef {import('../../../lib/models/Vertex.js').default} Vertex */

/**
 * @typedef {object} Sketcher
 * @property {string} method
 * @property {(number|number[])[]} args
 */

/**
 * @param {Vertex} polyhedron
 * @param {number} radius
 * @returns {Sketcher[]}
 */
export const vertexMap = (polyhedron, radius) => polyhedron.map(({ vector3: v }) => [
  { method: 'push', args: [] },
  { method: 'translate', args: [v.x, v.y, v.z] },
  { method: 'sphere', args: [radius] },
  { method: 'pop', args: [] },
]).flat();

/**
 * @param {Vertex} polyhedron
 * @param {number} radius
 * @returns {Sketcher[]}
 */
export const edgeMap = (polyhedron, radius) => {
  const verticalVector = new Vector3(0, 1, 0);
  return polyhedron.edges.map(([{ vector3: a }, { vector3: b }]) => {
    const edgeVector = b.minus(a);
    const edgeLength = edgeVector.magnitude;
    const edgeCentre = a.plus(b).dividedBy(2);

    const rotationVector = verticalVector.cross(edgeVector);
    const rotationAngle = verticalVector.angleTo(edgeVector);

    return [
      { method: 'push', args: [] },
      { method: 'translate', args: [edgeCentre.x, edgeCentre.y, edgeCentre.z] },
      ...(rotationVector.magnitude ? [{ method: 'rotate', args: [rotationAngle, [rotationVector.x, rotationVector.y, rotationVector.z]] }] : []),
      { method: 'cylinder', args: [radius, edgeLength] },
      { method: 'pop', args: [] },
    ];
  }).flat();
};
