/** @typedef {import('../models/Vector.js').default} Vector3 */
/** @typedef {import('../models/Vertex.js').default} Vertex */

import { vertexCompare } from './comparators.js';
import { EDGE_SEPARATOR } from './constants.js';
import { round } from './numberFormatters.js';

/**
 * @typedef {object} DecoratedEdge
 * @property {[Vector3, Vector3]} vectors
 * @property {number} edgeLength
 * @property {string} label
 */

/**
 * @typedef {object} GroupedEdges
 * @property {number} edgeLength
 * @property {DecoratedEdge[]} edges
 */

/**
 * @param {Vertex} vertex
 * @param {number} roundingPlace
 * @returns {DecoratedEdge[]}
 */
export const decorateEdges = (vertex, roundingPlace) => {
  /** @type {DecoratedEdge[]} */ const edges = vertex.edges.map(([a, b]) => {
    const orderedVertices = vertexCompare(a, b) < 0 ? [a, b] : [b, a];
    return {
      vectors: [orderedVertices[0].vector3, orderedVertices[1].vector3],
      edgeLength: round(a.vector3.distanceTo(b.vector3), roundingPlace),
      label: orderedVertices.map((v) => v.key).join(EDGE_SEPARATOR),
    };
  });
  edges.sort((a, b) => (a.label < b.label ? -1 : 1));
  return /** @type {DecoratedEdge[]} (Ugly cast) */ (edges);
};

/**
 * @param {DecoratedEdge[]} decoratedEdges
 * @returns {GroupedEdges[]}
 */
export const groupDecoratedEdgesByLength = (decoratedEdges) => {
  if (decoratedEdges.length === 0) { return []; }

  const sortedEdges = [...decoratedEdges].sort(({ edgeLength: a }, { edgeLength: b }) => a - b);

  /** @type {GroupedEdges} */ let currentGroup = { edgeLength: sortedEdges[0]?.edgeLength, edges: [] };
  /** @type {GroupedEdges[]} */ const groups = [currentGroup];
  sortedEdges.forEach((decoratedEdge) => {
    if (decoratedEdge.edgeLength === currentGroup.edgeLength) currentGroup.edges.push(decoratedEdge);
    else {
      groups.push(currentGroup = { edgeLength: decoratedEdge.edgeLength, edges: [decoratedEdge] });
    }
  });
  return groups;
};
