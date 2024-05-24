/**
 * @typedef {object} Incrementor
 * @property {function} increment - Increments the value.
 * @property {function} decrement - Decrements the value.
 * @property {function} canIncrement - Checks if the value can be incremented.
 * @property {function} canDecrement - Checks if the value can be decremented.
 * @property {number} value - The current value.
 */

import { INCREMENTOR, UI } from './constants.js';

/**
 * @typedef {object} IncrementorUI
 * @property {function} draw
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
 * @param {string} label
 * @param {number} initial
 * @param {number} min
 * @param {number} max
 * @param {number} increment
 * @param {number} x
 * @param {number} y
 * @param {function} callback
 * @returns {IncrementorUI}
 */
export const createIncrementorUI = (sketch, label, initial, min, max, increment, x, y, callback) => {
  const { BUTTON_WIDTH, PADDING_INTRA, TEXT_SIZE } = INCREMENTOR;
  const { ROW_HEIGHT } = UI;
  const incrementor = createIncrementor(initial, min, max, increment, callback);
  const minus = sketch.createButton('-', x, y, BUTTON_WIDTH, ROW_HEIGHT);
  const plus = sketch.createButton('+', x + BUTTON_WIDTH, y, BUTTON_WIDTH, ROW_HEIGHT);

  const incrementorUI = {
    draw() {
      if (minus.isReleased) incrementor.decrement();
      if (plus.isReleased) incrementor.increment();
      minus.label = incrementor.canDecrement() ? '-' : '';
      plus.label = incrementor.canIncrement() ? '+' : '';
      sketch.textSize(TEXT_SIZE);
      sketch.textAlign(sketch.LEFT, sketch.CENTER);
      sketch.text(`${label}: ${incrementor.value}`, x + 2 * BUTTON_WIDTH + PADDING_INTRA, y + ROW_HEIGHT / 2);
    },
    get value() { return incrementor.value; },
  };
  return incrementorUI;
};
