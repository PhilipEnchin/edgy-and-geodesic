import { INCREMENTOR, UI } from '../constants.js';
import createIncrementor from '../lib/incrementor.js';

/** @typedef {import('../lib/incrementor.js').IncrementorCallback} IncrementorCallback */
/** @typedef {import('../lib/incrementor.js').BoundIncrementorOptions} BoundIncrementorOptions */
/** @typedef {import('../lib/incrementor.js').IndexedIncrementorOptions} IndexedIncrementorOptions */

/**
 * @typedef {object} IncrementorUI
 * @property {number} value
 */

/**
 * @param {*} sketch
 * @param {string} labelKey
 * @param {BoundIncrementorOptions|IndexedIncrementorOptions} options
 * @param {number} x
 * @param {number} y
 * @param {IncrementorCallback} callback
 * @returns {IncrementorUI}
 */
const createIncrementorUI = (sketch, labelKey, options, x, y, callback) => {
  const { BUTTON_WIDTH, PADDING_INTRA } = INCREMENTOR;
  const { ROW_HEIGHT, TEXT_SIZE } = UI;
  const incrementor = createIncrementor(options, callback);
  const minus = sketch.createButton('-')
    .position(x, y)
    .size(BUTTON_WIDTH, ROW_HEIGHT);
  const plus = sketch.createButton('+')
    .position(x + BUTTON_WIDTH, y)
    .size(BUTTON_WIDTH, ROW_HEIGHT);

  const label = sketch.createDiv()
    .position(x + 2 * BUTTON_WIDTH + PADDING_INTRA, y)
    .style('font-size', `${TEXT_SIZE}px`);
  sketch.createSpan(`${labelKey}: `).parent(label);
  const value = sketch.createSpan().parent(label);

  const updateUI = () => {
    minus[incrementor.canDecrement() ? 'show' : 'hide']();
    plus[incrementor.canIncrement() ? 'show' : 'hide']();
    value.html(incrementor.value);
  };

  minus.mousePressed(() => { incrementor.decrement(); updateUI(); });
  plus.mousePressed(() => { incrementor.increment(); updateUI(); });

  updateUI();

  const incrementorUI = {
    get value() { return incrementor.value; },
  };
  return incrementorUI;
};

export default createIncrementorUI;
