import p5 from 'p5';
import {
  RENDER,
  POLYHEDRON,
  UI,
  USER_PARAMETERS,
} from './constants.js';
import createIncrementor from './lib/incrementor.js';
import createIncrementorUI from './ui/incrementor.js';
import createCheckboxArrayUI from './ui/checkboxArray.js';
import makeModel from './lib/p5Model.js';
import createRadioUI from './ui/radio.js';
import makePolyhedron from '../../lib/polyhedra/index.js';

/** @typedef {import('./ui/incrementor.js').IncrementorUI} IncrementorUI */
/** @typedef {import('./ui/checkboxArray.js').CheckboxArrayUI} CheckboxArrayUI */
/** @typedef {import('./ui/checkboxArray.js').CheckboxArray} CheckboxArray */
/** @typedef {import('./ui/radio.js').RadioUI} RadioUI */
/** @typedef {import('../../lib/polyhedra/index.js').PolyhedronId} PolyhedronId */

const s = (sketch) => {
  const rowLocationIncrementor = createIncrementor({
    initial: UI.MARGIN_TOP - UI.ROW_HEIGHT - UI.PADDING_INTER,
    min: -Infinity,
    max: Infinity,
    increment: UI.ROW_HEIGHT + UI.PADDING_INTER,
  });

  /** @type {IncrementorUI} */ let frequencyUI;
  /** @type {CheckboxArrayUI} */ let spherifyUI;
  /** @type {RadioUI} */ let basePolyhedronUI;
  /** @type {CheckboxArray} */ let checkboxValues = USER_PARAMETERS.SPHERIFIED.INITIAL;
  /** @type {p5.Geometry} */ let flatModel;
  /** @type {p5.Geometry} */ let roundModel;

  let frameRateLabel;
  const frameRateHistoryLength = 10;
  const frameRateHistory = Array(frameRateHistoryLength);
  let i = 0;
  const appendFrameRate = () => {
    frameRateHistory[i] = sketch.frameRate();
    i = (i + 1) % frameRateHistoryLength;
  };
  const getFrameRate = () => Math.round((frameRateHistory.reduce((a, b) => a + b) / frameRateHistoryLength));

  const updatePolyhedron = () => {
    const windowSize = Math.min(sketch.windowWidth, sketch.windowHeight);
    const frequency = frequencyUI.value;
    const radius = windowSize * POLYHEDRON.RELATIVE_RADIUS;
    const polyhedronId = /** @type {PolyhedronId} */ (basePolyhedronUI.selected);

    let polyhedron = makePolyhedron(polyhedronId).spherify('radius', radius);
    if (frequencyUI.value > 1) polyhedron = polyhedron.subdivide(frequency);

    const frequencyScaler = 1 / Math.sqrt(frequency);

    const edgeRadius = windowSize * POLYHEDRON.RELATIVE_EDGE_RADIUS * frequencyScaler;
    const vertexRadius = windowSize * POLYHEDRON.RELATIVE_VERTEX_RADIUS * frequencyScaler;
    flatModel = makeModel(sketch, polyhedron, edgeRadius, vertexRadius, RENDER.FLAT_EDGE_COLOR, RENDER.FLAT_VERTEX_COLOR);
    polyhedron = polyhedron.spherify('radius', radius);
    roundModel = makeModel(sketch, polyhedron, edgeRadius, vertexRadius, RENDER.ROUND_EDGE_COLOR, RENDER.ROUND_VERTEX_COLOR);
  };

  const simpleLayout = () => {
    const { FREQUENCY } = USER_PARAMETERS;
    frequencyUI = createIncrementorUI(
      sketch,
      'Frequency',
      {
        initial: FREQUENCY.INITIAL,
        min: FREQUENCY.MIN,
        max: FREQUENCY.MAX,
        increment: FREQUENCY.INCREMENT,
      },
      UI.MARGIN_LEFT,
      rowLocationIncrementor.increment().value,
      updatePolyhedron,
    );
    spherifyUI = createCheckboxArrayUI(
      sketch,
      checkboxValues,
      UI.MARGIN_LEFT,
      rowLocationIncrementor.increment().value,
      () => { checkboxValues = spherifyUI.values; },
    );
    basePolyhedronUI = createRadioUI(
      sketch,
      USER_PARAMETERS.BASE_POLYHEDRON.OPTIONS,
      USER_PARAMETERS.BASE_POLYHEDRON.INITIAL,
      UI.MARGIN_LEFT,
      rowLocationIncrementor.increment().value,
      updatePolyhedron,
    );
    frameRateLabel = sketch.createDiv('blah').position(sketch.windowWidth / 2, sketch.windowHeight / 2).style('text-align', 'center').style('font-size', '50px');
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

  sketch.draw = () => {
    sketch.background(RENDER.BACKGROUND_COLOR);
    sketch.orbitControl();
    if (checkboxValues.Flat) sketch.model(flatModel);
    if (checkboxValues.Spherified) sketch.model(roundModel);

    appendFrameRate();
    frameRateLabel.html(getFrameRate());
  };
};

// eslint-disable-next-line no-new
new p5(s);
