import { expect } from 'chai';
import Vector3 from '../src/Vector.js';
import Vertex from '../src/Vertex.js';
import { vectorCompare } from '../src/comparators.js';

const ROOT_3 = Math.sqrt(3);

describe('Vertex', () => {
  const VECTOR_0 = new Vector3(0, 1, 2);
  const VECTOR_1 = new Vector3(1, 2, 3);
  const VECTOR_2 = new Vector3(2, 3, 4);

  /** @type {Vertex} */ let vertex0;
  /** @type {Vertex} */ let vertex1;
  /** @type {Vertex} */ let vertex2;

  beforeEach(() => {
    vertex0 = new Vertex('zero', VECTOR_0);
    vertex1 = new Vertex('one', VECTOR_1);
    vertex2 = new Vertex('two', VECTOR_2);
  });

  describe('Constructor', () => {
    it('should create a vertex with a key, vector, and no connections', () => {
      const vector = new Vector3(0, 0, 0);
      const vertex = new Vertex('vertex', vector);

      expect(vertex.key).to.equal('vertex');
      expect(vertex.vector3).to.equal(vector);
      expect(vertex.connections).to.be.empty;
    });
  });

  describe('Vertex.prototype.connect', () => {
    it('should create a two-way connection', () => {
      vertex0.connect(vertex1);

      expect(vertex0.connections).to.have.lengthOf(1);
      expect(vertex0.connections).to.include(vertex1);
      expect(vertex1.connections).to.have.lengthOf(1);
      expect(vertex1.connections).to.include(vertex0);
    });

    it('should support multiple connections', () => {
      vertex0.connect(vertex1).connect(vertex2);

      expect(vertex0.connections).to.have.lengthOf(2);
      expect(vertex0.connections).to.include(vertex1);
      expect(vertex0.connections).to.include(vertex2);
    });

    it('should connect any two vertices a maximum of one time', () => {
      vertex0.connect(vertex1).connect(vertex1);

      expect(vertex0.connections).to.have.lengthOf(1);
    });

    it('should not change connections array if connection or disconnection occurs after getter is called', () => {
      vertex0.connect(vertex1);

      const { connections } = vertex0;

      expect(connections).to.deep.equal([vertex1]);

      vertex0.connect(vertex2);
      expect(connections).to.deep.equal([vertex1]);

      vertex0.disconnect(vertex1);
      expect(connections).to.deep.equal([vertex1]);
    });
  });

  describe('Vertex.prototype.connections', () => {
    it('should be an array', () => {
      expect(vertex0.connections).to.be.an('array').that.has.lengthOf(0);
    });

    it('should contain original Vertex objects', () => {
      vertex0.connect(vertex1);
      expect(vertex0.connections[0].vector3).to.equal(VECTOR_1);
      expect(vertex1.connections[0].vector3).to.equal(VECTOR_0);
    });

    it('should not set connections array', () => {
      // @ts-ignore
      expect(() => { vertex0.connections = [vertex1]; }).to.throw();
      expect(vertex0.connections).to.be.empty;
      expect(vertex1.connections).to.be.empty;
    });

    it('should not be affected by array mutations', () => {
      vertex0.connections.push(vertex1);

      expect(vertex0.connections).to.be.empty;
      expect(vertex1.connections).to.be.empty;
    });

    it('should only include direct connections', () => {
      vertex0.connect(vertex1);
      vertex1.connect(vertex2);

      expect(vertex0.connections).to.deep.equal([vertex1]);
      expect(vertex1.connections).to.deep.equal([vertex0, vertex1]);
      expect(vertex2.connections).to.deep.equal([vertex1]);
    });
  });

  describe('Vertex.prototype.copy', () => {
    it('should return a copy with same Vertex keys', () => {
      vertex0.connect(vertex1.connect(vertex2));
      /** @type {string[]} */ const copiedKeys = [];

      const copy = vertex0.copy();

      copy.iterate(({ key }) => { copiedKeys.push(key); });

      expect(copiedKeys).to.deep.equal(['zero', 'one', 'two']);
    });

    it('should return a copy with same Vector3 values', () => {
      vertex0.connect(vertex1.connect(vertex2));
      /** @type {string[]} */ const copiedVectorStrings = [];

      const copy = vertex0.copy();

      copy.iterate(({ vector3 }) => { copiedVectorStrings.push(vector3.toString()); });

      expect(copiedVectorStrings).to.deep.equal([VECTOR_0, VECTOR_1, VECTOR_2].map(String));
    });

    it('should return a copy of every Vertex object', () => {
      vertex0.connect(vertex1.connect(vertex2));
      /** @type {Vertex[]} */ const copiedVertexObjects = [];

      const copy = vertex0.copy();

      copy.iterate((vertex) => { copiedVertexObjects.push(vertex); });

      expect(copiedVertexObjects).to.have.lengthOf(3);
      expect(copiedVertexObjects).to.not.include(vertex0);
      expect(copiedVertexObjects).to.not.include(vertex1);
      expect(copiedVertexObjects).to.not.include(vertex2);
    });

    it('should return vertex objects with new Vector3 objects', () => {
      vertex0.connect(vertex1.connect(vertex2));
      /** @type {Vector3[]} */ const copiedVector3Objects = [];

      const copy = vertex0.copy();

      copy.iterate(({ vector3 }) => { copiedVector3Objects.push(vector3); });

      expect(copiedVector3Objects).to.have.lengthOf(3);
      expect(copiedVector3Objects).to.not.include(VECTOR_0);
      expect(copiedVector3Objects).to.not.include(VECTOR_1);
      expect(copiedVector3Objects).to.not.include(VECTOR_2);
    });

    it('should maintain all connections from original structure', () => {
      vertex0.connect(vertex1.connect(vertex2));

      const copy = vertex0.copy();

      /** @type {Object<string,string[]>} */ const vMap = {};
      copy.iterate(({ connections, key }) => {
        vMap[key] = connections.map(({ key: connectionKey }) => connectionKey);
      });

      expect(vMap).to.deep.equal({
        zero: ['one'],
        one: ['zero', 'two'],
        two: ['one'],
      });
    });
  });

  describe('Vertex.prototype.disconnect', () => {
    it('should remove a two-way connection', () => {
      vertex0.connect(vertex1).connect(vertex2);
      vertex0.disconnect(vertex1);
      vertex2.disconnect(vertex0);

      expect(vertex0.connections).to.be.empty;
      expect(vertex1.connections).to.be.empty;
      expect(vertex2.connections).to.be.empty;
    });

    it('should remove a connection that was added multiple times', () => {
      vertex0.connect(vertex1).connect(vertex1);
      vertex0.disconnect(vertex1);

      expect(vertex0.connections).to.be.empty;
      expect(vertex1.connections).to.be.empty;
    });

    it('should be unaffected by removing a vertex that was unconnected', () => {
      vertex0.disconnect(vertex1);

      expect(vertex0.connections).to.be.empty;
      expect(vertex1.connections).to.be.empty;
    });

    it('should allow a connection after a disconnection', () => {
      vertex0.connect(vertex1).disconnect(vertex1).connect(vertex1);

      expect(vertex0.connections).to.deep.equal([vertex1]);
      expect(vertex1.connections).to.deep.equal([vertex0]);
    });

    it('should allow a disconnection after a disconnection and reconnection', () => {
      vertex0.connect(vertex1).disconnect(vertex1).connect(vertex1).disconnect(vertex1);
      expect(vertex0.connections).to.be.empty;
      expect(vertex1.connections).to.be.empty;
    });
  });

  describe('Vertex.prototype.isConnectedTo', () => {
    it('should return false when there are no connections', () => {
      expect(vertex0.isConnectedTo(vertex1)).to.be.false;
    });

    it('should return true for a two-way connection', () => {
      vertex0.connect(vertex1);

      expect(vertex0.isConnectedTo(vertex1)).to.be.true;
      expect(vertex1.isConnectedTo(vertex0)).to.be.true;
    });

    it('should return false after a disconnection', () => {
      vertex0.connect(vertex1).disconnect(vertex1);

      expect(vertex0.isConnectedTo(vertex1)).to.be.false;
      expect(vertex1.isConnectedTo(vertex0)).to.be.false;
    });

    it('should return true after a disconnection and reconnection', () => {
      vertex0.connect(vertex1).disconnect(vertex1).connect(vertex1);

      expect(vertex0.isConnectedTo(vertex1)).to.be.true;
      expect(vertex1.isConnectedTo(vertex0)).to.be.true;
    });

    it('should only return true for a direct connection', () => {
      vertex1.connect(vertex0).connect(vertex2);

      expect(vertex0.isConnectedTo(vertex1)).to.be.true;
      expect(vertex0.isConnectedTo(vertex2)).to.be.false;
      expect(vertex1.isConnectedTo(vertex0)).to.be.true;
      expect(vertex1.isConnectedTo(vertex2)).to.be.true;
      expect(vertex2.isConnectedTo(vertex0)).to.be.false;
      expect(vertex2.isConnectedTo(vertex1)).to.be.true;
    });
  });

  describe('Vertex.prototype.iterate', () => {
    /** @type {number} */ let count;
    const inc = () => { count++; };

    beforeEach(() => {
      count = 0;
    });

    it('should call callback once when there are no connections', () => {
      vertex0.iterate(inc);

      expect(count).to.equal(1);
    });

    it('should call callback twice when a single connection exists', () => {
      vertex0.connect(vertex1);

      vertex0.iterate(inc);

      expect(count).to.equal(2);
    });

    it('should call callback once per directly-connected vertex', () => {
      vertex0.connect(vertex1).connect(vertex2);

      vertex0.iterate(inc);

      expect(count).to.equal(3);
    });

    it('should call callback once per directly- or indirectly-connected vertex', () => {
      vertex0.connect(vertex1);
      vertex1.connect(vertex2);

      vertex0.iterate(inc);

      expect(count).to.equal(3);
    });

    it('should call callback once per connected vertex in a loop', () => {
      vertex0.connect(vertex1).connect(vertex2);
      vertex1.connect(vertex2);

      vertex0.iterate(inc);

      expect(count).to.equal(3);
    });
  });

  describe('Vertex.prototype.key', () => {
    it('should return key', () => {
      expect(vertex0.key).to.equal('zero');
    });

    it('should not set key', () => {
      // @ts-ignore
      expect(() => { vertex0.key = 'not zero'; }).to.throw();
      expect(vertex0.key).to.equal('zero');
    });
  });

  describe('Vertex.prototype.subdivide', () => {
    const EQUILATERAL_VECTOR_0 = new Vector3(0, 0, 0);
    const EQUILATERAL_VECTOR_1 = new Vector3(60, 0, 0);
    const EQUILATERAL_VECTOR_2 = new Vector3(30, 30 * ROOT_3, 0);

    /** @type {Vertex} */ let equilateralVertex0;
    /** @type {Vertex} */ let equilateralVertex1;
    /** @type {Vertex} */ let equilateralVertex2;

    beforeEach(() => {
      equilateralVertex0 = new Vertex('zero', EQUILATERAL_VECTOR_0);
      equilateralVertex1 = new Vertex('one', EQUILATERAL_VECTOR_1);
      equilateralVertex2 = new Vertex('two', EQUILATERAL_VECTOR_2);
      equilateralVertex0.connect(equilateralVertex1.connect(equilateralVertex2)).connect(equilateralVertex2);
    });

    it('should return new set of vertices, not alter the original structure', () => {
      /** @type {Vertex[]} */ const copiedVertexObjects = [];

      const copy = equilateralVertex0.subdivide(1);

      copy.iterate((vertex) => { copiedVertexObjects.push(vertex); });

      expect(copiedVertexObjects).to.have.lengthOf(3);
      expect(copiedVertexObjects).to.not.include(equilateralVertex0);
      expect(copiedVertexObjects).to.not.include(equilateralVertex1);
      expect(copiedVertexObjects).to.not.include(equilateralVertex2);
    });

    it('should return an unaltered single triangle when frequency is 1', () => {
      /** @type {Vertex[]} */ const copiedVertexObjects = [];

      const copy = equilateralVertex0.subdivide(1);

      copy.iterate((vertex) => { copiedVertexObjects.push(vertex); });

      expect(copiedVertexObjects).to.have.lengthOf(3);
      expect(copiedVertexObjects.map(({ vector3 }) => vector3.toString())).to.deep.equal([EQUILATERAL_VECTOR_0, EQUILATERAL_VECTOR_2, EQUILATERAL_VECTOR_1].map(String));
    });

    /**
     * Run assertions against subdivided structures
     * @param {number} frequency
     * @param {Vector3[]} expectedVectors
     * @param {Map<string,Vector3[]>} expectedConnections
     */
    const verifySubdivisions = (frequency, expectedVectors, expectedConnections) => {
      const EQUALITY_TOLERANCE = 0.000000000001;
      const expectedVectorCount = expectedVectors.length;
      const expectedEdgeCount = Array.from(expectedConnections.values()).flat().length;

      const subdivided = equilateralVertex0.subdivide(frequency);
      /** @type {Vector3[]} */ const actualVectors = [];
      /** @type {Map<string,Vector3[]>} */ const actualConnections = new Map();
      subdivided.iterate(({ connections, vector3 }) => {
        actualVectors.push(vector3);
        actualConnections.set(vector3.toString(), connections.map((connection) => connection.vector3));
      });
      actualVectors.sort(vectorCompare);

      expect(actualVectors).to.have.lengthOf(expectedVectorCount, 'Count of vectors in the structure is incorrect');
      let connectionCount = 0;
      for (let i = 0; i < expectedVectorCount; i++) {
        const actualVector = actualVectors[i];
        const expectedVector = expectedVectors[i];
        expect(actualVector.isEqualTo(expectedVector, EQUALITY_TOLERANCE), `Expected ${actualVector} to equal ${expectedVector} (vector at index ${i})`).to.be.true;

        const actualConnectionsArray = /** @type {Vector3[]} */ (actualConnections.get(actualVector.toString())).sort(vectorCompare);
        const expectedConnectionsArray = /** @type {Vector3[]} */ (expectedConnections.get(expectedVector.toString())).sort(vectorCompare);
        expect(actualConnectionsArray).to.have.lengthOf(expectedConnectionsArray.length);
        for (let j = 0; j < actualConnectionsArray.length; j++) {
          connectionCount++;
          expect(actualConnectionsArray[j].isEqualTo(expectedConnectionsArray[j], EQUALITY_TOLERANCE), `Expected ${actualVector} to be connected to ${expectedConnectionsArray[j]}, not ${actualConnectionsArray[j]}`).to.be.true;
        }
      }
      expect(connectionCount).to.equal(expectedEdgeCount);
    };

    it('should subdivide a single triangle when frequency is 2', () => {
      // next variables are numbered by row, then column, from bottom left
      const v01 = new Vector3(30, 0, 0);
      const v10 = new Vector3(15, 15 * ROOT_3, 0);
      const v11 = new Vector3(45, 15 * ROOT_3, 0);
      /** @type {Vector3[]} */ const expectedVectors = [
        EQUILATERAL_VECTOR_0, v01, EQUILATERAL_VECTOR_1,
        v10, v11,
        EQUILATERAL_VECTOR_2,
      ].sort(vectorCompare);
      /** @type {Map<string,Vector3[]>} */ const expectedConnections = new Map([
        [EQUILATERAL_VECTOR_0.toString(), [v01, v10]],
        [v01.toString(), [EQUILATERAL_VECTOR_0, EQUILATERAL_VECTOR_1, v10, v11]],
        [EQUILATERAL_VECTOR_1.toString(), [v01, v11]],
        [v10.toString(), [EQUILATERAL_VECTOR_0, EQUILATERAL_VECTOR_2, v01, v11]],
        [v11.toString(), [EQUILATERAL_VECTOR_1, EQUILATERAL_VECTOR_2, v01, v10]],
        [EQUILATERAL_VECTOR_2.toString(), [v10, v11]],
      ]);

      verifySubdivisions(2, expectedVectors, expectedConnections);
    });

    it('should subdivide a single triangle when frequency is 3', () => {
      // next variables are numbered by row, then column, from bottom left
      const v01 = new Vector3(20, 0, 0);
      const v02 = new Vector3(40, 0, 0);
      const v10 = new Vector3(10, 10 * ROOT_3, 0);
      const v11 = new Vector3(30, 10 * ROOT_3, 0);
      const v12 = new Vector3(50, 10 * ROOT_3, 0);
      const v20 = new Vector3(20, 20 * ROOT_3, 0);
      const v21 = new Vector3(40, 20 * ROOT_3, 0);
      /** @type {Vector3[]} */ const expectedVectors = [
        EQUILATERAL_VECTOR_0, v01, v02, EQUILATERAL_VECTOR_1,
        v10, v11, v12,
        v20, v21,
        EQUILATERAL_VECTOR_2,
      ].sort(vectorCompare);
      /** @type {Map<string,Vector3[]>} */ const expectedConnections = new Map([
        [EQUILATERAL_VECTOR_0.toString(), [v01, v10]],
        [v01.toString(), [EQUILATERAL_VECTOR_0, v02, v10, v11]],
        [v02.toString(), [v01, EQUILATERAL_VECTOR_1, v11, v12]],
        [EQUILATERAL_VECTOR_1.toString(), [v02, v12]],
        [v10.toString(), [EQUILATERAL_VECTOR_0, v01, v11, v20]],
        [v11.toString(), [v01, v02, v10, v12, v20, v21]],
        [v12.toString(), [v02, EQUILATERAL_VECTOR_1, v11, v21]],
        [v20.toString(), [v10, v11, v21, EQUILATERAL_VECTOR_2]],
        [v21.toString(), [v11, v12, v20, EQUILATERAL_VECTOR_2]],
        [EQUILATERAL_VECTOR_2.toString(), [v20, v21]],
      ]);

      verifySubdivisions(3, expectedVectors, expectedConnections);
    });

    it('should subdivide a single triangle when frequency is 4', () => {
      // next variables are numbered by row, then column, from bottom left
      const v01 = new Vector3(15, 0, 0);
      const v02 = new Vector3(30, 0, 0);
      const v03 = new Vector3(45, 0, 0);
      const v10 = new Vector3(7.5, 7.5 * ROOT_3, 0);
      const v11 = new Vector3(22.5, 7.5 * ROOT_3, 0);
      const v12 = new Vector3(37.5, 7.5 * ROOT_3, 0);
      const v13 = new Vector3(52.5, 7.5 * ROOT_3, 0);
      const v20 = new Vector3(15, 15 * ROOT_3, 0);
      const v21 = new Vector3(30, 15 * ROOT_3, 0);
      const v22 = new Vector3(45, 15 * ROOT_3, 0);
      const v30 = new Vector3(22.5, 22.5 * ROOT_3, 0);
      const v31 = new Vector3(37.5, 22.5 * ROOT_3, 0);
      /** @type {Vector3[]} */ const expectedVectors = [
        EQUILATERAL_VECTOR_0, v01, v02, v03, EQUILATERAL_VECTOR_1,
        v10, v11, v12, v13,
        v20, v21, v22,
        v30, v31,
        EQUILATERAL_VECTOR_2,
      ].sort(vectorCompare);
      /** @type {Map<string,Vector3[]>} */ const expectedConnections = new Map([
        [EQUILATERAL_VECTOR_0.toString(), [v01, v10]],
        [v01.toString(), [EQUILATERAL_VECTOR_0, v02, v10, v11]],
        [v02.toString(), [v01, v03, v11, v12]],
        [v03.toString(), [v02, EQUILATERAL_VECTOR_1, v12, v13]],
        [EQUILATERAL_VECTOR_1.toString(), [v03, v13]],
        [v10.toString(), [EQUILATERAL_VECTOR_0, v01, v11, v20]],
        [v11.toString(), [v01, v02, v10, v12, v20, v21]],
        [v12.toString(), [v02, v03, v11, v13, v21, v22]],
        [v13.toString(), [v03, EQUILATERAL_VECTOR_1, v12, v22]],
        [v20.toString(), [v10, v11, v21, v30]],
        [v21.toString(), [v11, v12, v20, v22, v30, v31]],
        [v22.toString(), [v12, v13, v21, v31]],
        [v30.toString(), [v20, v21, v31, EQUILATERAL_VECTOR_2]],
        [v31.toString(), [v21, v22, v30, EQUILATERAL_VECTOR_2]],
        [EQUILATERAL_VECTOR_2.toString(), [v30, v31]],
      ]);

      verifySubdivisions(4, expectedVectors, expectedConnections);
    });

    it('should subdivide a single triangle when frequency is 5', () => {
      // next variables are numbered by row, then column, from bottom left
      const v01 = new Vector3(12, 0, 0);
      const v02 = new Vector3(24, 0, 0);
      const v03 = new Vector3(36, 0, 0);
      const v04 = new Vector3(48, 0, 0);
      const v10 = new Vector3(6, 6 * ROOT_3, 0);
      const v11 = new Vector3(18, 6 * ROOT_3, 0);
      const v12 = new Vector3(30, 6 * ROOT_3, 0);
      const v13 = new Vector3(42, 6 * ROOT_3, 0);
      const v14 = new Vector3(54, 6 * ROOT_3, 0);
      const v20 = new Vector3(12, 12 * ROOT_3, 0);
      const v21 = new Vector3(24, 12 * ROOT_3, 0);
      const v22 = new Vector3(36, 12 * ROOT_3, 0);
      const v23 = new Vector3(48, 12 * ROOT_3, 0);
      const v30 = new Vector3(18, 18 * ROOT_3, 0);
      const v31 = new Vector3(30, 18 * ROOT_3, 0);
      const v32 = new Vector3(42, 18 * ROOT_3, 0);
      const v40 = new Vector3(24, 24 * ROOT_3, 0);
      const v41 = new Vector3(36, 24 * ROOT_3, 0);
      /** @type {Vector3[]} */ const expectedVectors = [
        EQUILATERAL_VECTOR_0, v01, v02, v03, v04, EQUILATERAL_VECTOR_1,
        v10, v11, v12, v13, v14,
        v20, v21, v22, v23,
        v30, v31, v32,
        v40, v41,
        EQUILATERAL_VECTOR_2,
      ].sort(vectorCompare);
      /** @type {Map<string,Vector3[]>} */ const expectedConnections = new Map([
        [EQUILATERAL_VECTOR_0.toString(), [v01, v10]],
        [v01.toString(), [EQUILATERAL_VECTOR_0, v02, v10, v11]],
        [v02.toString(), [v01, v03, v11, v12]],
        [v03.toString(), [v02, v04, v12, v13]],
        [v04.toString(), [v03, EQUILATERAL_VECTOR_1, v13, v14]],
        [EQUILATERAL_VECTOR_1.toString(), [v04, v14]],
        [v10.toString(), [EQUILATERAL_VECTOR_0, v01, v11, v20]],
        [v11.toString(), [v01, v02, v10, v12, v20, v21]],
        [v12.toString(), [v02, v03, v11, v13, v21, v22]],
        [v13.toString(), [v03, v04, v12, v14, v22, v23]],
        [v14.toString(), [v04, EQUILATERAL_VECTOR_1, v13, v23]],
        [v20.toString(), [v10, v11, v21, v30]],
        [v21.toString(), [v11, v12, v20, v22, v30, v31]],
        [v22.toString(), [v12, v13, v21, v23, v31, v32]],
        [v23.toString(), [v13, v14, v22, v32]],
        [v30.toString(), [v20, v21, v31, v40]],
        [v31.toString(), [v21, v22, v30, v32, v40, v41]],
        [v32.toString(), [v22, v23, v31, v41]],
        [v40.toString(), [v30, v31, v41, EQUILATERAL_VECTOR_2]],
        [v41.toString(), [v31, v32, v40, EQUILATERAL_VECTOR_2]],
        [EQUILATERAL_VECTOR_2.toString(), [v40, v41]],
      ]);

      verifySubdivisions(5, expectedVectors, expectedConnections);
    });

    it('should subdivide a single triangle when frequency is 6', () => {
      // next variables are numbered by row, then column, from bottom left
      const v01 = new Vector3(10, 0, 0);
      const v02 = new Vector3(20, 0, 0);
      const v03 = new Vector3(30, 0, 0);
      const v04 = new Vector3(40, 0, 0);
      const v05 = new Vector3(50, 0, 0);
      const v10 = new Vector3(5, 5 * ROOT_3, 0);
      const v11 = new Vector3(15, 5 * ROOT_3, 0);
      const v12 = new Vector3(25, 5 * ROOT_3, 0);
      const v13 = new Vector3(35, 5 * ROOT_3, 0);
      const v14 = new Vector3(45, 5 * ROOT_3, 0);
      const v15 = new Vector3(55, 5 * ROOT_3, 0);
      const v20 = new Vector3(10, 10 * ROOT_3, 0);
      const v21 = new Vector3(20, 10 * ROOT_3, 0);
      const v22 = new Vector3(30, 10 * ROOT_3, 0);
      const v23 = new Vector3(40, 10 * ROOT_3, 0);
      const v24 = new Vector3(50, 10 * ROOT_3, 0);
      const v30 = new Vector3(15, 15 * ROOT_3, 0);
      const v31 = new Vector3(25, 15 * ROOT_3, 0);
      const v32 = new Vector3(35, 15 * ROOT_3, 0);
      const v33 = new Vector3(45, 15 * ROOT_3, 0);
      const v40 = new Vector3(20, 20 * ROOT_3, 0);
      const v41 = new Vector3(30, 20 * ROOT_3, 0);
      const v42 = new Vector3(40, 20 * ROOT_3, 0);
      const v50 = new Vector3(25, 25 * ROOT_3, 0);
      const v51 = new Vector3(35, 25 * ROOT_3, 0);
      /** @type {Vector3[]} */ const expectedVectors = [
        EQUILATERAL_VECTOR_0, v01, v02, v03, v04, v05, EQUILATERAL_VECTOR_1,
        v10, v11, v12, v13, v14, v15,
        v20, v21, v22, v23, v24,
        v30, v31, v32, v33,
        v40, v41, v42,
        v50, v51,
        EQUILATERAL_VECTOR_2,
      ].sort(vectorCompare);
      /** @type {Map<string,Vector3[]>} */ const expectedConnections = new Map([
        [EQUILATERAL_VECTOR_0.toString(), [v01, v10]],
        [v01.toString(), [EQUILATERAL_VECTOR_0, v02, v10, v11]],
        [v02.toString(), [v01, v03, v11, v12]],
        [v03.toString(), [v02, v04, v12, v13]],
        [v04.toString(), [v03, v05, v13, v14]],
        [v05.toString(), [v04, EQUILATERAL_VECTOR_1, v14, v15]],
        [EQUILATERAL_VECTOR_1.toString(), [v05, v15]],
        [v10.toString(), [EQUILATERAL_VECTOR_0, v01, v11, v20]],
        [v11.toString(), [v01, v02, v10, v12, v20, v21]],
        [v12.toString(), [v02, v03, v11, v13, v21, v22]],
        [v13.toString(), [v03, v04, v12, v14, v22, v23]],
        [v14.toString(), [v04, v05, v13, v15, v23, v24]],
        [v15.toString(), [v05, EQUILATERAL_VECTOR_1, v14, v24]],
        [v20.toString(), [v10, v11, v21, v30]],
        [v21.toString(), [v11, v12, v20, v22, v30, v31]],
        [v22.toString(), [v12, v13, v21, v23, v31, v32]],
        [v23.toString(), [v13, v14, v22, v24, v32, v33]],
        [v24.toString(), [v14, v15, v23, v33]],
        [v30.toString(), [v20, v21, v31, v40]],
        [v31.toString(), [v21, v22, v30, v32, v40, v41]],
        [v32.toString(), [v22, v23, v31, v33, v41, v42]],
        [v33.toString(), [v23, v24, v32, v42]],
        [v40.toString(), [v30, v31, v41, v50]],
        [v41.toString(), [v31, v32, v40, v42, v50, v51]],
        [v42.toString(), [v32, v33, v41, v51]],
        [v50.toString(), [v40, v41, v51, EQUILATERAL_VECTOR_2]],
        [v51.toString(), [v41, v42, v50, EQUILATERAL_VECTOR_2]],
        [EQUILATERAL_VECTOR_2.toString(), [v50, v51]],
      ]);

      verifySubdivisions(6, expectedVectors, expectedConnections);
    });

    it('should subdivide two triangles sharing a single vertex', () => {
      const EQUILATERAL_VECTOR_3 = new Vector3(120, 0, 0);
      const EQUILATERAL_VECTOR_4 = new Vector3(90, 0, 30 * ROOT_3);
      const equilateralVertex3 = new Vertex('three', EQUILATERAL_VECTOR_3);
      const equilateralVertex4 = new Vertex('four', EQUILATERAL_VECTOR_4);
      equilateralVertex1.connect(equilateralVertex3.connect(equilateralVertex4)).connect(equilateralVertex4);

      // next variables are numbered by row, then column, from bottom left, L for triangle 012, R for 123
      const vL01 = new Vector3(20, 0, 0);
      const vL02 = new Vector3(40, 0, 0);
      const vL10 = new Vector3(10, 10 * ROOT_3, 0);
      const vL11 = new Vector3(30, 10 * ROOT_3, 0);
      const vL12 = new Vector3(50, 10 * ROOT_3, 0);
      const vL20 = new Vector3(20, 20 * ROOT_3, 0);
      const vL21 = new Vector3(40, 20 * ROOT_3, 0);
      const vR01 = new Vector3(80, 0, 0);
      const vR02 = new Vector3(100, 0, 0);
      const vR10 = new Vector3(70, 0, 10 * ROOT_3);
      const vR11 = new Vector3(90, 0, 10 * ROOT_3);
      const vR12 = new Vector3(110, 0, 10 * ROOT_3);
      const vR20 = new Vector3(80, 0, 20 * ROOT_3);
      const vR21 = new Vector3(100, 0, 20 * ROOT_3);
      /** @type {Vector3[]} */ const expectedVectors = [
        EQUILATERAL_VECTOR_0, vL01, vL02, EQUILATERAL_VECTOR_1,
        vL10, vL11, vL12,
        vL20, vL21,
        EQUILATERAL_VECTOR_2, vR01, vR02, EQUILATERAL_VECTOR_3,
        vR10, vR11, vR12,
        vR20, vR21,
        EQUILATERAL_VECTOR_4,
      ].sort(vectorCompare);
      /** @type {Map<string,Vector3[]>} */ const expectedConnections = new Map([
        [EQUILATERAL_VECTOR_0.toString(), [vL01, vL10]],
        [vL01.toString(), [EQUILATERAL_VECTOR_0, vL02, vL10, vL11]],
        [vL02.toString(), [vL01, EQUILATERAL_VECTOR_1, vL11, vL12]],
        [EQUILATERAL_VECTOR_1.toString(), [vL02, vL12, vR01, vR10]],
        [vL10.toString(), [EQUILATERAL_VECTOR_0, vL01, vL11, vL20]],
        [vL11.toString(), [vL01, vL02, vL10, vL12, vL20, vL21]],
        [vL12.toString(), [vL02, EQUILATERAL_VECTOR_1, vL11, vL21]],
        [vL20.toString(), [vL10, vL11, vL21, EQUILATERAL_VECTOR_2]],
        [vL21.toString(), [vL11, vL12, vL20, EQUILATERAL_VECTOR_2]],
        [EQUILATERAL_VECTOR_2.toString(), [vL20, vL21]],
        [vR01.toString(), [EQUILATERAL_VECTOR_1, vR02, vR10, vR11]],
        [vR02.toString(), [vR01, EQUILATERAL_VECTOR_3, vR11, vR12]],
        [EQUILATERAL_VECTOR_3.toString(), [vR02, vR12]],
        [vR10.toString(), [EQUILATERAL_VECTOR_1, vR01, vR11, vR20]],
        [vR11.toString(), [vR01, vR02, vR10, vR12, vR20, vR21]],
        [vR12.toString(), [vR02, EQUILATERAL_VECTOR_3, vR11, vR21]],
        [vR20.toString(), [vR10, vR11, vR21, EQUILATERAL_VECTOR_4]],
        [vR21.toString(), [vR11, vR12, vR20, EQUILATERAL_VECTOR_4]],
        [EQUILATERAL_VECTOR_4.toString(), [vR20, vR21]],

      ]);

      verifySubdivisions(3, expectedVectors, expectedConnections);
    });
    xit('should subdivide two triangles sharing an edge', () => {
    });
    xit('should format keys in resulting shape based on location', () => {
    });
  });

  describe('Vertex.prototype.triangles', () => {
    it('should return empty array if no connections exist', () => {
      expect(vertex0.triangles).to.be.an('array').that.is.empty;
    });

    it('should return empty array if no loops exist', () => {
      vertex1.connect(vertex0).connect(vertex2);

      expect(vertex0.triangles).to.be.empty;
      expect(vertex1.triangles).to.be.empty;
      expect(vertex2.triangles).to.be.empty;
    });

    it('should return empty array if a quadrilateral, but no triangle, exists', () => {
      const vertex3 = new Vertex('three', new Vector3(9, 4, 5));

      vertex1.connect(vertex0).connect(vertex2);
      vertex3.connect(vertex2).connect(vertex0);

      expect(vertex0.triangles).to.be.empty;
      expect(vertex1.triangles).to.be.empty;
      expect(vertex2.triangles).to.be.empty;
      expect(vertex3.triangles).to.be.empty;
    });

    it('should return each triangle only once', () => {
      const vertex3 = new Vertex('three', new Vector3(9, 4, 5));

      vertex0.connect(vertex1).connect(vertex2).connect(vertex3);
      vertex1.connect(vertex2).connect(vertex3);
      vertex2.connect(vertex3);

      [vertex0, vertex1, vertex2, vertex3].forEach((originalVertex) => {
        const { triangles } = originalVertex;
        const keys = triangles.map(([a, b, c]) => `${a.key},${b.key},${c.key}`);
        const keysSet = new Set(keys);

        expect(keys).to.have.lengthOf(keysSet.size);
      });
    });

    it('should return single triangle', () => {
      vertex0.connect(vertex1).connect(vertex2);
      vertex1.connect(vertex2);

      expect(vertex0.triangles).to.have.lengthOf(1);
      expect(vertex1.triangles).to.have.lengthOf(1);
      expect(vertex2.triangles).to.have.lengthOf(1);

      expect(vertex0.triangles).to.deep.equal(vertex1.triangles);
      expect(vertex0.triangles).to.deep.equal(vertex2.triangles);
      expect(vertex1.triangles).to.deep.equal(vertex2.triangles);

      expect(vertex0.triangles).to.deep.equal([[vertex0, vertex1, vertex2]]);
    });

    it('should return two triangles', () => {
      const vertex3 = new Vertex('three', new Vector3(9, 4, 5));

      vertex0.connect(vertex1).connect(vertex2).connect(vertex3);
      vertex1.connect(vertex2).connect(vertex3);
      vertex2.connect(vertex3);

      expect(vertex0.triangles).to.have.lengthOf(4);
      expect(vertex1.triangles).to.have.lengthOf(4);
      expect(vertex2.triangles).to.have.lengthOf(4);
      expect(vertex3.triangles).to.have.lengthOf(4);

      expect(vertex0.triangles).to.deep.equal(vertex1.triangles);
      expect(vertex0.triangles).to.deep.equal(vertex2.triangles);
      expect(vertex0.triangles).to.deep.equal(vertex3.triangles);
      expect(vertex1.triangles).to.deep.equal(vertex2.triangles);
      expect(vertex1.triangles).to.deep.equal(vertex3.triangles);
      expect(vertex2.triangles).to.deep.equal(vertex3.triangles);

      expect(vertex0.triangles).to.deep.equal([
        [vertex0, vertex1, vertex2],
        [vertex0, vertex1, vertex3],
        [vertex0, vertex2, vertex3],
        [vertex1, vertex2, vertex3],
      ]);
    });
  });

  describe('Vertex.prototype.vector3', () => {
    it('should return vector3 object, not a copy', () => {
      expect(vertex0.vector3).to.equal(VECTOR_0);
    });

    it('should not set vector3 object', () => {
      // @ts-ignore
      expect(() => { vertex0.vector3 = new Vector3(1, 2, 3); }).to.throw();
      expect(vertex0.vector3).to.equal(VECTOR_0);
    });
  });
});
