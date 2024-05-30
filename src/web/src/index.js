import p5 from 'p5';
import {
  COLOR,
  POLYHEDRON,
  UI,
  USER_PARAMETERS,
} from './constants.js';
import makeIcosahedron from '../../lib/util/icosahedron.js';
import { edgeMap, vertexMap } from './lib/p5CoordinateMapping.js';
import createIncrementor from './lib/incrementor.js';
import createIncrementorUI from './ui/incrementor.js';
import createCheckboxArrayUI from './ui/checkboxArray.js';

/** @typedef {import('./ui/incrementor.js').IncrementorUI} IncrementorUI */
/** @typedef {import('./ui/checkboxArray.js').CheckboxArrayUI} CheckboxArrayUI */
/** @typedef {import('../../lib/models/Vertex.js').default} Vertex */
/** @typedef {import('./lib/p5CoordinateMapping.js').Sketcher} Sketcher */

const s = (sketch) => {
  const rowLocationIncrementor = createIncrementor(UI.MARGIN_TOP - UI.ROW_HEIGHT - UI.PADDING_INTER, -Infinity, Infinity, UI.ROW_HEIGHT + UI.PADDING_INTER);

  /** @type {IncrementorUI} */ let frequencyUI;
  /** @type {CheckboxArrayUI} */ let spherifyUI;
  /** @type {Sketcher[]} */ let flatVertexSketchers;
  /** @type {Sketcher[]} */ let flatEdgeSketchers;
  /** @type {Sketcher[]} */ let roundVertexSketchers;
  /** @type {Sketcher[]} */ let roundEdgeSketchers;

  const updatePolyhedron = () => {
    const windowSize = Math.min(sketch.windowWidth, sketch.windowHeight);
    const frequency = frequencyUI.value;
    const checkboxValues = spherifyUI.values;
    const radius = windowSize * POLYHEDRON.RELATIVE_RADIUS;

    let polyhedron = makeIcosahedron().spherify('radius', radius);
    if (frequencyUI.value > 1) polyhedron = polyhedron.subdivide(frequency);

    const frequencyScaler = 1 / Math.sqrt(frequency);

    [flatVertexSketchers, flatEdgeSketchers] = checkboxValues.Flat
      ? [
        vertexMap(polyhedron, windowSize * POLYHEDRON.RELATIVE_VERTEX_RADIUS * frequencyScaler),
        edgeMap(polyhedron, windowSize * POLYHEDRON.RELATIVE_EDGE_RADIUS * frequencyScaler)]
      : [[], []];

    [roundVertexSketchers, roundEdgeSketchers] = checkboxValues.Spherified
      ? [
        vertexMap(polyhedron = polyhedron.spherify('radius', radius), windowSize * POLYHEDRON.RELATIVE_VERTEX_RADIUS * frequencyScaler),
        edgeMap(polyhedron, windowSize * POLYHEDRON.RELATIVE_EDGE_RADIUS * frequencyScaler)]
      : [[], []];
  };

  const simpleLayout = () => {
    const { FREQUENCY } = USER_PARAMETERS;
    frequencyUI = createIncrementorUI(sketch, 'Frequency', FREQUENCY.INITIAL, FREQUENCY.MIN, FREQUENCY.MAX, FREQUENCY.INCREMENT, UI.MARGIN_LEFT, rowLocationIncrementor.increment().value, updatePolyhedron);
    spherifyUI = createCheckboxArrayUI(sketch, { Flat: true, Spherified: false }, UI.MARGIN_LEFT, rowLocationIncrementor.increment().value, updatePolyhedron);
  };

  sketch.setup = () => {
    sketch.createCanvas(sketch.windowWidth, sketch.windowHeight, sketch.WEBGL).position(0, 0);
    simpleLayout();
    updatePolyhedron();
  };

  sketch.windowResized = () => {
    sketch.resizeCanvas(sketch.windowWidth, sketch.windowHeight);
    updatePolyhedron();
  };

  /**
   * @param {Sketcher[]} sketcher
   */
  const renderSketchers = (sketcher) => { sketcher.forEach(({ method, args }) => sketch[method](...args)); };

  sketch.draw = () => {
    sketch.background(COLOR.BACKGROUND);
    sketch.orbitControl();
    renderSketchers(flatVertexSketchers);
    renderSketchers(flatEdgeSketchers);
    renderSketchers(roundVertexSketchers);
    renderSketchers(roundEdgeSketchers);
  };
};

// eslint-disable-next-line no-new
new p5(s);
