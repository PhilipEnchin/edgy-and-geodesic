import * as chai from 'chai';
import deepEqualInAnyOrder from 'deep-equal-in-any-order';
import Vector3 from '../../src/lib/models/Vector.js';
import Vertex from '../../src/lib/models/Vertex.js';
import makeModel from '../../src/web/src/lib/p5Model.js';
import makeMockSketch from '../support/mockSketch.js';
import { RENDER } from '../../src/web/src/constants.js';
import { round } from '../../src/lib/util/numberFormatters.js';

const { expect } = chai;
chai.use(deepEqualInAnyOrder);

/** @typedef {import('../support/mockSketch.js').MockSketch} MockSketch */
/** @typedef {import('../../src/web/src/lib/p5Model.js').SingleColorOptions} SingleColorOptions */
/** @typedef {import('../../src/web/src/lib/p5Model.js').SpectrumColorOptions} SpectrumColorOptions */
/** @typedef {import('../../src/web/src/lib/p5Model.js').HighlightColorOptions} HighlightColorOptions */

const {
  EDGE_LENGTH_DIFFERENTIATION_THRESHOLD,
  SPECTRUM_LIGHTNESS,
  SPECTRUM_SATURATION,
  VERTEX_SPHERE_DETAIL,
} = RENDER;

