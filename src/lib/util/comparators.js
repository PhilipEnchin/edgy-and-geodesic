/** @typedef {import('../models/Vector.js').default} Vector3 */
/** @typedef {import('../models/Vertex.js').default} Vertex */
/** @typedef {import('../models/Vertex.js').Triangle} Triangle */

/**
 * Compare vectors by ordered triple, left to right
 * @param {Vector3} a
 * @param {Vector3} b
 * @returns {number}
 */
export const vectorCompare = (a, b) => {
  if (a.x !== b.x) { return a.x - b.x; }
  if (a.y !== b.y) { return a.y - b.y; }
  return a.z - b.z;
};

/**
 * Compare vertices by key, then ordered triple, left to right
 * @param {Vertex} a
 * @param {Vertex} b
 * @returns {number}
 */
export const vertexCompare = ({ key: aKey, vector3: a }, { key: bKey, vector3: b }) => {
  if (aKey < bKey) return -1;
  if (aKey > bKey) return 1;
  return vectorCompare(a, b);
};

/**
 * Compare triangles by vertices, left to right
 * @param {Triangle} a
 * @param {Triangle} b
 * @returns {number}
 */
export const triangleCompare = (a, b) => {
  let compare = vertexCompare(a[0], b[0]);
  if (compare) return compare;
  compare = vertexCompare(a[1], b[1]);
  if (compare) return compare;
  return vertexCompare(a[2], b[2]);
};
