/** @typedef {'icosahedron'|'octahedron'|'tetrahedron'} PolyhedronId */
/** @typedef {import('../models/Vertex.js').default} Vertex */

import makeIcosahedron from './icosahedron.js';
import makeOctahedron from './octahedron.js';
// import makeTetrahedron from './tetrahedron.js';

/**
 * @param {PolyhedronId} id
 * @returns {Vertex}
 */
const makePolyhedron = (id) => {
  switch (id) {
    case 'icosahedron': return makeIcosahedron();
    case 'octahedron': return makeOctahedron();
    // case 'tetrahedron': return makeTetrahedron();
    default: throw new Error(`Invalid polyhedron id, "${id}"`);
  }
};

export default makePolyhedron;
