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
 * @typedef {object} BoundIncrementorOptions
 * @property {number} [initial=1] Initial value
 * @property {number} [min=-Infinity] Minimum allowed value (inclusive)
 * @property {number} [max=Infinity] Maximum allowed value (inclusive)
 * @property {number} [increment=1] Amount by which to increment
 */

/**
 * @typedef {object} IndexedIncrementorOptions
 * @property {number[]} values Set of values to increment through
 * @property {number} [initialIndex=0] Initial index in the set of values
 */

/**
 * @param {BoundIncrementorOptions|IndexedIncrementorOptions} options
 * @param {IncrementorCallback} [callback]
 * @returns {Incrementor}
 */
const createIncrementor = (options, callback = () => {}) => {
  /** @type {Incrementor} */ let incrementor;
  if ('values' in options) {
    // TODO
  } else {
    const { min = -Infinity, max = Infinity, increment = 1 } = options;
    const { initial = 1 } = options;
    /** @type {number} */let value = initial;
    incrementor = {
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
  }
  return incrementor;
};

export default createIncrementor;
