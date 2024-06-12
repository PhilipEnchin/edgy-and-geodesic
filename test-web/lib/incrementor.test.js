import { expect } from 'chai';
import createIncrementor from '../../src/web/src/lib/incrementor.js';

/** @typedef {import('../../src/web/src/lib/incrementor.js').Incrementor} Incrementor */

describe('createIncrementor', () => {
  /** @type {Incrementor} */ let defaultIncrementor;

  /** @type {number} */ let initial;
  /** @type {number}  */ let min;
  /** @type {number}  */ let max;
  /** @type {number}  */ let increment;
  /** @type {number[]}  */ let values;
  /** @type {number}  */ let initialIndex;
  /** @type {'bound'|'indexed'} */ let optionsType;

  const incrementorTests = () => {
    const throwMissingTest = () => { throw new Error('Missed a possible incrementor options type'); };

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
      defaultIncrementor.decrement();
      const left = defaultIncrementor.value;
      defaultIncrementor.increment().increment();
      const right = defaultIncrementor.value;

      if (optionsType === 'bound') {
        expect(middle - left).to.equal(increment);
        expect(right - middle).to.equal(increment);
      } else if (optionsType === 'indexed') {
        expect(middle).to.equal(values[initialIndex]);
        expect(left).to.equal(values[initialIndex - 1]);
        expect(right).to.equal(values[initialIndex + 1]);
      } else throwMissingTest();
    });

    it('should not increment or decrement outside of bounds', () => {
      for (let i = 0; i < 10 ** 3; i++) { defaultIncrementor.decrement(); }
      const leftBound = defaultIncrementor.value;

      for (let i = 0; i < 10 ** 3; i++) { defaultIncrementor.increment(); }
      const rightBound = defaultIncrementor.value;

      if (optionsType === 'bound') {
        expect(leftBound).to.equal(min);
        expect(rightBound).to.equal(max);
      } else if (optionsType === 'indexed') {
        expect(leftBound).to.equal(values[0]);
        expect(rightBound).to.equal(values[values.length - 1]);
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
        } : { values, initialIndex },
        (...args) => { argHistory.push(args); },
      );

      incrementor.increment();
      incrementor.decrement();

      if (optionsType === 'bound') {
        expect(argHistory).to.deep.equal([[initial + increment], [initial]]);
      } else if (optionsType === 'indexed') {
        expect(argHistory).to.deep.equal([[values[initialIndex + 1]], [values[initialIndex]]]);
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
      })).to.throw();
      expect(() => createIncrementor({
        initial, min, max, increment: -1,
      })).to.throw();
    });

    it('should throw error if initial value is outside bounds', () => {
      expect(() => createIncrementor({
        initial: 10000, min, max, increment,
      })).to.throw();
      expect(() => createIncrementor({
        initial: -10000, min, max, increment,
      })).to.throw();
      expect(() => createIncrementor({
        initial: min, min, max, increment,
      })).to.not.throw();
      expect(() => createIncrementor({
        initial: max, min, max, increment,
      })).to.not.throw();
    });
    xit('should throw error if min is greater than max', () => {});
    incrementorTests();
    xit('should set initial value to one if omitted and one is within bounds');
    xit('should set initial to min if omitted and bounds are all positive values');
    xit('should set initial to max if omitted and bounds are all negative values');
    xit('should set min to -Infinity if omitted');
    xit('should set max to Infinity if omitted');
    xit('should throw error if initial and min are both omitted');
  });

  describe('using indexed incrementor options', () => {
    beforeEach(() => {
      [values, initialIndex] = [[1, 10, 100, 1000, 10000], 2];
      defaultIncrementor = createIncrementor({ values, initialIndex });
      optionsType = 'indexed';
    });
    xit('should throw error if values array is empty', () => {});
    xit('should throw error if initial index is outside of values array bounds', () => {});
    incrementorTests();
    xit('should set initial index to 0 if omitted');
  });
});
