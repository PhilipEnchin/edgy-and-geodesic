import { INCREMENTOR, UI } from './constants.js';

/**
 * @typedef {object} Incrementor
 * @property {function} increment - Increments the value.
 * @property {function} decrement - Decrements the value.
 * @property {function} canIncrement - Checks if the value can be incremented.
 * @property {function} canDecrement - Checks if the value can be decremented.
 * @property {number} value - The current value.
 */

/**
 * @typedef {object} IncrementorUI
 * @property {number} value
 */

/**
 * @param {number} initial
 * @param {number} min
 * @param {number} max
 * @param {number} increment
 * @param {function} [callback]
 * @returns {Incrementor}
 */
export const createIncrementor = (initial, min, max, increment, callback = () => {}) => {
  let value = initial;
  const incrementor = {
    increment() {
      value = Math.min(max, value + increment);
      callback(value);
      return incrementor;
    },
    decrement() {
      value = Math.max(min, value - increment);
      callback(value);
      return incrementor;
    },
    canIncrement() { return value < max; },
    canDecrement() { return min < value; },
    get value() { return value; },
  };
  return incrementor;
};

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
export const createIncrementorUI = (sketch, labelKey, initial, min, max, increment, x, y, callback) => {
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
