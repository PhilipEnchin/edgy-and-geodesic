import { ERROR } from '../constants.js';

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
    const { values } = options;
    if (values.length === 0) throw new Error(ERROR.INCREMENTOR_VALUES_EMPTY);
    let { initialIndex: index = 0 } = options;
    if (!(index in values)) throw new Error(ERROR.INCREMENTOR_INDEX_OUT_OF_RANGE);
    /** @type {number} */ let value = values[index];
    const maxIndex = values.length - 1;
    incrementor = {
      increment: () => {
        callback(value = values[index = Math.min(index + 1, maxIndex)]);
        return incrementor;
      },
      decrement: () => {
        callback(value = values[index = Math.max(index - 1, 0)]);
        return incrementor;
      },
      canIncrement: () => index < maxIndex,
      canDecrement: () => index > 0,
      get value() { return value; },
    };
  } else {
    const { min = -Infinity, max = Infinity, increment = 1 } = options;
    const { initial = (min <= increment && increment <= max ? increment : (max < increment ? max : min)) } = options;
    /** @type {number} */let value = initial;
    if (max < min) throw new Error(ERROR.INCREMENTOR_MIN_MAX_FLIPPED);
    if (initial < min || max < initial) throw new Error(ERROR.INCREMENTOR_INITIAL_OUT_OF_BOUNDS);
    if (increment <= 0) throw new Error(ERROR.INCREMENTOR_INCREMENT_NOT_POSITIVE);
    incrementor = {
      increment: () => {
        callback(value = Math.min(max, value + increment));
        return incrementor;
      },
      decrement: () => {
        callback(value = Math.max(min, value - increment));
        return incrementor;
      },
      canIncrement: () => value < max,
      canDecrement: () => min < value,
      get value() { return value; },
    };
  }
  return incrementor;
};

export default createIncrementor;
