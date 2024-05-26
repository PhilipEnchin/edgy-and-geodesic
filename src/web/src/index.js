import p5 from 'p5';
import 'p5.touchgui';
import { createIncrementor, createIncrementorUI } from './util.js';
import { COLOR, UI } from './constants.js';
import makeIcosahedron from '../../lib/util/icosahedron.js';

/** @typedef {import('./util.js').IncrementorUI} IncrementorUI */
/** @typedef {import('../../lib/models/Vertex.js').default} Vertex */

const s = (sketch) => {
  const rowLocationIncrementor = createIncrementor(UI.MARGIN_TOP - UI.ROW_HEIGHT - UI.PADDING_INTER, -Infinity, Infinity, UI.ROW_HEIGHT + UI.PADDING_INTER);

  /** @type {IncrementorUI[]} */ const additionalUI = [];

  let gui;

  /** @type {IncrementorUI} */ let frequencyUI;

  /**
   * @returns {Vertex}
   */
  const makePolyhedron = () => {
    const icosahedron = makeIcosahedron();
    const subdividedIcosahedron = icosahedron.subdivide(frequencyUI.value);

    return subdividedIcosahedron;
  };

  /** @type {Vertex} */ let polyhedron;
  const updatePolyhedron = () => { polyhedron = makePolyhedron(); };

  const simpleLayout = () => {
    additionalUI.push(frequencyUI = createIncrementorUI(sketch, 'Frequency', 1, 1, 10, 1, 10, rowLocationIncrementor.increment().value, updatePolyhedron));
  };

  sketch.setup = () => {
    const canvas = sketch.createCanvas(600, 600);
    gui = sketch.createGui(canvas);
    simpleLayout();
    polyhedron = makePolyhedron();
  };

  sketch.draw = () => {
    sketch.background(COLOR.BACKGROUND);
    sketch.fill(255);
    sketch.drawGui();
    additionalUI.forEach((ui) => ui.draw());
  };
};

// eslint-disable-next-line no-new
new p5(s);
