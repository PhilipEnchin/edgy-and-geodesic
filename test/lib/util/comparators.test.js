import { expect } from 'chai';
import Vector3 from '../../../src/lib/models/Vector.js';
import Vertex from '../../../src/lib/models/Vertex.js';
import { vectorCompare, vertexCompare, triangleCompare } from '../../../src/lib/util/comparators.js';

/** @typedef {import('../../../src/lib/models/Vertex.js').Triangle} Triangle */

describe('Compatators', () => {
  describe('vectorCompare', () => {
    it('should return 0 when comparing the vector3 object against itself', () => {
      const vector = new Vector3(1, 2, 3);

      expect(vectorCompare(vector, vector)).to.equal(0);
    });

    it('should return 0 when comparing against an equivalent vector', () => {
      const a = new Vector3(1, 2, 3);
      const b = new Vector3(1, 2, 3);

      expect(vectorCompare(a, b)).to.equal(0);
    });

    it('should return negative when comparing two vectors with x coordinates ascending', () => {
      const a = new Vector3(1, 2, 3);
      const b = new Vector3(2, 2, 3);

      expect(vectorCompare(a, b)).to.be.lessThan(0);
    });

    it('should return negative when comparing two vectors with y coordinates ascending', () => {
      const a = new Vector3(1, 2, 3);
      const b = new Vector3(1, 3, 3);

      expect(vectorCompare(a, b)).to.be.lessThan(0);
    });

    it('should return negative when comparing two vectors with z coordinates ascending', () => {
      const a = new Vector3(1, 2, 3);
      const b = new Vector3(1, 2, 4);

      expect(vectorCompare(a, b)).to.be.lessThan(0);
    });

    it('should return positive when comparing two vectors with x coordinates descending', () => {
      const a = new Vector3(1, 2, 3);
      const b = new Vector3(0, 2, 3);

      expect(vectorCompare(a, b)).to.be.greaterThan(0);
    });

    it('should return positive when comparing two vectors with y coordinates descending', () => {
      const a = new Vector3(1, 2, 3);
      const b = new Vector3(1, 0, 3);

      expect(vectorCompare(a, b)).to.be.greaterThan(0);
    });

    it('should return positive when comparing two vectors with z coordinates descending', () => {
      const a = new Vector3(1, 2, 3);
      const b = new Vector3(1, 2, 0);

      expect(vectorCompare(a, b)).to.be.greaterThan(0);
    });
  });

  describe('vertexCompare', () => {
    it('should return 0 when comparing the vertex object against itself', () => {
      const vertex = new Vertex('key', new Vector3(1, 2, 3));

      expect(vertexCompare(vertex, vertex)).to.equal(0);
    });

    it('should return 0 when comparing two vertices with the same key, vector3 object', () => {
      const vector = new Vector3(1, 2, 3);
      const a = new Vertex('key', vector);
      const b = new Vertex('key', vector);

      expect(vertexCompare(a, b)).to.equal(0);
    });

    it('should return 0 when comparing two vertices with the same key, vector3 coordinates', () => {
      const a = new Vertex('key', new Vector3(1, 2, 3));
      const b = new Vertex('key', new Vector3(1, 2, 3));

      expect(vertexCompare(a, b)).to.equal(0);
    });

    it('should return negative when comparing two vertices with same key, vector3 x coordinates ascending', () => {
      const a = new Vertex('key', new Vector3(1, 2, 3));
      const b = new Vertex('key', new Vector3(2, 2, 3));

      expect(vertexCompare(a, b)).to.be.lessThan(0);
    });

    it('should return negative when comparing two vertices with same key, vector3 y coordinates ascending', () => {
      const a = new Vertex('key', new Vector3(1, 2, 3));
      const b = new Vertex('key', new Vector3(1, 3, 3));

      expect(vertexCompare(a, b)).to.be.lessThan(0);
    });

    it('should return negative when comparing two vertices with same key, vector3 z coordinates ascending', () => {
      const a = new Vertex('key', new Vector3(1, 2, 3));
      const b = new Vertex('key', new Vector3(1, 2, 4));

      expect(vertexCompare(a, b)).to.be.lessThan(0);
    });

    it('should return negative when comparing two vertices with keys ascending, vector3 coordinates equal', () => {
      const a = new Vertex('first', new Vector3(1, 2, 3));
      const b = new Vertex('second', new Vector3(1, 2, 3));

      expect(vertexCompare(a, b)).to.be.lessThan(0);
    });

    it('should return negative when comparing two vertices with keys ascending, vector3 coordinates ascending', () => {
      const a = new Vertex('first', new Vector3(1, 2, 3));
      const b = new Vertex('second', new Vector3(2, 2, 3));

      expect(vertexCompare(a, b)).to.be.lessThan(0);
    });

    it('should return negative when comparing two vertices with keys ascending, vector3 coordinates descending', () => {
      const a = new Vertex('first', new Vector3(1, 2, 3));
      const b = new Vertex('second', new Vector3(0, 2, 3));

      expect(vertexCompare(a, b)).to.be.lessThan(0);
    });

    it('should return positive when comparing two vertices with same key, vector3 x coordinates descending', () => {
      const a = new Vertex('key', new Vector3(1, 2, 3));
      const b = new Vertex('key', new Vector3(0, 2, 3));

      expect(vertexCompare(a, b)).to.be.greaterThan(0);
    });

    it('should return positive when comparing two vertices with same key, vector3 y coordinates descending', () => {
      const a = new Vertex('key', new Vector3(1, 2, 3));
      const b = new Vertex('key', new Vector3(1, 1, 3));

      expect(vertexCompare(a, b)).to.be.greaterThan(0);
    });

    it('should return positive when comparing two vertices with same key, vector3 z coordinates descending', () => {
      const a = new Vertex('key', new Vector3(1, 2, 3));
      const b = new Vertex('key', new Vector3(1, 2, 2));

      expect(vertexCompare(a, b)).to.be.greaterThan(0);
    });

    it('should return positive when comparing two vertices with keys descending, vector3 coordinates equal', () => {
      const a = new Vertex('second', new Vector3(1, 2, 3));
      const b = new Vertex('first', new Vector3(1, 2, 3));

      expect(vertexCompare(a, b)).to.be.greaterThan(0);
    });

    it('should return positive when comparing two vertices with keys descending, vector3 coordinates ascending', () => {
      const a = new Vertex('second', new Vector3(1, 2, 3));
      const b = new Vertex('first', new Vector3(2, 2, 3));

      expect(vertexCompare(a, b)).to.be.greaterThan(0);
    });

    it('should return positive when comparing two vertices with keys descending, vector3 coordinates descending', () => {
      const a = new Vertex('second', new Vector3(1, 2, 3));
      const b = new Vertex('first', new Vector3(0, 2, 3));

      expect(vertexCompare(a, b)).to.be.greaterThan(0);
    });
  });

  describe('triangleCompare', () => {
    it('should return 0 when comparing the same triangle array', () => {
      const a = new Vertex('a', new Vector3(1, 2, 3));
      const b = new Vertex('b', new Vector3(4, 5, 6));
      const c = new Vertex('c', new Vector3(7, 8, 9));

      /** @type {Triangle} */ const triangle = [a, b, c];

      expect(triangleCompare(triangle, triangle)).to.equal(0);
    });

    it('should return 0 when comparing different triangle arrays with same vertex objects', () => {
      const a = new Vertex('a', new Vector3(1, 2, 3));
      const b = new Vertex('b', new Vector3(4, 5, 6));
      const c = new Vertex('c', new Vector3(7, 8, 9));

      expect(triangleCompare([a, b, c], [a, b, c])).to.equal(0);
    });

    it('should return 0 when comparing different triangle arrays with different vertex objects with same values', () => {
      const a = new Vertex('a', new Vector3(1, 2, 3));
      const b = new Vertex('b', new Vector3(4, 5, 6));
      const c = new Vertex('c', new Vector3(7, 8, 9));
      const d = new Vertex('a', new Vector3(1, 2, 3));
      const e = new Vertex('b', new Vector3(4, 5, 6));
      const f = new Vertex('c', new Vector3(7, 8, 9));

      expect(triangleCompare([a, b, c], [d, e, f])).to.equal(0);
    });

    it('should return negative when comparing triangle arrays with third vertices ascending', () => {
      const a = new Vertex('a', new Vector3(1, 2, 3));
      const b = new Vertex('b', new Vector3(4, 5, 6));
      const c = new Vertex('c', new Vector3(7, 8, 9));
      const d = new Vertex('a', new Vector3(1, 2, 3));
      const e = new Vertex('b', new Vector3(4, 5, 6));
      const f = new Vertex('z', new Vector3(7, 8, 9));

      expect(triangleCompare([a, b, c], [d, e, f])).to.be.lessThan(0);
    });

    it('should return negative when comparing triangle arrays with second vertices ascending', () => {
      const a = new Vertex('a', new Vector3(1, 2, 3));
      const b = new Vertex('b', new Vector3(4, 5, 6));
      const c = new Vertex('c', new Vector3(7, 8, 9));
      const d = new Vertex('a', new Vector3(1, 2, 3));
      const e = new Vertex('z', new Vector3(4, 5, 6));
      const f = new Vertex('c', new Vector3(7, 8, 9));

      expect(triangleCompare([a, b, c], [d, e, f])).to.be.lessThan(0);
    });

    it('should return negative when comparing triangle arrays with first vertices ascending', () => {
      const a = new Vertex('a', new Vector3(1, 2, 3));
      const b = new Vertex('b', new Vector3(4, 5, 6));
      const c = new Vertex('c', new Vector3(7, 8, 9));
      const d = new Vertex('z', new Vector3(1, 2, 3));
      const e = new Vertex('b', new Vector3(4, 5, 6));
      const f = new Vertex('c', new Vector3(7, 8, 9));

      expect(triangleCompare([a, b, c], [d, e, f])).to.be.lessThan(0);
    });

    it('should return positive when comparing triangle arrays with third vertices descending', () => {
      const a = new Vertex('a', new Vector3(1, 2, 3));
      const b = new Vertex('b', new Vector3(4, 5, 6));
      const c = new Vertex('z', new Vector3(7, 8, 9));
      const d = new Vertex('a', new Vector3(1, 2, 3));
      const e = new Vertex('b', new Vector3(4, 5, 6));
      const f = new Vertex('c', new Vector3(7, 8, 9));

      expect(triangleCompare([a, b, c], [d, e, f])).to.be.greaterThan(0);
    });

    it('should return positive when comparing triangle arrays with second vertices descending', () => {
      const a = new Vertex('a', new Vector3(1, 2, 3));
      const b = new Vertex('z', new Vector3(4, 5, 6));
      const c = new Vertex('c', new Vector3(7, 8, 9));
      const d = new Vertex('a', new Vector3(1, 2, 3));
      const e = new Vertex('b', new Vector3(4, 5, 6));
      const f = new Vertex('c', new Vector3(7, 8, 9));

      expect(triangleCompare([a, b, c], [d, e, f])).to.be.greaterThan(0);
    });

    it('should return positive when comparing triangle arrays with first vertices descending', () => {
      const a = new Vertex('z', new Vector3(1, 2, 3));
      const b = new Vertex('b', new Vector3(4, 5, 6));
      const c = new Vertex('c', new Vector3(7, 8, 9));
      const d = new Vertex('a', new Vector3(1, 2, 3));
      const e = new Vertex('b', new Vector3(4, 5, 6));
      const f = new Vertex('c', new Vector3(7, 8, 9));

      expect(triangleCompare([a, b, c], [d, e, f])).to.be.greaterThan(0);
    });
  });
});
