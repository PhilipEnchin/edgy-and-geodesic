import { expect } from 'chai';
import createIncrementor from '../../src/web/src/lib/incrementor.js';
import { ERROR } from '../../src/web/src/constants.js';
import throwMissingTest from '../support/errors/missingTest.js';

/** @typedef {import('../../src/web/src/lib/incrementor.js').Incrementor} Incrementor */

describe('createIncrementor', () => {
  /** @type {Incrementor} */ let defaultIncrementor;

  /** @type {number} */ let initial;
  /** @type {number}  */ let min;
  /** @type {number}  */ let max;
  /** @type {number}  */ let increment;
  /** @type {number[]}  */ let values;
  /** @type {number}  */ let index;
  /** @type {'bound'|'indexed'} */ let optionsType;

  const incrementorTests = () => {
    it('should return an object with an increment function', () => {
      expect(defaultIncrementor).to.have.property('increment').that.is.a('function');
    });

    it('should return an object with a decrement function', () => {
      expect(defaultIncrementor).to.have.property('decrement').that.is.a('function');
    });

    it('should return an object with a canIncrement function', () => {
      expect(defaultIncrementor).to.have.property('canIncrement').that.is.a('function');
    });

    it('should return an object with a canDecrement function', () => {
      expect(defaultIncrementor).to.have.property('canDecrement').that.is.a('function');
    });

    it('should return an object with a value getter function', () => {
      expect(defaultIncrementor).to.have.property('value').that.is.a('number');
    });

    it('should not enable setting value directly once created', () => {
      expect(() => { defaultIncrementor.value = 42; }).to.throw();
    });

    it('should increment and decrement value', () => {
      const middle = defaultIncrementor.value;
      const middleIndex = defaultIncrementor.index;
      defaultIncrementor.decrement();
      const left = defaultIncrementor.value;
      const leftIndex = defaultIncrementor.index;
      defaultIncrementor.increment().increment();
      const right = defaultIncrementor.value;
      const rightIndex = defaultIncrementor.index;

      if (optionsType === 'bound') {
        expect(middle - left).to.equal(increment);
        expect(right - middle).to.equal(increment);
        expect(middleIndex || leftIndex || rightIndex).to.be.undefined;
      } else if (optionsType === 'indexed') {
        expect(middle).to.equal(values[index]);
        expect(middleIndex).to.equal(index);
        expect(left).to.equal(values[index - 1]);
        expect(leftIndex).to.equal(index - 1);
        expect(right).to.equal(values[index + 1]);
        expect(rightIndex).to.equal(index + 1);
      } else throwMissingTest();
    });

    it('should not increment or decrement outside of bounds', () => {
      for (let i = 0; i < 10 ** 3; i++) { defaultIncrementor.decrement(); }
      const leftBound = defaultIncrementor.value;
      const indexZero = defaultIncrementor.index;

      for (let i = 0; i < 10 ** 3; i++) { defaultIncrementor.increment(); }
      const rightBound = defaultIncrementor.value;
      const indexMax = defaultIncrementor.index;

      if (optionsType === 'bound') {
        expect(leftBound).to.equal(min);
        expect(rightBound).to.equal(max);
        expect(indexZero || indexMax).to.be.undefined;
      } else if (optionsType === 'indexed') {
        expect(leftBound).to.equal(values[0]);
        expect(indexZero).to.equal(0);
        expect(rightBound).to.equal(values[values.length - 1]);
        expect(indexMax).to.equal(values.length - 1);
      } else throwMissingTest();
    });

    it('should return whether increment or decrement is possible', () => {
      expect(defaultIncrementor.canDecrement()).to.be.true;
      expect(defaultIncrementor.canIncrement()).to.be.true;

      for (let i = 0; i < 10 ** 3; i++) { defaultIncrementor.decrement(); }
      expect(defaultIncrementor.canDecrement()).to.be.false;
      expect(defaultIncrementor.canIncrement()).to.be.true;

      for (let i = 0; i < 10 ** 3; i++) { defaultIncrementor.increment(); }
      expect(defaultIncrementor.canDecrement()).to.be.true;
      expect(defaultIncrementor.canIncrement()).to.be.false;
    });

    it('should call callback with new value as only argument', () => {
      /** @type {any[][]} */ const argHistory = [];
      const incrementor = createIncrementor(
        optionsType === 'bound' ? {
          initial, min, max, increment,
        } : { values, index },
        (...args) => { argHistory.push(args); },
      );

      incrementor.increment();
      incrementor.decrement();

      if (optionsType === 'bound') {
        expect(argHistory).to.deep.equal([[initial + increment], [initial]]);
      } else if (optionsType === 'indexed') {
        expect(argHistory).to.deep.equal([[values[index + 1]], [values[index]]]);
      } else throwMissingTest();
    });

    it('should allow chaining increment/decrement functions together', () => {
      const minimumValue = defaultIncrementor.decrement().decrement().decrement().value;
      const threeToRight = defaultIncrementor.increment().increment().increment().value;

      if (optionsType === 'bound') {
        expect(minimumValue).to.equal(min);
        expect(threeToRight).to.equal(min + 3 * increment);
      } else if (optionsType === 'indexed') {
        expect(minimumValue).to.equal(values[0]);
        expect(threeToRight).to.equal(values[3]);
      } else throwMissingTest();
    });
  };

  describe('using bound incrementor options', () => {
    beforeEach(() => {
      [initial, min, max, increment] = [10, 5, 16, 2];
      defaultIncrementor = createIncrementor({
        initial, min, max, increment,
      });
      optionsType = 'bound';
    });

    it('should throw error if increment value is zero or negative', () => {
      expect(() => createIncrementor({
        initial, min, max, increment: 0,
      })).to.throw(ERROR.INCREMENTOR_INCREMENT_NOT_POSITIVE);
      expect(() => createIncrementor({
        initial, min, max, increment: -1,
      })).to.throw(ERROR.INCREMENTOR_INCREMENT_NOT_POSITIVE);
    });

    it('should throw error if initial value is outside bounds', () => {
      expect(() => createIncrementor({
        initial: 10000, min, max, increment,
      })).to.throw(ERROR.INCREMENTOR_INITIAL_OUT_OF_BOUNDS);
      expect(() => createIncrementor({
        initial: -10000, min, max, increment,
      })).to.throw(ERROR.INCREMENTOR_INITIAL_OUT_OF_BOUNDS);
      expect(() => createIncrementor({
        initial: min, min, max, increment,
      })).to.not.throw();
      expect(() => createIncrementor({
        initial: max, min, max, increment,
      })).to.not.throw();
    });

    it('should throw error if min is greater than max', () => {
      expect(() => createIncrementor({
        initial: max, min: max, max, increment,
      })).to.not.throw();
      expect(() => createIncrementor({
        initial: min, min, max: min, increment,
      })).to.not.throw();
      expect(() => createIncrementor({
        initial: min, min, max: min - 1, increment,
      })).to.throw(ERROR.INCREMENTOR_MIN_MAX_FLIPPED);
      expect(() => createIncrementor({
        initial: max, min, max: min - 1, increment,
      })).to.throw(ERROR.INCREMENTOR_MIN_MAX_FLIPPED);
      expect(() => createIncrementor({
        initial: max + 0.5, min, max: min - 1, increment,
      })).to.throw(ERROR.INCREMENTOR_MIN_MAX_FLIPPED);
      expect(() => createIncrementor({
        initial: 100000, min, max: min - 1, increment,
      })).to.throw(ERROR.INCREMENTOR_MIN_MAX_FLIPPED);
    });
    incrementorTests();

    it('should set initial value to increment if omitted and increment is within bounds', () => {
      expect(createIncrementor({ min: 0, max: 10, increment: 1 }).value).to.equal(1);
      expect(createIncrementor({ min: 0, max: 10, increment: 2 }).value).to.equal(2);
    });

    it('should set initial to min if omitted and min is greater than increment value', () => {
      expect(createIncrementor({ min: 10, max: 20, increment: 2 }).value).to.equal(10);
      expect(createIncrementor({ min: 10, max: 20 }).value).to.equal(10);
    });

    it('should set initial to max if omitted and max is greater than increment value', () => {
      expect(createIncrementor({ min: -20, max: -10, increment: 2 }).value).to.equal(-10);
      expect(createIncrementor({ min: -20, max: -10 }).value).to.equal(-10);
    });

    it('should set min to -Infinity if omitted', () => {
      const incrementor = createIncrementor({ initial: 0, max: 10, increment: 10 ** 6 });
      for (let i = 0; i < 10 ** 6; i++) incrementor.decrement();
      expect(incrementor.value).to.equal(-(10 ** 12));
    });

    it('should set max to Infinity if omitted', () => {
      const incrementor = createIncrementor({ initial: 0, min: -10, increment: 10 ** 6 });
      for (let i = 0; i < 10 ** 6; i++) incrementor.increment();
      expect(incrementor.value).to.equal(10 ** 12);
    });

    it('should return an index of undefined', () => {
      expect(defaultIncrementor.index).to.be.undefined;
      expect(defaultIncrementor.increment().index).to.be.undefined;
    });
  });

  describe('using indexed incrementor options', () => {
    beforeEach(() => {
      [values, index] = [[1, 10, 100, 1000, 10000], 2];
      defaultIncrementor = createIncrementor({ values, index });
      optionsType = 'indexed';
    });

    it('should throw error if values array is empty', () => {
      expect(() => { createIncrementor({ values: [] }); }).to.throw(ERROR.INCREMENTOR_VALUES_EMPTY);
    });

    it('should throw error if initial index is outside of values array bounds', () => {
      expect(() => { createIncrementor({ values: [1, 2, 3], index: -1 }); }).to.throw(ERROR.INCREMENTOR_INDEX_OUT_OF_RANGE);
      expect(() => { createIncrementor({ values: [1, 2, 3], index: 3 }); }).to.throw(ERROR.INCREMENTOR_INDEX_OUT_OF_RANGE);
    });
    incrementorTests();

    it('should set initial index to 0 if omitted', () => {
      const incrementor = createIncrementor({ values: [42, 43, 44] });
      expect(incrementor.value).to.equal(42);
      expect(incrementor.index).to.equal(0);
    });
  });
});