describe('p5 model (makeModel function)', () => {
  const a = new Vertex('a', new Vector3(0, 0, 0));
  const b = new Vertex('b', new Vector3(3, 0, 0));
  const c = new Vertex('c', new Vector3(4, 0, 0));
  /** @type {Vertex} */ let polyhedron;
  /** @type {MockSketch} */ let mockSketch;

  const EDGE_RADIUS = 2;
  const VERTEX_RADIUS = 3;

  /** @type {SingleColorOptions} */ const singleColorOptions = {
    edgeColor: '#000',
    vertexColor: '#111',
  };
    /** @type {SpectrumColorOptions} */ const spectrumColorOptions = {
    minLengthHue: 600,
    maxLengthHue: 1200,
    vertexColor: '#222',
  };
  /** @type {HighlightColorOptions} */ const highlightColorOptionsAB = {
    edgeColor: '#333',
    prominentEdgeColor: '#444',
    prominentEdgeLength: round(a.vector3.distanceTo(b.vector3), EDGE_LENGTH_DIFFERENTIATION_THRESHOLD),
    vertexColor: '#555',
  };
  /** @type {HighlightColorOptions} */ const highlightColorOptionsAC = {
    ...highlightColorOptionsAB,
    prominentEdgeLength: round(a.vector3.distanceTo(c.vector3), EDGE_LENGTH_DIFFERENTIATION_THRESHOLD),
    edgeColor: '#666',
    prominentEdgeColor: '#777',
  };
  /**
   * @param {SingleColorOptions|SpectrumColorOptions} colorOptions
   */
  const makeTestModel = (colorOptions) => makeModel(mockSketch, polyhedron, EDGE_RADIUS, VERTEX_RADIUS, colorOptions);

  beforeEach(() => {
    polyhedron = a.connect(b.connect(c)).connect(c);
    mockSketch = makeMockSketch();
    makeTestModel(singleColorOptions);
  });

  it('should set vertex spheres to correct radius', () => {
    const sphereCalls = mockSketch.geometryCalls.filter(({ method }) => method === 'sphere');

    const expectedSphereCalls = [a, b, c].map(({ vector3: { x, y, z } }) => ({
      method: 'sphere',
      args: [VERTEX_RADIUS, VERTEX_SPHERE_DETAIL, VERTEX_SPHERE_DETAIL],
      geometryProperties: {
        fill: [singleColorOptions.vertexColor],
        noStroke: true,
        translate: [x, y, z],
      },
    }));
    expect(sphereCalls).to.deep.equalInAnyOrder(expectedSphereCalls);
  });

  it('should set edge boxes to correct dimensions', () => {
    const boxCalls = mockSketch.geometryCalls.filter(({ method }) => method === 'box');

    const verticalVector = new Vector3(0, 1, 0);
    const expectedBoxCalls = [[a, b], [a, c], [c, b]].map(([{ vector3: va }, { vector3: vb }]) => {
      const { x: xa, y: ya, z: za } = va;
      const { x: xb, y: yb, z: zb } = vb;
      const edgeVector = vb.minus(va);
      const { x: xr, y: yr, z: zr } = verticalVector.cross(edgeVector);
      return {
        method: 'box',
        args: [EDGE_RADIUS, va.distanceTo(vb), EDGE_RADIUS],
        geometryProperties: {
          fill: [singleColorOptions.edgeColor],
          translate: [(xa + xb) / 2, (ya + yb) / 2, (za + zb) / 2],
          rotate: [verticalVector.angleTo(edgeVector), [xr, yr, zr]],
        },
      };
    });

    expect(boxCalls).to.deep.equalInAnyOrder(expectedBoxCalls);
  });

  it('should bookend all geometry calls with beginGeometry and endGeometry', () => {
    const [firstCall] = mockSketch.geometryCalls;
    const [lastCall] = mockSketch.geometryCalls.slice(-1);

    expect(firstCall.method).to.equal('beginGeometry');
    expect(lastCall.method).to.equal('endGeometry');
  });

  xit('should cache and reuse models', () => {});

  describe('single color mode', () => {
    it('should set edge color', () => {
      const edgeColors = mockSketch.geometryCalls.filter(({ method }) => method === 'box').map(({ geometryProperties: { fill } }) => fill);

      const expectedEdgeColors = edgeColors.map(() => [singleColorOptions.edgeColor]);

      expect(edgeColors).to.deep.equal(expectedEdgeColors);
    });

    it('should set vertex color', () => {
      const sphereCalls = mockSketch.geometryCalls.filter(({ method }) => method === 'sphere');
      const vertexColors = sphereCalls.map(({ geometryProperties: { fill } }) => fill);
      const noStrokes = sphereCalls.map(({ geometryProperties: { noStroke } }) => noStroke);

      const expectedVertexColors = vertexColors.map(() => [singleColorOptions.vertexColor]);
      const expectedNoStrokes = vertexColors.map(() => true);

      expect(vertexColors).to.deep.equal(expectedVertexColors);
      expect(noStrokes).to.deep.equal(expectedNoStrokes);
    });
  });

  describe('spectrum color mode', () => {
    beforeEach(() => {
      mockSketch.reset();
      makeTestModel(spectrumColorOptions);
    });

    it('should set vertex color', () => {
      const sphereCalls = mockSketch.geometryCalls.filter(({ method }) => method === 'sphere');
      const vertexColors = sphereCalls.map(({ geometryProperties: { fill } }) => fill);
      const noStrokes = sphereCalls.map(({ geometryProperties: { noStroke } }) => noStroke);

      const expectedVertexColors = vertexColors.map(() => [spectrumColorOptions.vertexColor]);
      const expectedNoStrokes = vertexColors.map(() => true);

      expect(vertexColors).to.deep.equal(expectedVertexColors);
      expect(noStrokes).to.deep.equal(expectedNoStrokes);
    });

    it('should set edge colors by length', () => {
      const edgeCalls = mockSketch.geometryCalls.filter(({ method }) => method === 'box');

      const colorModes = edgeCalls.map(({ geometryProperties: { colorMode } }) => colorMode);

      const expectedColorModes = colorModes.map(() => String(mockSketch.HSL));

      const edgeColors = edgeCalls.map(({ geometryProperties: { fill } }) => fill);

      const edgeLengths = Array.from(new Set(edgeCalls.map(({ args: [, length] }) => length)));
      const sortedEdgeLengths = edgeLengths.toSorted((l1, l2) => l1 - l2);

      const { minLengthHue: minHue, maxLengthHue: maxHue } = spectrumColorOptions;
      const expectedEdgeColors = edgeColors.map((_, i) => [
        sortedEdgeLengths.findIndex((length) => length === edgeLengths[i]) * (maxHue - minHue) / (edgeLengths.length - 1) + minHue,
        SPECTRUM_SATURATION,
        SPECTRUM_LIGHTNESS,
      ]);

      expect(colorModes).to.deep.equal(expectedColorModes);
      expect(edgeColors).to.deep.equal(expectedEdgeColors);
    });
  });

  describe('highlight color mode', () => {
    beforeEach(() => {
      mockSketch.reset();
      makeTestModel(highlightColorOptionsAB);
    });

    it('should set vertex color', () => {
      const sphereCalls = mockSketch.geometryCalls.filter(({ method }) => method === 'sphere');
      const vertexColors = sphereCalls.map(({ geometryProperties: { fill } }) => fill);
      const noStrokes = sphereCalls.map(({ geometryProperties: { noStroke } }) => noStroke);

      const expectedVertexColors = vertexColors.map(() => [highlightColorOptionsAB.vertexColor]);
      const expectedNoStrokes = vertexColors.map(() => true);

      expect(vertexColors).to.deep.equal(expectedVertexColors);
      expect(noStrokes).to.deep.equal(expectedNoStrokes);
    });

    it('should set edge colors by length', () => {
      const edgeCallsAB = mockSketch.geometryCalls.filter(({ method }) => method === 'box');
      const edgeColorsAB = edgeCallsAB.map(({ geometryProperties: { fill } }) => fill);

      const expectedEdgeColorsAB = edgeCallsAB.map(({ args: [, length] }) => [(length === a.vector3.distanceTo(b.vector3) ? highlightColorOptionsAB.prominentEdgeColor : highlightColorOptionsAB.edgeColor)]);

      mockSketch.reset();
      makeTestModel(highlightColorOptionsAC);

      const edgeCallsAC = mockSketch.geometryCalls.filter(({ method }) => method === 'box');
      const edgeColorsAC = edgeCallsAC.map(({ geometryProperties: { fill } }) => fill);

      const expectedEdgeColorsAC = edgeCallsAC.map(({ args: [, length] }) => [(length === a.vector3.distanceTo(c.vector3) ? highlightColorOptionsAC.prominentEdgeColor : highlightColorOptionsAC.edgeColor)]);

      expect(edgeColorsAB).to.deep.equal(expectedEdgeColorsAB);
      expect(edgeColorsAC).to.deep.equal(expectedEdgeColorsAC);
    });
  });
});
