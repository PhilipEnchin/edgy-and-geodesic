/**
 * @typedef {object} Incrementor
 * @property {function} increment - Increments the value.
 * @property {function} decrement - Decrements the value.
 * @property {function} canIncrement - Checks if the value can be incremented.
 * @property {function} canDecrement - Checks if the value can be decremented.
 * @property {number} value - The current value.
 */

/** @typedef {(value:number) => void} IncrementorCallback */

/**
 * @param {number} initial
 * @param {number} min
 * @param {number} max
 * @param {number} increment
 * @param {IncrementorCallback} [callback]
 * @returns {Incrementor}
 */
const createIncrementor = (initial, min, max, increment, callback = () => {}) => {
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

export default createIncrementor;
