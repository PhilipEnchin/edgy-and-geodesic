/** @typedef {[Vertex, Vertex, Vertex]} Triangle */

/**
 * @typedef {object} TransformedVertex
 * @property {number} [x]
 * @property {number} [y]
 * @property {number} [z]
 * @property {string} [key]
 */

/** @typedef {(vertex:Vertex, index:number) => TransformedVertex} VertexTransformerFunction */

import Vector3 from './Vector.js';
import { triangleCompare, vectorCompare, vertexCompare } from './comparators.js';

class Vertex {
  /** @type {Vector3} */ #vector3;

  /** @type {Set<Vertex>} */ #connections;

  /** @type {string} */ #key;

  /**
   * @param {string} key
   * @param {Vector3} vector3
   */
  constructor(key, vector3) {
    this.#vector3 = vector3;
    this.#key = key;
    this.#connections = new Set();
  }

  /**
   * @param {Vertex} that
   * @returns {Vertex} this
   */
  connect(that) {
    this.#connections.add(that);
    that.#connections.add(this);
    return this;
  }

  /**
   * @returns {Vertex[]}
   */
  get connections() {
    return [...this.#connections];
  }

  /**
   * Returns a deep copy of the original, with optional transformed parameters
   * @param {VertexTransformerFunction} [transformer] Transformer function: Return any/all of x, y, z, key
   * @returns {Vertex} Deep copy of original
   */
  copy(transformer = () => ({})) {
    /** @type {Map<Vertex,Vertex>} */ const vMap = this.reduce((acc, vertex, index) => {
      const transformed = transformer(vertex, index);
      return acc.set(vertex, new Vertex(
        'key' in transformed && transformed.key !== undefined ? transformed.key : vertex.key,
        new Vector3(
          'x' in transformed && transformed.x !== undefined ? transformed.x : vertex.vector3.x,
          'y' in transformed && transformed.y !== undefined ? transformed.y : vertex.vector3.y,
          'z' in transformed && transformed.z !== undefined ? transformed.z : vertex.vector3.z,
        ),
      ));
    }, new Map());

    vMap.forEach((copy, original) => {
      original.connections.forEach((originalConnection) => {
        const copiedConnection = /** @type {Vertex} */ (vMap.get(originalConnection));
        copy.connect(copiedConnection);
      });
    });

    return /** @type {Vertex} */ (vMap.get(this));
  }

  /**
   * @param {Vertex} that
   * @returns {Vertex} this
   */
  disconnect(that) {
    this.#connections.delete(that);
    that.#connections.delete(this);
    return this;
  }

  /**
   * Run a function on each vertex in the connected structure
   * @param {(vertex: Vertex, index: number) => void} func
   */
  forEach(func) {
    /** @type {Vertex[]} */ const stack = [];
    /** @type {Set<Vertex>} */ const seen = new Set();

    stack.push(this);
    seen.add(this);

    let i = 0;
    while (stack.length) {
      const vertex = /** @type {Vertex} */ (stack.pop());
      func(vertex, i++);
      vertex.#connections.forEach((connectedVertex) => {
        if (!seen.has(connectedVertex)) {
          stack.push(connectedVertex);
          seen.add(connectedVertex);
        }
      });
    }
  }

  /**
   * @param {Vertex} that
   * @returns {boolean}
   */
  isConnectedTo(that) {
    return this.#connections.has(that);
  }

  /**
   * @returns {string}
   */
  get key() { return this.#key; }

  /**
   * Map vertices to an array, à la Array.prototype.map
   * @param {(vertex: Vertex, index: number) => void} func
   */
  map(func) {
    const result = [];
    this.forEach((...args) => { result.push(func(...args)); });
    return result;
  }

  /**
   * Reduce vertices to a value, à la Array.prototype.reduce
   * @param {(acc: any, vertex: Vertex, index: number) => void} func
   * @param {any} initialValue
   */
  reduce(func, initialValue) {
    let acc = initialValue;
    this.forEach((...args) => { acc = func(acc, ...args); });
    return acc;
  }

  /**
   * Project points outward from origin onto the surface of a sphere. Specify either the radius of
   * the sphere, or the minimum of maximum lengths of all edges.
   * @param {'radius'|'minLength'|'maxLength'} [mode=radius]
   * @param {number} [modeValue=1]
   * @returns {Vertex}
   */
  sphereify(mode = 'radius', modeValue = 1) {
    /** @type {number} */ let projectedRadius;
    switch (mode) {
      case 'radius': projectedRadius = modeValue; break;
      case 'minLength':
      case 'maxLength': {
        const spherified = this.sphereify();
        const edgeLengths = spherified.map(({ vector3: a, connections }) => connections.map(({ vector3: b }) => b.minus(a).magnitude)).flat();
        projectedRadius = modeValue / Math[mode === 'minLength' ? 'min' : 'max'](...edgeLengths);
        break;
      }
      default: throw new Error(`Unknown spherify mode, "${mode}"`);
    }

    return this.copy(({ key, vector3 }) => {
      const { x, y, z } = vector3.times(projectedRadius).dividedBy(vector3.magnitude);
      return {
        key, x, y, z,
      };
    });
  }

  /**
   * @param {number} frequency
   * @returns {Vertex}
   */
  subdivide(frequency) {
    const copy = this.copy();
    const { triangles } = copy;
    /** @type {Map<Vertex,Map<Vertex,(Vertex|undefined)[]>>} */ const edgeMap = new Map();

    /** @type {(from: Vertex, to: Vertex) => (Vertex|undefined)[]} */
    const getEdge = (from, to) => {
      if (!edgeMap.has(from)) edgeMap.set(from, new Map());
      const edgesFrom = /** @type {Map<Vertex,Vertex[]>} */ (edgeMap.get(from));
      if (!edgesFrom.has(to)) edgesFrom.set(to, [from, ...Array(frequency - 1), to]);
      const edge = /** @type {Vertex[]} */ (edgesFrom.get(to));

      if (!edgeMap.has(to)) edgeMap.set(to, new Map());
      const edgesFromReverse = /** @type {Map<Vertex,Vertex[]>} */ (edgeMap.get(to));
      edgesFromReverse.set(from, [...edge].reverse());
      return edge;
    };

    /** Return label for a vertex as follows:
     *    - On an edge? "edge [from-vertex]-[to-vertex] [index]" (zero-indexed from from-vertex)
     *    - Internal? "internal [left-vertex]-[from-vertex]-[right-vertex] [row],[col]"
     * @type {(A: Vertex, B: Vertex, C: Vertex) => (row: number, col: number) => Vertex}
     */
    const getVertexMaker = ({ vector3: A, key: keyA }, { vector3: B, key: keyB }, { vector3: C, key: keyC }) => (row, col) => new Vertex(
      col === 0 ? `edge ${keyA}-${keyB} ${row}`
        : col === row ? `edge ${keyA}-${keyC} ${row}`
          : row === frequency ? `edge ${keyB}-${keyC} ${col}`
            : `internal ${keyB}-${keyA}-${keyC} ${row},${col}`,
      A.plus(B.minus(A).times(row).dividedBy(frequency))
        .plus(C.minus(B).times(col).dividedBy(frequency)),
    );

    triangles.forEach(([A, B, C]) => {
      // Treat triangle ABC as though A is on the bottom, B is top left, C is top right
      const edgeAB = getEdge(A, B);
      const edgeAC = getEdge(A, C);
      const edgeBC = getEdge(B, C);
      A.disconnect(B.disconnect(C)).disconnect(C);
      const makeVertex = getVertexMaker(A, B, C);
      /** @type {Vertex[]} */ let previousRow = [];
      for (let r = 0; r <= frequency; r++) {
        /** @type {Vertex[]} */ const currentRow = [];
        /** @type {?Vertex} */ let previousVertex = null;
        for (let c = 0; c <= r; c++) {
          /** @type {Vertex} */ let currentVertex;
          if (c === 0) { // Left leg
            currentVertex = edgeAB[r] || (edgeAB[r] = makeVertex(r, c));
          } else if (c === r) { // Right leg
            currentVertex = edgeAC[r] || (edgeAC[r] = makeVertex(r, c));
          } else if (r === frequency) { // Top leg
            currentVertex = edgeBC[c] || (edgeBC[c] = makeVertex(r, c));
          } else {
            currentVertex = makeVertex(r, c);
          }

          if (r > 0) {
            if (c > 0) { currentVertex.connect(previousRow[c - 1]); }
            if (c < r) { currentVertex.connect(previousRow[c]); }
          }
          if (previousVertex) { currentVertex.connect(previousVertex); }
          currentRow.push(previousVertex = currentVertex);
        }
        previousRow = currentRow;
      }
    });
    return copy;
  }

  /**
   * Map vertices to an array
   * @returns {Vertex[]}
   */
  toArray() { return this.map((v) => v); }

  /**
   * Optional mode parameter to format output:
   *   - key: include key - eg. "edge a-b 3: (1,2,3)\n..."
   *   - keyless: omit key - eg. "(1,2,3)\n..."
   *   - desmos: format for desmos - eg. [(1,2,3),...]
   *   - single: "key" format, but only this vertex
   * @param {'key'|'keyless'|'desmos'|'single'} [mode='single']
   */
  toString(mode = 'single') {
    if (mode === 'single') return `${this.key}: ${this.vector3}`;
    const sorter = mode === 'key' ? vertexCompare : (a, b) => vectorCompare(a.vector3, b.vector3);

    const vertices = this.toArray().sort(sorter);
    switch (mode) {
      case 'key': return vertices.map(({ key, vector3 }) => `${key}: ${vector3}`).join('\n');
      case 'keyless': return vertices.map(({ vector3 }) => `${vector3}`).join('\n');
      case 'desmos': return `[${vertices.map(({ vector3 }) => `${vector3}`.replace(/\s/g, '')).join(',')}]`;
      default: throw new Error(`Unknown toString mode, "${mode}"`);
    }
  }

  /**
   * @returns {Triangle[]}
   */
  get triangles() {
    /** @type {Triangle[][]} */ const triangles = this.map((vertex) => {
      /** @type {Triangle[]} */ const trianglesFromHere = [];
      const { connections } = vertex;
      connections.forEach((outerConnection, i) => {
        for (let j = 0; j < i; j++) {
          const innerConnection = connections[j];
          if (outerConnection.isConnectedTo(innerConnection)) {
            /** @type {Triangle} */ const newTriangle = [vertex, outerConnection, innerConnection];
            newTriangle.sort(vertexCompare);
            trianglesFromHere.push(newTriangle);
          }
        }
      });
      return trianglesFromHere;
    });

    return triangles.flat().sort(triangleCompare).filter((_, i) => i % 3 === 0);
  }

  get vector3() { return this.#vector3; }
}

export default Vertex;
