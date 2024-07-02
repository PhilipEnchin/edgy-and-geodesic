import { expect } from 'chai';
import createIncrementor from '../../src/web/src/lib/incrementor.js';
import { ERROR } from '../../src/web/src/constants.js';
import throwMissingTest from '../support/errors/missingTest.js';

/** @typedef {import('../../src/web/src/lib/incrementor.js').Incrementor} Incrementor */

describe('createIncrementor', () => {
  /** @type {Incrementor} */ let defaultIncrementor;

  /** @type {number} */ let value;
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

    it('should return an object with an index getter function', () => {
      expect(defaultIncrementor).to.have.property('index'); // Type is tested in tests further down
    });

    it('should not enable setting value directly once created', () => {
      expect(() => { defaultIncrementor.value = 42; }).to.throw();
    });

    it('should not enable setting index directly once created', () => {
      expect(() => { defaultIncrementor.index = 42; }).to.throw();
      expect(() => { defaultIncrementor.index = undefined; }).to.throw();
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
          value, min, max, increment,
        } : { values, index },
        (...args) => { argHistory.push(args); },
      );

      incrementor.increment();
      incrementor.decrement();

      if (optionsType === 'bound') {
        expect(argHistory).to.deep.equal([[value + increment], [value]]);
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

    it('should not call callback on update', () => {
      /** @type {any[][]} */ const argHistory = [];
      const incrementor = createIncrementor(
        optionsType === 'bound' ? {
          value, min, max, increment,
        } : { values, index },
        (...args) => { argHistory.push(args); },
      );

      incrementor.update({});
      if (optionsType === 'bound') {
        incrementor.update({
          min, max, value, increment,
        });
      } else if (optionsType === 'indexed') {
        incrementor.update({ values, index });
      } else throwMissingTest();

      expect(argHistory).to.have.lengthOf(0);
    });

    it('should allow chaining on update', () => {
      const incrementedValue = defaultIncrementor.update({}).increment().value;
      if (optionsType === 'bound') {
        expect(incrementedValue).to.equal(value + increment);
      } else if (optionsType === 'indexed') {
        expect(incrementedValue).to.equal(values[index + 1]);
      } else throwMissingTest();
    });
  };

  describe('using bound incrementor options', () => {
    beforeEach(() => {
      [value, min, max, increment] = [10, 5, 16, 2];
      defaultIncrementor = createIncrementor({
        value, min, max, increment,
      });
      optionsType = 'bound';
    });

    it('should throw error if increment value is zero or negative', () => {
      expect(() => createIncrementor({
        value, min, max, increment: 0,
      })).to.throw(ERROR.INCREMENTOR_INCREMENT_NOT_POSITIVE);
      expect(() => createIncrementor({
        value, min, max, increment: -1,
      })).to.throw(ERROR.INCREMENTOR_INCREMENT_NOT_POSITIVE);
    });

    it('should throw error if initial value is outside bounds', () => {
      expect(() => createIncrementor({
        value: 10000, min, max, increment,
      })).to.throw(ERROR.INCREMENTOR_VALUE_OUT_OF_BOUNDS);
      expect(() => createIncrementor({
        value: -10000, min, max, increment,
      })).to.throw(ERROR.INCREMENTOR_VALUE_OUT_OF_BOUNDS);
      expect(() => createIncrementor({
        value: min, min, max, increment,
      })).to.not.throw();
      expect(() => createIncrementor({
        value: max, min, max, increment,
      })).to.not.throw();
    });

    it('should throw error if min is greater than max', () => {
      expect(() => createIncrementor({
        value: max, min: max, max, increment,
      })).to.not.throw();
      expect(() => createIncrementor({
        value: min, min, max: min, increment,
      })).to.not.throw();
      expect(() => createIncrementor({
        value: min, min, max: min - 1, increment,
      })).to.throw(ERROR.INCREMENTOR_MIN_MAX_FLIPPED);
      expect(() => createIncrementor({
        value: max, min, max: min - 1, increment,
      })).to.throw(ERROR.INCREMENTOR_MIN_MAX_FLIPPED);
      expect(() => createIncrementor({
        value: max + 0.5, min, max: min - 1, increment,
      })).to.throw(ERROR.INCREMENTOR_MIN_MAX_FLIPPED);
      expect(() => createIncrementor({
        value: 100000, min, max: min - 1, increment,
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
      const incrementor = createIncrementor({ value: 0, max: 10, increment: 10 ** 6 });
      for (let i = 0; i < 10 ** 6; i++) incrementor.decrement();
      expect(incrementor.value).to.equal(-(10 ** 12));
    });

    it('should set max to Infinity if omitted', () => {
      const incrementor = createIncrementor({ value: 0, min: -10, increment: 10 ** 6 });
      for (let i = 0; i < 10 ** 6; i++) incrementor.increment();
      expect(incrementor.value).to.equal(10 ** 12);
    });

    it('should set increment to 1 if omitted', () => {
      const incrementor = createIncrementor({ value: 0, min: -10, max: 10 });
      expect(incrementor.value).to.equal(0);
      expect(incrementor.increment().value).to.equal(1);
    });

    it('should set all values if empty object is passed as per above defaults', () => {
      const incrementor = createIncrementor({});
      expect(incrementor.value).to.equal(1);
      expect(incrementor.increment().value).to.equal(2);
      for (let i = 0; i < 10 ** 6; i++) incrementor.increment();
      expect(incrementor.value).to.equal(10 ** 6 + 2);
      for (let i = 0; i < 2 * 10 ** 6; i++) incrementor.decrement();
      expect(incrementor.value).to.equal(-(10 ** 6) + 2);
    });

    it('should return an index of undefined', () => {
      expect(defaultIncrementor.index).to.be.undefined;
      expect(defaultIncrementor.increment().index).to.be.undefined;
    });

    it('should update value after update', () => {
      expect(defaultIncrementor.update({ value: value + 1 }).value).to.equal(value + 1);
      expect(defaultIncrementor.update({ value: min }).value).to.equal(min);
      expect(defaultIncrementor.update({ value: max }).value).to.equal(max);
    });

    it('should increment and decrement to new max and min after update', () => {
      defaultIncrementor.update({ min: min - 10, max: max + 10 });

      for (let i = 0; i < 1000; i++) defaultIncrementor.increment();
      expect(defaultIncrementor.value).to.equal(max + 10);
      for (let i = 0; i < 1000; i++) defaultIncrementor.decrement();
      expect(defaultIncrementor.value).to.equal(min - 10);
    });

    it('should increment and decrement by new increment value after update', () => {
      defaultIncrementor.update({ increment: increment + 1 });
      expect(defaultIncrementor.increment().value).to.equal(value + increment + 1);
      expect(defaultIncrementor.decrement().value).to.equal(value);
    });

    it('should update everything', () => {
      const checkEverything = (newValue, newMin, newMax, newIncrement) => {
        expect(defaultIncrementor.value).to.equal(newValue);
        for (let i = 0; i < 1000; i++) defaultIncrementor.increment();
        expect(defaultIncrementor.value).to.equal(newMax);
        expect(defaultIncrementor.decrement().value).to.equal(newMax - newIncrement);
        for (let i = 0; i < 1000; i++) defaultIncrementor.decrement();
        expect(defaultIncrementor.value).to.equal(newMin);
        expect(defaultIncrementor.increment().value).to.equal(newMin + newIncrement);
      };

      defaultIncrementor.update({
        value: 150, min: 100, max: 200, increment: 20,
      });
      checkEverything(150, 100, 200, 20);
      defaultIncrementor.update({
        value: 15, min: 12, max: 21, increment: 1,
      });
      checkEverything(15, 12, 21, 1);
    });

    it('should not change value on update if omitted', () => {
      defaultIncrementor.update({ min, max, increment });
      expect(defaultIncrementor.value).to.equal(value);
    });

    it('should not change range on update if omitted', () => {
      const checkRange = () => {
        for (let i = 0; i < 1000; i++) defaultIncrementor.increment();
        expect(defaultIncrementor.value).to.equal(max);
        for (let i = 0; i < 1000; i++) defaultIncrementor.decrement();
        expect(defaultIncrementor.value).to.equal(min);
      };

      defaultIncrementor.update({ value, increment });
      checkRange();
      defaultIncrementor.update({ value, increment, min });
      checkRange();
      defaultIncrementor.update({ value, increment, max });
      checkRange();
    });

    it('should not change increment value on update if omitted', () => {
      defaultIncrementor.update({ value, min, max });
      expect(defaultIncrementor.increment().value).to.equal(value + increment);
    });

    it('should change value on update to min if entire range is greater than omitted value', () => {
      defaultIncrementor.update({ increment, min: value + 1000, max: value + 2000 });
      expect(defaultIncrementor.value).to.equal(value + 1000);
    });

    it('should change value on update to max if entire range is less than value', () => {
      defaultIncrementor.update({ increment, min: value - 2000, max: value - 1000 });
      expect(defaultIncrementor.value).to.equal(value - 1000);
    });

    it('should throw error on update if increment value is zero or negative', () => {
      expect(() => { defaultIncrementor.update({ increment: 0 }); }).to.throw(ERROR.INCREMENTOR_INCREMENT_NOT_POSITIVE);
      expect(() => { defaultIncrementor.update({ increment: -1 }); }).to.throw(ERROR.INCREMENTOR_INCREMENT_NOT_POSITIVE);
    });

    it('should throw error on update if set value is outside of bounds, with or without new bounds', () => {
      expect(() => { defaultIncrementor.update({ value: min - 1 }); }).to.throw(ERROR.INCREMENTOR_VALUE_OUT_OF_BOUNDS);
      expect(() => { defaultIncrementor.update({ value: max + 1 }); }).to.throw(ERROR.INCREMENTOR_VALUE_OUT_OF_BOUNDS);
      expect(() => { defaultIncrementor.update({ value: min, min: min + 1 }); }).to.throw(ERROR.INCREMENTOR_VALUE_OUT_OF_BOUNDS);
      expect(() => { defaultIncrementor.update({ value: max, max: max - 1 }); }).to.throw(ERROR.INCREMENTOR_VALUE_OUT_OF_BOUNDS);
      expect(() => { defaultIncrementor.update({ value: -1, min: 0, max: 100 }); }).to.throw(ERROR.INCREMENTOR_VALUE_OUT_OF_BOUNDS);
      expect(() => { defaultIncrementor.update({ value: 101, min: 0, max: 100 }); }).to.throw(ERROR.INCREMENTOR_VALUE_OUT_OF_BOUNDS);
    });

    it('should throw error on update if min is greater than max', () => {
      expect(() => defaultIncrementor.update({ min: max + 1 })).to.throw(ERROR.INCREMENTOR_MIN_MAX_FLIPPED);
      expect(() => defaultIncrementor.update({ max: min - 1 })).to.throw(ERROR.INCREMENTOR_MIN_MAX_FLIPPED);
      expect(() => defaultIncrementor.update({ min: 100, max: 90 })).to.throw(ERROR.INCREMENTOR_MIN_MAX_FLIPPED);
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

    it('should keep index the same with new values after update', () => {
      const newValues = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
      defaultIncrementor.update({ values: newValues });
      expect(defaultIncrementor.index).to.equal(index);
      expect(defaultIncrementor.value).to.equal(newValues[index]);
    });

    it('should update index', () => {
      defaultIncrementor.update({ index: index + 1 });
      expect(defaultIncrementor.index).to.equal(index + 1);
      expect(defaultIncrementor.value).to.equal(values[index + 1]);
    });

    it('should update everything', () => {
      defaultIncrementor.update(({ values: [1, 2, 3], index: 1 }));
      expect(defaultIncrementor.index).to.equal(1);
      expect(defaultIncrementor.value).to.equal(2);

      defaultIncrementor.update(({ values: [10, 20, 30, 40, 50, 60, 70], index: 6 }));
      expect(defaultIncrementor.index).to.equal(6);
      expect(defaultIncrementor.value).to.equal(70);
    });

    it('should not change values on update if omitted', () => {
      defaultIncrementor.update({ index: index + 1 });
      expect(defaultIncrementor.index).to.equal(index + 1);
      expect(defaultIncrementor.value).to.equal(values[index + 1]);
    });

    it('should not change index on update if omitted', () => {
      defaultIncrementor.update({ values: values.map((n) => n + 1) });
      expect(defaultIncrementor.index).to.equal(index);
      expect(defaultIncrementor.value).to.equal(values[index] + 1);
    });

    it('should throw error if values array is empty on update', () => {
      expect(() => defaultIncrementor.update({ values: [] })).to.throw(ERROR.INCREMENTOR_VALUES_EMPTY);
      expect(() => defaultIncrementor.update({ values: [], index: 0 })).to.throw(ERROR.INCREMENTOR_VALUES_EMPTY);
    });

    it('should throw error if index is outside of values array bounds on updates', () => {
      expect(() => defaultIncrementor.update({ index: 0 })).to.not.throw(ERROR.INCREMENTOR_INDEX_OUT_OF_RANGE);
      expect(() => defaultIncrementor.update({ index: -1 })).to.throw(ERROR.INCREMENTOR_INDEX_OUT_OF_RANGE);
      expect(() => defaultIncrementor.update({ index: 10 ** 10 })).to.throw(ERROR.INCREMENTOR_INDEX_OUT_OF_RANGE);
      expect(() => defaultIncrementor.update({ index: values.length - 1 })).to.not.throw();
      expect(() => defaultIncrementor.update({ index: values.length })).to.throw(ERROR.INCREMENTOR_INDEX_OUT_OF_RANGE);
      expect(() => defaultIncrementor.update({ values: [1], index: -1 })).to.throw(ERROR.INCREMENTOR_INDEX_OUT_OF_RANGE);
      expect(() => defaultIncrementor.update({ values: [1], index: 1 })).to.throw(ERROR.INCREMENTOR_INDEX_OUT_OF_RANGE);
    });

    it('should set index to max on update if new values array places current index out of bounds', () => {
      // Check to make sure this check will test and actual update
      expect(index).to.be.greaterThan(0);

      defaultIncrementor.update({ values: [1] });
      expect(defaultIncrementor.index).to.equal(0);
      expect(defaultIncrementor.value).to.equal(1);
    });
  });
});
