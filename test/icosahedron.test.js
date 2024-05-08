import { expect } from 'chai';
import makeIcosahedron from '../src/icosahedron.js';

/** @typedef {import('../src/Vertex.js').default} Vertex */

describe('makeIcosahedron', () => {
  /** @type {Vertex} */ let icosahedron;

  beforeEach(() => {
    icosahedron = makeIcosahedron();
  });

  it('should create a connected structure with 12 vertices', () => {
    expect(icosahedron.toArray()).to.have.lengthOf(12);
  });

  it('should create a structure with 30 edges', () => {
    expect(icosahedron.edges).to.have.lengthOf(30);
  });

  it('should create consecutive (and therefore, unique), numerical keys for vertices', () => {
    /** @type {Set<number>} */ const keys = icosahedron.reduce((acc, { key }) => acc.add(Number(key)), new Set());

    expect(keys).to.have.lengthOf(12);
    for (let i = 0; i < 12; i++) { expect(keys).to.include(i); }
  });

  it('should create 5 connections per vertex', () => {
    const connectionsCount = icosahedron.reduce((count, { connections }) => {
      expect(connections).to.have.lengthOf(5);
      return count + connections.length;
    }, 0);

    expect(connectionsCount).to.equal(60);
  });

  it('should create vertices that are equidistant from origin', () => {
    const expectedDistance = icosahedron.vector3.magnitude;
    /** @type {number[]} */ const actualDistances = icosahedron.map((vertex) => vertex.vector3.magnitude);

    expect(expectedDistance).to.be.greaterThan(0);
    expect(actualDistances).to.deep.equal(Array(12).fill(expectedDistance));
  });

  it('should create connections that are all equal in length', () => {
    const expectedLength = icosahedron.vector3.distanceTo(icosahedron.connections[0].vector3);
    /** @type {number[]} */ const actualLenghts = icosahedron
      .map((vertex) => vertex.connections
        .map((connectedVertex) => vertex.vector3.distanceTo(connectedVertex.vector3)))
      .flat();

    expect(expectedLength).to.be.greaterThan(0);
    expect(actualLenghts).to.deep.equal(Array(60).fill(expectedLength));
  });

  it('should create equivalent, non-zero angles between adjascent vertices, as measured from the origin', () => {
    const { triangles } = icosahedron;
    const expectedAngle = triangles[0][0].vector3.angleTo(triangles[0][1].vector3);

    expect(expectedAngle).to.be.greaterThan(0);
    triangles.forEach((triangle) => {
      expect(triangle[0].vector3.angleTo(triangle[1].vector3)).to.equal(expectedAngle);
      expect(triangle[0].vector3.angleTo(triangle[2].vector3)).to.equal(expectedAngle);
      expect(triangle[1].vector3.angleTo(triangle[2].vector3)).to.equal(expectedAngle);
    });
  });

  it('should create 20 triangular faces', () => {
    expect(icosahedron.triangles).to.have.lengthOf(20);
  });

  it('should create exclusively equilateral triangle faces', () => {
    const { triangles } = icosahedron;
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
