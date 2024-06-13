import { expect } from 'chai';
import createIncrementorUI from '../../src/web/src/ui/incrementor.js';
import { INCREMENTOR, UI } from '../../src/web/src/constants.js';
import makeMockSketch from '../support/mockSketch.js';
import throwMissingTest from '../support/errors/missingTest.js';

/** @typedef {import('../../src/web/src/ui/incrementor.js').IncrementorUI} IncrementorUI */
/** @typedef {import('../support/mockSketch.js').MockSketch} MockSketch */
/** @typedef {import('../support/mockSketch.js').MockButton} MockButton */
/** @typedef {import('../support/mockSketch.js').MockDiv} MockDiv */
/** @typedef {import('../support/mockSketch.js').MockSpan} MockSpan */

describe('createIncrementorUI', () => {
  /** @type {IncrementorUI} */ let defaultIncrementorUI;

  const { BUTTON_WIDTH, PADDING_INTRA } = INCREMENTOR;
  const { ROW_HEIGHT, TEXT_SIZE } = UI;
  const [label, initial, min, max, increment, values, initialIndex, x, y] = ['Mabel\'s labels', 6, 0, 10, 2, [1, 10, 100, 1000, 10000], 2, 40, 50];
  let callbackArgs;
  const callback = (...args) => { callbackArgs.push(args); };

  /** @type {MockButton} */ let mockMinus;
  /** @type {MockButton} */ let mockPlus;
  /** @type {MockDiv} */ let mockLabelDiv;
  /** @type {MockSpan} */ let mockKeySpan;
  /** @type {MockSpan} */ let mockValueSpan;

  const mockSketch = makeMockSketch({ buttonLimit: 2, divLimit: 1, spanLimit: 2 });

  /** @type {('bound'|'indexed')[]} */ const optionsTypes = ['bound', 'indexed'];

  optionsTypes.forEach((optionsType) => {
    describe(`using ${optionsType} incrementor options`, () => {
      beforeEach(() => {
        if (optionsType === 'bound') {
          defaultIncrementorUI = createIncrementorUI(mockSketch.reset(), label, {
            initial, min, max, increment,
          }, x, y, callback);
        } else if (optionsType === 'indexed') {
          defaultIncrementorUI = createIncrementorUI(mockSketch.reset(), label, { values, initialIndex }, x, y, callback);
        } else throwMissingTest();

        [mockMinus, mockPlus] = mockSketch.buttons;

        [mockLabelDiv] = mockSketch.divs;
        [mockKeySpan, mockValueSpan] = mockSketch.spans;
        callbackArgs = [];
      });

      it('should create a minus button', () => {
        expect(mockMinus.savedArgs).to.deep.equal({
          creation: ['-'],
          position: [x, y],
          size: [BUTTON_WIDTH, ROW_HEIGHT],
        });
      });

      it('should create a plus button', () => {
        expect(mockPlus.savedArgs).to.deep.equal({
          creation: ['+'],
          position: [x + BUTTON_WIDTH, y],
          size: [BUTTON_WIDTH, ROW_HEIGHT],
        });
      });

      it('should create a key span', () => {
        expect(mockKeySpan.savedArgs).to.deep.equal({
          creation: [`${label}: `],
          html: [],
        });
      });

      it('should create a value span', () => {
        if (optionsType === 'bound') {
          expect(mockValueSpan.savedArgs).to.deep.equal({ creation: [], html: [[initial]] });
        } else if (optionsType === 'indexed') {
          expect(mockValueSpan.savedArgs).to.deep.equal({ creation: [], html: [[values[initialIndex]]] });
        } else throwMissingTest();
      });

      it('should create label div with key and value spans as children', () => {
        expect(mockLabelDiv.savedArgs).to.deep.equal({
          creation: [],
          position: [x + 2 * BUTTON_WIDTH + PADDING_INTRA, y],
          style: ['font-size', `${TEXT_SIZE}px`],
        });
        expect(mockLabelDiv.children).to.deep.equal([mockKeySpan, mockValueSpan]);
      });

      it('should return an object with a value getter', () => {
        expect(defaultIncrementorUI).to.have.property('value').that.is.a('number');
      });

      it('should not enable setting value directly once created', () => {
        expect(() => { defaultIncrementorUI.value = 0; }).to.throw();
      });

      it('should increment and decrement value when buttons are pressed', () => {
        const before = defaultIncrementorUI.value;
        mockMinus.press();
        const lower = defaultIncrementorUI.value;
        mockPlus.press();
        mockPlus.press();
        const higher = defaultIncrementorUI.value;

        if (optionsType === 'bound') {
          expect(before).to.equal(initial);
          expect(lower).to.equal(initial - increment);
          expect(higher).to.equal(initial + increment);
        } else if (optionsType === 'indexed') {
          expect(before).to.equal(values[initialIndex]);
          expect(lower).to.equal(values[initialIndex - 1]);
          expect(higher).to.equal(values[initialIndex + 1]);
        } else throwMissingTest();
      });

      it('should update text label on press with current value', () => {
        mockMinus.press();
        mockPlus.press();
        mockPlus.press();

        if (optionsType === 'bound') {
          expect(mockValueSpan.savedArgs.html).to.deep.equal([
            [initial],
            [initial - increment],
            [initial],
            [initial + increment],
          ]);
        } else if (optionsType === 'indexed') {
          expect(mockValueSpan.savedArgs.html).to.deep.equal([
            [values[initialIndex]],
            [values[initialIndex - 1]],
            [values[initialIndex]],
            [values[initialIndex + 1]],
          ]);
        } else throwMissingTest();
      });

      it('should call callback with new value on increment/decrement', () => {
        mockPlus.press();
        mockMinus.press();
        mockMinus.press();
        if (optionsType === 'bound') {
          expect(callbackArgs).to.deep.equal([
            [initial + increment],
            [initial],
            [initial - increment],
          ]);
        } else if (optionsType === 'indexed') {
          expect(callbackArgs).to.deep.equal([
            [values[initialIndex + 1]],
            [values[initialIndex]],
            [values[initialIndex - 1]],
          ]);
        } else throwMissingTest();
      });

      it('should not increment or decrement outside of bounds', () => {
        for (let i = 0; i < 10 ** 3; i++) { mockMinus.press(); }
        const low = defaultIncrementorUI.value;

        for (let i = 0; i < 10 ** 3; i++) { mockPlus.press(); }
        const high = defaultIncrementorUI.value;
        if (optionsType === 'bound') {
          expect(low).to.equal(min);
          expect(high).to.equal(max);
        } else if (optionsType === 'indexed') {
          expect(low).to.equal(values[0]);
          expect(high).to.equal(values[values.length - 1]);
        } else throwMissingTest();
      });

      it('should show +/- buttons only when increment/decrement is possible', () => {
        const [midMinusVisibility, midPlusVisibility] = [mockMinus, mockPlus].map((b) => b.visible);

        for (let i = 0; i < 10 ** 3; i++) { mockMinus.press(); }
        const [lowMinusVisibility, lowPlusVisibility] = [mockMinus, mockPlus].map((b) => b.visible);

        for (let i = 0; i < 10 ** 3; i++) { mockPlus.press(); }
        const [highMinusVisibility, highPlusVisibility] = [mockMinus, mockPlus].map((b) => b.visible);

        expect(midMinusVisibility).to.equal(true);
        expect(midPlusVisibility).to.equal(true);

        expect(lowMinusVisibility).to.equal(false);
        expect(lowPlusVisibility).to.equal(true);

        expect(highMinusVisibility).to.equal(true);
        expect(highPlusVisibility).to.equal(false);
      });
    });
  });
});
