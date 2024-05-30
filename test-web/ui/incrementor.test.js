import { expect } from 'chai';
import createIncrementorUI from '../../src/web/src/ui/incrementor.js';
import { INCREMENTOR, UI } from '../../src/web/src/constants.js';

/** @typedef {import('../../src/web/src/ui/incrementor.js').IncrementorUI} IncrementorUI */

describe('createIncrementorUI', () => {
  const { BUTTON_WIDTH, PADDING_INTRA } = INCREMENTOR;
  const { ROW_HEIGHT, TEXT_SIZE } = UI;
  const [label, initial, min, max, increment, x, y] = ['Mabel\'s labels', 3, 0, 5, 1, 40, 50];
  let callbackArgs;
  const callback = (...args) => { callbackArgs.push(args); };

  let mockMinus; let mockPlus; let mockLabelDiv; let mockKeySpan; let mockValueSpan;

  const mockSketch = {
    createButton(...creation) {
      const newMockButton = {
        visible: null,
        position(...args) { this.savedArgs.position = args; return this; },
        size(...args) { this.savedArgs.size = args; return this; },
        show() { this.visible = true; return this; },
        hide() { this.visible = false; return this; },
        mousePressed(f) { this.press = f; return this; },
        press: null,
        savedArgs: {
          creation,
          position: null,
          size: null,
        },
      };
      if (!mockMinus) return mockMinus = newMockButton;
      if (!mockPlus) return mockPlus = newMockButton;
      throw new Error('Extra mock button created');
    },
    createDiv(...creation) {
      const newMockDiv = {
        position(...args) { this.savedArgs.position = args; return this; },
        style(...args) { this.savedArgs.style = args; return this; },
        children: [],
        savedArgs: {
          creation,
          position: null,
          style: null,
        },
      };
      if (!mockLabelDiv) return mockLabelDiv = newMockDiv;
      throw new Error('Extra mock div created');
    },
    createSpan(...creation) {
      const newMockSpan = {
        parent(parent) { parent.children.push(this); return this; },
        html(...args) { this.savedArgs.html.push(args); return this; },
        savedArgs: {
          creation,
          html: [],
        },
      };
      if (!mockKeySpan) return mockKeySpan = newMockSpan;
      if (!mockValueSpan) return mockValueSpan = newMockSpan;
      throw new Error('Extra mock span created');
    },
  };
  /** @type {IncrementorUI} */ let defaultIncrementorUI;

  beforeEach(() => {
    mockMinus = mockPlus = mockLabelDiv = mockKeySpan = mockValueSpan = null;
    defaultIncrementorUI = createIncrementorUI(mockSketch, label, initial, min, max, increment, x, y, callback);
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
    expect(mockValueSpan.savedArgs).to.deep.equal({
      creation: [],
      html: [[3]],
    });
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

  it('should increment and decrement value when buttons are released', () => {
    const before = defaultIncrementorUI.value;
    mockMinus.press();
    const lower = defaultIncrementorUI.value;
    mockPlus.press();
    mockPlus.press();
    const higher = defaultIncrementorUI.value;

    expect(before).to.equal(initial);
    expect(lower).to.equal(initial - 1);
    expect(higher).to.equal(initial + 1);
  });

  it('should create a text label on draw with current value', () => {
    mockMinus.press();
    mockPlus.press();
    mockPlus.press();

    expect(mockValueSpan.savedArgs.html).to.deep.equal([[initial], [initial - 1], [initial], [initial + 1]]);
  });

  it('should call callback with new value on increment/decrement', () => {
    mockPlus.press();
    mockMinus.press();
    mockMinus.press();

    expect(callbackArgs).to.deep.equal([[initial + 1], [initial], [initial - 1]]);
  });

  it('should not increment or decrement outside of bounds', () => {
    for (let i = 0; i < 10 ** 3; i++) { mockMinus.press(); }
    const low = defaultIncrementorUI.value;

    for (let i = 0; i < 10 ** 3; i++) { mockPlus.press(); }
    const high = defaultIncrementorUI.value;

    expect(low).to.equal(min);
    expect(high).to.equal(max);
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
