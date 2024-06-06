import { expect } from 'chai';
import makePolyhedron from '../../../src/lib/polyhedra/index.js';

/** @typedef {import('../../../src/lib/models/Vertex.js').default} Vertex */
/** @typedef {import('../../../src/lib/polyhedra/index.js').PolyhedronId} PolyhedronId */

/**
 * @typedef {object} PolyhedronTest
 * @property {PolyhedronId} polyhedronId
 * @property {number} vertexCount
 * @property {number} edgeCount
 * @property {number} faceCount
 * @property {number} connectionsPerVertex
 */

/** @type {PolyhedronTest[]} */ const tests = [
  {
    polyhedronId: 'icosahedron',
    vertexCount: 12,
    edgeCount: 30,
    faceCount: 20,
    connectionsPerVertex: 5,
  },
];

describe('makePolyhedron', () => {
  tests.forEach(({
    polyhedronId, vertexCount, edgeCount, faceCount, connectionsPerVertex,
  }) => {
    describe(polyhedronId, () => {
      /** @type {Vertex} */ let polyhedron;

      beforeEach(() => {
        polyhedron = makePolyhedron(polyhedronId);
      });

      it(`should create a connected structure with ${vertexCount} vertices`, () => {
        expect(polyhedron.toArray()).to.have.lengthOf(vertexCount);
      });

      it(`should create a structure with ${edgeCount} edges`, () => {
        expect(polyhedron.edges).to.have.lengthOf(edgeCount);
      });

      it('should create consecutive (and therefore, unique), uppercase alphabetical keys for vertices', () => {
        /** @type {Set<string>} */ const keys = polyhedron.reduce((acc, { key }) => acc.add(key), new Set());
        const expectedVertexLabels = [...Array(vertexCount)].map((_, i) => String.fromCharCode(65 + i));

        expect(keys).to.have.lengthOf(vertexCount);
        expectedVertexLabels.forEach((expectedKey) => { expect(keys).to.include(expectedKey); });
      });

      it(`should create ${connectionsPerVertex} connections per vertex`, () => {
        const connectionsCount = polyhedron.reduce((count, { connections }) => {
          expect(connections).to.have.lengthOf(connectionsPerVertex);
          return count + connections.length;
        }, 0);

        expect(connectionsCount).to.equal(connectionsPerVertex * vertexCount);
      });

      it('should create vertices that are equidistant from origin', () => {
        const expectedDistance = polyhedron.vector3.magnitude;
        /** @type {number[]} */ const actualDistances = polyhedron.map((vertex) => vertex.vector3.magnitude);

        expect(expectedDistance).to.be.greaterThan(0);
        expect(actualDistances).to.deep.equal(Array(vertexCount).fill(expectedDistance));
      });

      it('should create connections that are all equal in length', () => {
        const expectedLength = polyhedron.vector3.distanceTo(polyhedron.connections[0].vector3);
        /** @type {number[]} */ const actualLengths = polyhedron
          .map((vertex) => vertex.connections
            .map((connectedVertex) => vertex.vector3.distanceTo(connectedVertex.vector3)))
          .flat();

        expect(expectedLength).to.be.greaterThan(0);
        expect(actualLengths).to.deep.equal(Array(vertexCount * connectionsPerVertex).fill(expectedLength));
      });

      it('should create equivalent, non-zero angles between adjacent vertices, as measured from the origin', () => {
        const { triangles } = polyhedron;
        const expectedAngle = triangles[0][0].vector3.angleTo(triangles[0][1].vector3);

        expect(expectedAngle).to.be.greaterThan(0);
        triangles.forEach((triangle) => {
          expect(triangle[0].vector3.angleTo(triangle[1].vector3)).to.equal(expectedAngle);
          expect(triangle[0].vector3.angleTo(triangle[2].vector3)).to.equal(expectedAngle);
          expect(triangle[1].vector3.angleTo(triangle[2].vector3)).to.equal(expectedAngle);
        });
      });

      it(`should create ${faceCount} triangular faces`, () => {
        expect(polyhedron.triangles).to.have.lengthOf(faceCount);
      });

      it('should create exclusively equilateral triangle faces', () => {
        const { triangles } = polyhedron;
        const expectedSideLength = triangles[0][0].vector3.minus(triangles[0][1].vector3).magnitude;

        expect(expectedSideLength).to.be.greaterThan(0);

        triangles.forEach((triangle) => {
          const ab = triangle[0].vector3.minus(triangle[1].vector3);
          const ac = triangle[0].vector3.minus(triangle[2].vector3);
          const bc = triangle[1].vector3.minus(triangle[2].vector3);
          const cb = triangle[2].vector3.minus(triangle[1].vector3);

          expect(ab.angleTo(ac)).to.be.closeTo(Math.PI / 3, 0.000000001);
          expect(ab.angleTo(cb)).to.be.closeTo(Math.PI / 3, 0.000000001);
          expect(ac.angleTo(bc)).to.be.closeTo(Math.PI / 3, 0.000000001);

          expect(ab.magnitude).to.equal(expectedSideLength);
          expect(ac.magnitude).to.equal(expectedSideLength);
          expect(bc.magnitude).to.equal(expectedSideLength);
          expect(cb.magnitude).to.equal(expectedSideLength);
        });
      });
    });
  });

  it('should throw error when given an unknown polyhedron', () => {
    // @ts-ignore
    expect(() => { makePolyhedron('not a polyhedron'); }).to.throw();
  });
});
