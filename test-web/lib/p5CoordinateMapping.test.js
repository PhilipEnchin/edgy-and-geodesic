import { expect } from 'chai';
import Vector3 from '../../src/lib/models/Vector.js';
import Vertex from '../../src/lib/models/Vertex.js';
import { edgeMap, vertexMap } from '../../src/web/src/lib/p5CoordinateMapping.js';

describe('p5 Coordinate Mapping', () => {
  describe('vertexMap', () => {
    /** @type {Vertex} */ let polyhedron;

    beforeEach(() => {
      polyhedron = new Vertex('A', new Vector3(1, 2, 3)).connect(new Vertex('B', new Vector3(4, 5, 6)));
    });

    it('should return push, translate, sphere, pop for each vertex', () => {
      expect(vertexMap(polyhedron, 42)).to.deep.equal([
        { method: 'push', args: [] },
        { method: 'translate', args: [1, 2, 3] },
        { method: 'sphere', args: [42] },
        { method: 'pop', args: [] },

        { method: 'push', args: [] },
        { method: 'translate', args: [4, 5, 6] },
        { method: 'sphere', args: [42] },
        { method: 'pop', args: [] },
      ]);
    });
  });

  describe('edgeMap', () => {
    /** @type {Vertex} */ let polyhedron;

    beforeEach(() => {
      polyhedron = new Vertex('A', new Vector3(1, 2, 3))
        .connect(new Vertex('B', new Vector3(1, 4, 3)))
        .connect(new Vertex('C', new Vector3(1, 2, 5)));
    });

    it('should return push, translate, rotate (non-vertical only), cylinder, pop for each edge', () => {
      expect(edgeMap(polyhedron, 42)).to.deep.equal([
        { method: 'push', args: [] },
        { method: 'translate', args: [1, 3, 3] },
        // No rotate method for this vertical edge
        { method: 'cylinder', args: [42, 2] },
        { method: 'pop', args: [] },

        { method: 'push', args: [] },
        { method: 'translate', args: [1, 2, 4] },
        { method: 'rotate', args: [Math.PI / 2, [2, 0, 0]] },
        { method: 'cylinder', args: [42, 2] },
        { method: 'pop', args: [] },
      ]);
    });
  });
});
