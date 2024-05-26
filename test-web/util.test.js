import { expect } from 'chai';
import { createIncrementor, createIncrementorUI } from '../src/web/src/util.js';
import { INCREMENTOR, UI } from '../src/web/src/constants.js';

/** @typedef {import('../src/web/src/util.js').Incrementor} Incrementor */
/** @typedef {import('../src/web/src/util.js').IncrementorUI} IncrementorUI */

describe('util', () => {
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

  describe('createIncrementorUI', () => {
    const { BUTTON_WIDTH, PADDING_INTRA, TEXT_SIZE } = INCREMENTOR;
    const { ROW_HEIGHT } = UI;
    const [label, initial, min, max, increment, x, y] = ['Mabel\'s labels', 3, 0, 5, 1, 40, 50];
    let callbackArgs;
    const callback = (...args) => { callbackArgs.push(args); };

    let mockMinus; let mockPlus; let mockLabel;

    const mockSketch = {
      createButton: (...creationArgs) => {
        const newMockButton = { isReleased: false, label: '', creationArgs };
        if (!mockMinus) return mockMinus = newMockButton;
        if (!mockPlus) return mockPlus = newMockButton;
        throw new Error('No mock button objects left!');
      },
      textSize: (...args) => {
        mockLabel.textSizeArgs.push(args);
      },
      textAlign: (...args) => {
        mockLabel.textAlignArgs.push(args);
      },
      text: (...args) => {
        mockLabel.textArgs.push(args);
      },
      CENTER: 'feeling centred',
      LEFT: 'radically left',
    };
    let defaultIncrementorUI;

    beforeEach(() => {
      mockMinus = mockPlus = null;
      mockLabel = {
        textSizeArgs: [],
        textAlignArgs: [],
        textArgs: [],
      };
      defaultIncrementorUI = createIncrementorUI(mockSketch, label, initial, min, max, increment, x, y, callback);
      callbackArgs = [];
    });

    it('should create a minus button', () => {
      expect(mockMinus.creationArgs).to.deep.equal(['-', x, y, BUTTON_WIDTH, ROW_HEIGHT]);
    });

    it('should create a plus button', () => {
      expect(mockPlus.creationArgs).to.deep.equal(['+', x + BUTTON_WIDTH, y, BUTTON_WIDTH, ROW_HEIGHT]);
    });

    it('should return an object with a draw function', () => {
      expect(defaultIncrementorUI).to.have.property('draw').that.is.a('function');
    });

    it('should return an object with a value getter', () => {
      expect(defaultIncrementorUI).to.have.property('value').that.is.a('number');
    });

    it('should not enable setting value directly once created', () => {
      expect(() => { defaultIncrementorUI.value = 0; }).to.throw();
    });

    it('should increment and decrement value when buttons are released', () => {
      const before = defaultIncrementorUI.value;
      mockMinus.isReleased = true;
      defaultIncrementorUI.draw();
      mockMinus.isReleased = false;
      const lower = defaultIncrementorUI.value;
      mockPlus.isReleased = true;
      defaultIncrementorUI.draw();
      defaultIncrementorUI.draw();
      const higher = defaultIncrementorUI.value;

      expect(before).to.equal(initial);
      expect(lower).to.equal(initial - 1);
      expect(higher).to.equal(initial + 1);
    });

    it('should create a text label on draw with current value', () => {
      defaultIncrementorUI.draw();
      mockPlus.isReleased = true;
      defaultIncrementorUI.draw();
      expect(mockLabel).to.deep.equal({
        textSizeArgs: Array(2).fill([TEXT_SIZE]),
        textAlignArgs: Array(2).fill([mockSketch.LEFT, mockSketch.CENTER]),
        textArgs: [...Array(2)].map((_, i) => [`${label}: ${initial + i}`, x + 2 * BUTTON_WIDTH + PADDING_INTRA, y + ROW_HEIGHT / 2]),
      });
    });

    it('should call callback with new value on increment/decrement', () => {
      defaultIncrementorUI.draw();
      mockPlus.isReleased = true;
      defaultIncrementorUI.draw(); // Callback after increment
      mockPlus.isReleased = false;
      defaultIncrementorUI.draw();
      mockMinus.isReleased = true;
      defaultIncrementorUI.draw(); // Callback after decrement
      defaultIncrementorUI.draw(); // Callback after decrement

      expect(callbackArgs).to.deep.equal([[initial + 1], [initial], [initial - 1]]);
    });

    it('should not increment or decrement outside of bounds', () => {
      mockMinus.isReleased = true;
      for (let i = 0; i < 10 ** 3; i++) { defaultIncrementorUI.draw(); }
      const low = defaultIncrementorUI.value;

      mockMinus.isReleased = false;
      mockPlus.isReleased = true;
      for (let i = 0; i < 10 ** 3; i++) { defaultIncrementorUI.draw(); }
      const high = defaultIncrementorUI.value;

      expect(low).to.equal(min);
      expect(high).to.equal(max);
    });

    it('should show +/- labels only when increment/decrement is possible', () => {
      defaultIncrementorUI.draw();
      const [midMinusLabel, midPlusLabel] = [mockMinus, mockPlus].map((b) => b.label);

      mockMinus.isReleased = true;
      for (let i = 0; i < 10 ** 3; i++) { defaultIncrementorUI.draw(); }
      const [lowMinusLabel, lowPlusLabel] = [mockMinus, mockPlus].map((b) => b.label);

      mockMinus.isReleased = false;
      mockPlus.isReleased = true;
      for (let i = 0; i < 10 ** 3; i++) { defaultIncrementorUI.draw(); }
      const [highMinusLabel, highPlusLabel] = [mockMinus, mockPlus].map((b) => b.label);

      expect(midMinusLabel).to.equal('-');
      expect(midPlusLabel).to.equal('+');

      expect(lowMinusLabel).to.equal('');
      expect(lowPlusLabel).to.equal('+');

      expect(highMinusLabel).to.equal('-');
      expect(highPlusLabel).to.equal('');
    });
  });
});
