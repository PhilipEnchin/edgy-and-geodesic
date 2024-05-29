import p5 from 'p5';
import {
  COLOR,
  POLYHEDRON,
  UI,
  USER_PARAMETERS,
} from './constants.js';
import makeIcosahedron from '../../lib/util/icosahedron.js';
import { edgeMap, vertexMap } from './coordinateMapping.js';
import createIncrementor from './lib/incrementor.js';
import createIncrementorUI from './ui/incrementor.js';

/** @typedef {import('./ui/incrementor.js').IncrementorUI} IncrementorUI */
/** @typedef {import('../../lib/models/Vertex.js').default} Vertex */
/** @typedef {import('./coordinateMapping.js').Sketcher} Sketcher */

const s = (sketch) => {
  const rowLocationIncrementor = createIncrementor(UI.MARGIN_TOP - UI.ROW_HEIGHT - UI.PADDING_INTER, -Infinity, Infinity, UI.ROW_HEIGHT + UI.PADDING_INTER);

  /** @type {IncrementorUI[]} */ const additionalUI = [];
  /** @type {IncrementorUI} */ let frequencyUI;
  /** @type {Sketcher[]} */ let vertexSketchers;
  /** @type {Sketcher[]} */ let edgeSketchers;

  const updatePolyhedron = () => {
    const windowSize = Math.min(sketch.windowWidth, sketch.windowHeight);
    const frequency = frequencyUI.value;
    let polyhedron = makeIcosahedron().spherify('radius', windowSize * POLYHEDRON.RELATIVE_RADIUS);
    if (frequencyUI.value > 1) polyhedron = polyhedron.subdivide(frequency);

    const frequencyScaler = 1 / Math.sqrt(frequency);
    vertexSketchers = vertexMap(polyhedron, windowSize * POLYHEDRON.RELATIVE_VERTEX_RADIUS * frequencyScaler);
    edgeSketchers = edgeMap(polyhedron, windowSize * POLYHEDRON.RELATIVE_EDGE_RADIUS * frequencyScaler);
  };

  const simpleLayout = () => {
    const { FREQUENCY } = USER_PARAMETERS;
    additionalUI.push(frequencyUI = createIncrementorUI(sketch, 'Frequency', FREQUENCY.INITIAL, FREQUENCY.MIN, FREQUENCY.MAX, FREQUENCY.INCREMENT, UI.MARGIN_LEFT, rowLocationIncrementor.increment().value, updatePolyhedron));
  };

  sketch.setup = () => {
    sketch.createCanvas(sketch.windowWidth, sketch.windowHeight, sketch.WEBGL).position(0, 0);
    simpleLayout();
    updatePolyhedron();
  };

  /**
   * @param {Sketcher[]} sketcher
   */
  const renderSketchers = (sketcher) => { sketcher.forEach(({ method, args }) => sketch[method](...args)); };

  sketch.draw = () => {
    sketch.background(COLOR.BACKGROUND);
    sketch.orbitControl();
    renderSketchers(vertexSketchers);
    renderSketchers(edgeSketchers);
  };
};

// eslint-disable-next-line no-new
new p5(s);
