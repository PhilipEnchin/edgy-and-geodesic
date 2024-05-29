import { INCREMENTOR, UI } from '../constants.js';
import createIncrementor from '../lib/incrementor.js';

/**
 * @typedef {object} IncrementorUI
 * @property {number} value
 */

/**
 * @param {*} sketch
 * @param {string} labelKey
 * @param {number} initial
 * @param {number} min
 * @param {number} max
 * @param {number} increment
 * @param {number} x
 * @param {number} y
 * @param {function} callback
 * @returns {IncrementorUI}
 */
const createIncrementorUI = (sketch, labelKey, initial, min, max, increment, x, y, callback) => {
  const { BUTTON_WIDTH, PADDING_INTRA, TEXT_SIZE } = INCREMENTOR;
  const { ROW_HEIGHT } = UI;
  const incrementor = createIncrementor(initial, min, max, increment, callback);
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
