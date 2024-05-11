import { expect } from 'chai';
import Vertex from '../../../src/lib/models/Vertex.js';
import Vector3 from '../../../src/lib/models/Vector.js';
import { decorateEdges, groupDecoratedEdgesByLength } from '../../../src/lib/util/edgeProcessor.js';

describe('Edge processor', () => {
  /** @type {Vertex} */ let vertex0;
  /** @type {Vertex} */ let vertex1;
  /** @type {Vertex} */ let vertex2;
  /** @type {Vertex} */ let vertex3;

  beforeEach(() => {
    vertex0 = new Vertex('zero', new Vector3(1, 2, 3));
    vertex1 = new Vertex('one', new Vector3(-2, 6, 3));
    vertex2 = new Vertex('two', new Vector3(-4, 3, -3));
    vertex3 = new Vertex('three', new Vector3(1, 5, -1));
  });

  describe('decorateEdges', () => {
    it('should return an empty array when no edges are present', () => {
      expect(decorateEdges(vertex0, -2)).to.be.an('array').with.lengthOf(0);
    });

    it('should process a single edge', () => {
      vertex0.connect(vertex1);

      const edges = decorateEdges(vertex0, -2);
      const [edge] = edges;

      expect(edges).to.be.an('array').with.lengthOf(1);
      expect(edge.vectors[0].isEqualTo(vertex1.vector3)).to.be.true;
      expect(edge.vectors[1].isEqualTo(vertex0.vector3)).to.be.true;
      expect(edge.edgeLength).to.equal(5);
      expect(edge.label).to.equal('one <-> zero');
    });

    it('should process multiple edges', () => {
      vertex0.connect(vertex1.connect(vertex2)).connect(vertex2);

      const edges = decorateEdges(vertex0, -2);

      expect(edges).to.be.an('array').with.lengthOf(3);
      expect(edges.map(({ vectors: [a, b] }) => [String(a), String(b)])).to.deep.equal([
        [vertex1, vertex2],
        [vertex1, vertex0],
        [vertex2, vertex0],
      ].map(([a, b]) => [String(a.vector3), String(b.vector3)]));
      expect(edges.map(({ label, edgeLength }) => ({ label, edgeLength }))).to.deep.equal([
        { label: 'one <-> two', edgeLength: 7 },
        { label: 'one <-> zero', edgeLength: 5 },
        { label: 'two <-> zero', edgeLength: 7.87 },
      ]);

      // Make sure all properties are being tested
      expect(edges[0]).to.have.keys(['label', 'edgeLength', 'vectors']);
      expect(edges[0].vectors).to.have.lengthOf(2);
    });
  });

  describe('groupEdgesByLength', () => {
    it('should return an empty array if given an empty array', () => {
      expect(groupDecoratedEdgesByLength([])).to.be.an('array').that.is.empty;
    });

    it('should return one group with a single edge', () => {
      vertex0.connect(vertex1);

      const grouped = groupDecoratedEdgesByLength(decorateEdges(vertex0, 0));
      const [group] = grouped;

      expect(grouped).to.have.lengthOf(1);
      expect(group.edgeLength).to.equal(5);
      expect(group.edges).to.have.lengthOf(1);
      expect(group.edges[0].vectors[0]).to.equal(vertex1.vector3);
      expect(group.edges[0].vectors[1]).to.equal(vertex0.vector3);
    });

    it('should return one group with a multiple edges of same length', () => {
      vertex0.connect(vertex1).connect(vertex3);

      const grouped = groupDecoratedEdgesByLength(decorateEdges(vertex0, 0));
      const [group] = grouped;

      expect(grouped).to.have.lengthOf(1);
      expect(group.edgeLength).to.equal(5);
      expect(group.edges).to.have.lengthOf(2);
      expect(group.edges.map((edge) => edge.label)).to.deep.equal(['one <-> zero', 'three <-> zero']);
    });

    it('should return multiple groups with edges of different lengths', () => {
      vertex0.connect(vertex1.connect(vertex2)).connect(vertex2).connect(vertex3);
      const grouped = groupDecoratedEdgesByLength(decorateEdges(vertex0, -2));

      expect(grouped).to.have.lengthOf(3);
      expect(grouped.map((group) => group.edgeLength)).to.deep.equal([5, 7, 7.87]);
      expect(grouped.map((group) => group.edges.map((edge) => edge.label))).to.deep.equal([
        ['one <-> zero', 'three <-> zero'],
        ['one <-> two'],
        ['two <-> zero'],
      ]);
    });
  });
});
