import { ERROR } from '../constants.js';

/**
 * @typedef {object} Incrementor
 * @property {() => Incrementor} increment - Increments the value.
 * @property {() => Incrementor} decrement - Decrements the value.
 * @property {() => boolean} canIncrement - Checks if the value can be incremented.
 * @property {() => boolean} canDecrement - Checks if the value can be decremented.
 * @property {number} value - The current value.
 * @property {number|undefined} index - The current index, if indexed, otherwise undefined.
 * @property {(options:Partial<BoundIncrementorOptions|IndexedIncrementorOptions>) => Incrementor} update
 */

/** @typedef {(value:number) => void} IncrementorCallback */

/**
 * @typedef {object} BoundIncrementorOptions
 * @property {number} [value] Initial or updated value
 * @property {number} [min] Minimum allowed value (inclusive)
 * @property {number} [max] Maximum allowed value (inclusive)
 * @property {number} [increment] Amount by which to increment
 */

/**
 * @typedef {object} IndexedIncrementorOptions
 * @property {number[]} values Set of values to increment through
 * @property {number} [index] Initial index in the set of values
 */

/**
 * @param {BoundIncrementorOptions|IndexedIncrementorOptions} options
 * @param {IncrementorCallback} [callback]
 * @returns {Incrementor}
 */
const createIncrementor = (options, callback = () => {}) => {
  /** @type {Incrementor} */ let incrementor;
  if ('values' in options) {
    const values = [...options.values];
    if (values.length === 0) throw new Error(ERROR.INCREMENTOR_VALUES_EMPTY);
    let { index = 0 } = options;
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
      get index() { return index; },
      update: (updateOptions) => {
        if ('values' in updateOptions) {
          if (updateOptions.values.length === 0) throw new Error(ERROR.INCREMENTOR_VALUES_EMPTY);
          values.length = 0;
          values.push(...updateOptions.values);
          value = values[index = Math.min(index, values.length - 1)];
        }

        if ('index' in updateOptions) {
          value = values[index = updateOptions.index];
          if (index < 0 || values.length <= index) throw new Error(ERROR.INCREMENTOR_INDEX_OUT_OF_RANGE);
        }

        return incrementor;
      },
    };
  } else {
    let { min = -Infinity, max = Infinity, increment = 1 } = options;
    const { value: initial = (min <= increment && increment <= max ? increment : (max < increment ? max : min)) } = options;
    /** @type {number} */let value = initial;
    if (max < min) throw new Error(ERROR.INCREMENTOR_MIN_MAX_FLIPPED);
    if (initial < min || max < initial) throw new Error(ERROR.INCREMENTOR_VALUE_OUT_OF_BOUNDS);
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
      get index() { return undefined; },
      update: (updateOptions) => {
        if ('min' in updateOptions) min = updateOptions.min;
        if ('max' in updateOptions) max = updateOptions.max;
        if (max < min) throw new Error(ERROR.INCREMENTOR_MIN_MAX_FLIPPED);

        if ('value' in updateOptions) {
          value = updateOptions.value;
          if (value < min || value > max) throw new Error(ERROR.INCREMENTOR_VALUE_OUT_OF_BOUNDS);
        } else value = Math.max(Math.min(max, value), min);

        if ('increment' in updateOptions) {
          increment = updateOptions.increment;
          if (increment <= 0) throw new Error(ERROR.INCREMENTOR_INCREMENT_NOT_POSITIVE);
        }

        return incrementor;
      },
    };
  }
  return incrementor;
};

export default createIncrementor;
