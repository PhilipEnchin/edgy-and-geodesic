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
      const expectedVectorCount = expectedVectors.length;
      const expectedEdgeCount = Array.from(expectedConnections.values()).flat().length;

      const subdivided = equilateralVertex0.subdivide(frequency);
      /** @type {Vector3[]} */ const actualVectors = [];
      /** @type {Map<string,Vector3[]} */ const actualConnections = new Map();
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
        expect(actualVector.isEqualTo(expectedVector), `Expected ${actualVector} to equal ${expectedVector}`).to.be.true;

        const actualConnectionsArray = /** @type {Vector3[]} */ (actualConnections.get(actualVector.toString())).sort(vectorCompare);
        const expectedConnectionsArray = /** @type {Vector3[]} */ (expectedConnections.get(actualVector.toString())).sort(vectorCompare);
        expect(actualConnectionsArray).to.have.lengthOf(expectedConnectionsArray.length);
        for (let j = 0; j < actualConnectionsArray.length; j++) {
          connectionCount++;
          expect(actualConnectionsArray[j].isEqualTo(expectedConnectionsArray[j]), `Expected ${actualConnectionsArray[j]} to be ${expectedConnectionsArray[j]}`).to.be.true;
        }
      }
      expect(connectionCount).to.equal(expectedEdgeCount);
    };

    it('should subdivide a single triangle when frequency is 2', () => {
      const v01 = new Vector3(30, 0, 0);
      const v02 = new Vector3(15, 15 * ROOT_3, 0);
      const v12 = new Vector3(45, 15 * ROOT_3, 0);
      /** @type {Vector3[]} */ const expectedVectors = [
        EQUILATERAL_VECTOR_0, EQUILATERAL_VECTOR_1, EQUILATERAL_VECTOR_2,
        v01, v02, v12,
      ].sort(vectorCompare);
      /** @type {Map<string,Vector3[]>} */ const expectedConnections = new Map([
        [EQUILATERAL_VECTOR_0.toString(), [v01, v02]],
        [EQUILATERAL_VECTOR_1.toString(), [v01, v12]],
        [EQUILATERAL_VECTOR_2.toString(), [v02, v12]],
        [v01.toString(), [EQUILATERAL_VECTOR_0, EQUILATERAL_VECTOR_1, v02, v12]],
        [v02.toString(), [EQUILATERAL_VECTOR_0, EQUILATERAL_VECTOR_2, v01, v12]],
        [v12.toString(), [EQUILATERAL_VECTOR_1, EQUILATERAL_VECTOR_2, v01, v02]],
      ]);

      verifySubdivisions(2, expectedVectors, expectedConnections);
    });
    xit('should subdivide a single triangle when frequency is 3', () => {
      // Contains only one new non-edge vertex connected only to edges
    });
    xit('should subdivide a single triangle when frequency is 4', () => {
      // Contains 3 new non-edge vertices each connected 4 times to edges, 2 to other new vertices
    });
    xit('should subdivide a single triangle when frequency is 5', () => {
      // Contains 3 new non-edge vertices connected 4 times to edges, 2 to other new vertices, and 3 with 2 and 4 respectively
    });
    xit('should subdivide a single triangle when frequency is 6', () => {
      // Contains 9 new non-edge vertices connected to edges, and 1 connected *only* to other new non-edge vertices
    });
    xit('should subdivide two triangles sharing a single vertex', () => {
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
