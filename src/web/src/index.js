import p5 from 'p5';
import { COLOR, UI } from './constants.js';
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
    let polyhedron = makeIcosahedron().spherify('radius', 200);
    if (frequencyUI.value > 1) polyhedron = polyhedron.subdivide(frequencyUI.value);

    vertexSketchers = vertexMap(polyhedron, 15);
    edgeSketchers = edgeMap(polyhedron, 15);
  };

  const simpleLayout = () => {
    additionalUI.push(frequencyUI = createIncrementorUI(sketch, 'Frequency', 1, 1, 10, 1, 10, rowLocationIncrementor.increment().value, updatePolyhedron));
  };

  sketch.setup = () => {
    sketch.createCanvas(600, 600, sketch.WEBGL);
    simpleLayout();
    updatePolyhedron();
  };

  /**
   * @param {Sketcher[]} sketcher
   */
  const renderSketchers = (sketcher) => { sketcher.forEach(({ method, args }) => sketch[method](...args)); };

  sketch.draw = () => {
    sketch.background(COLOR.BACKGROUND);
    sketch.fill(255);

    sketch.orbitControl();
    renderSketchers(vertexSketchers);
    renderSketchers(edgeSketchers);
  };
};

// eslint-disable-next-line no-new
new p5(s);
