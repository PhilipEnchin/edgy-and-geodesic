/** @typedef {import('./Vector.js').default} Vector3 */
/** @typedef {[Vertex, Vertex, Vertex]} Triangle */

import { triangleCompare, vertexCompare } from './comparators.js';

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
   * @returns {Vertex} Deep copy of original
   */
  copy() {
    /** @type {Map<Vertex,Vertex>} */ const vMap = new Map();

    this.iterate((vertex) => { vMap.set(vertex, new Vertex(vertex.key, vertex.vector3.copy())); });

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
   * @param {Vertex} that
   * @returns {boolean}
   */
  isConnectedTo(that) {
    return this.#connections.has(that);
  }

  /**
   *
   * @param {(vertex: Vertex) => void} func
   */
  iterate(func) {
    /** @type {Vertex[]} */ const stack = [];
    /** @type {Set<Vertex>} */ const seen = new Set();

    stack.push(this);
    seen.add(this);

    while (stack.length) {
      const vertex = /** @type {Vertex} */ (stack.pop());
      func(vertex);
      vertex.#connections.forEach((connectedVertex) => {
        if (!seen.has(connectedVertex)) {
          stack.push(connectedVertex);
          seen.add(connectedVertex);
        }
      });
    }
  }

  /**
   * @returns {string}
   */
  get key() { return this.#key; }

  /**
   * @param {number} frequency
   * @returns {Vertex}
   */
  subdivide(frequency) {
    return this.copy();
  }

  /**
   * @returns {Triangle[]}
   */
  get triangles() {
    /** @type {Triangle[]} */ const triangles = [];

    this.iterate((vertex) => {
      const { connections } = vertex;
      for (let i = connections.length - 1; i >= 0; i--) {
        for (let j = i - 1; j >= 0; j--) {
          if (connections[i].isConnectedTo(connections[j])) {
            /** @type {Triangle} */ const newTriangle = [vertex, connections[i], connections[j]];
            newTriangle.sort(vertexCompare);
            triangles.push(newTriangle);
          }
        }
      }
    });

    return triangles.sort(triangleCompare).filter((_, i) => i % 3 === 0);
  }

  get vector3() { return this.#vector3; }
}

export default Vertex;
