import { expect } from 'chai';
import createIncrementor from '../../src/web/src/lib/incrementor.js';

/** @typedef {import('../../src/web/src/lib/incrementor.js').Incrementor} Incrementor */

describe('createIncrementor', () => {
  const [initial, min, max, increment] = [3, 1, 5, 1];
  /** @type {Incrementor} */ let defaultIncrementor;

  beforeEach(() => {
    defaultIncrementor = createIncrementor(initial, min, max, increment);
  });

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
    expect(() => { defaultIncrementor.value = initial; }).to.throw();
  });

  it('should increment and decrement value', () => {
    const higher = defaultIncrementor.value;
    defaultIncrementor.decrement();
    const lower = defaultIncrementor.value;

    expect(higher - lower).to.equal(1);
  });

  it('should not increment or decrement outside of bounds', () => {
    for (let i = 0; i < 10 ** 3; i++) { defaultIncrementor.decrement(); }
    expect(defaultIncrementor.value).to.equal(min);

    for (let i = 0; i < 10 ** 3; i++) { defaultIncrementor.increment(); }
    expect(defaultIncrementor.value).to.equal(max);
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
    const incrementor = createIncrementor(initial, min, max, increment, (...args) => { argHistory.push(args); });

    incrementor.increment();
    incrementor.decrement();

    expect(argHistory).to.deep.equal([[initial + 1], [initial]]);
  });

  it('should allow chaining increment/decrement functions together', () => {
    expect(defaultIncrementor.decrement().decrement().decrement().value).to.equal(min);
    expect(defaultIncrementor.increment().increment().increment().value).to.equal(min + 3);
  });
});
