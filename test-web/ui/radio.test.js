import { expect } from 'chai';
import createRadioUI from '../../src/web/src/ui/radio.js';
import makeMockSketch from '../support/mockSketch.js';
import { UI } from '../../src/web/src/constants.js';

/** @typedef {import('../../src/web/src/ui/radio.js').RadioUI} RadioUI */
/** @typedef {import('../../src/web/src/ui/radio.js').LabelValuePair} LabelValuePair */
/** @typedef {import('../support/mockSketch.js').MockRadio} MockRadio */
/** @typedef {import('../support/mockSketch.js').MockRadioOption} MockRadioOption */

const { ROW_HEIGHT, TEXT_SIZE } = UI;

describe('createRadioUI', () => {
  /** @type {RadioUI} */ let defaultRadioUI;

  /** @type {MockRadio} */ let mockRadio;
  /** @type {MockRadioOption} */ let mockRadioOptionLeft;
  /** @type {MockRadioOption} */ let mockRadioOptionMiddle;
  /** @type {MockRadioOption} */ let mockRadioOptionRight;

  /** @type {Object<string,LabelValuePair>} */ const OPTION = {
    LEFT: ['left label', 'left value'],
    MIDDLE: ['middle label', 'middle value'],
    RIGHT: ['right label', 'right value'],
  };
  const SELECTION = OPTION.MIDDLE[1];
  let callbackArgs;
  const [X, Y, CALLBACK] = [1, 2, (...args) => { callbackArgs.push(args); }];

  const mockSketch = makeMockSketch({ radioLimit: 1, radioOptionLimit: 3 });

  beforeEach(() => {
    defaultRadioUI = createRadioUI(mockSketch.reset(), [
      OPTION.LEFT, OPTION.MIDDLE, OPTION.RIGHT,
    ], SELECTION, X, Y, CALLBACK);
    [mockRadio] = mockSketch.radios;
    [mockRadioOptionLeft, mockRadioOptionMiddle, mockRadioOptionRight] = mockRadio.options;
    callbackArgs = [];
  });

  it('should create radio ui', () => {
    expect(mockRadio.savedArgs).to.deep.equal({
      creation: ['radioGroup0'],
      position: [X, Y],
      style: ['fontSize', `${TEXT_SIZE}px`],
    });
  });

  it('should create independent radio button groups', () => {
    const multipleRadioMockSketch = makeMockSketch({ radioLimit: 2 });
    createRadioUI(multipleRadioMockSketch, [], '', X, Y, CALLBACK);
    createRadioUI(multipleRadioMockSketch, [], '', X, Y, CALLBACK);

    const radioGroups = multipleRadioMockSketch.radios.map(({ savedArgs: args }) => args.creation[0]);

    expect(new Set(radioGroups)).to.have.lengthOf(2);
  });

  it('should create options with label value pairs', () => {
    const style = {
      fontSize: null,
      height: `${ROW_HEIGHT}px`,
      width: `${ROW_HEIGHT}px`,
    };
    expect(mockRadioOptionLeft).to.include({ label: OPTION.LEFT[0], value: OPTION.LEFT[1] });
    expect(mockRadioOptionLeft.style).to.deep.equal(style);
    expect(mockRadioOptionMiddle).to.include({ label: OPTION.MIDDLE[0], value: OPTION.MIDDLE[1] });
    expect(mockRadioOptionMiddle.style).to.deep.equal(style);
    expect(mockRadioOptionRight).to.include({ label: OPTION.RIGHT[0], value: OPTION.RIGHT[1] });
    expect(mockRadioOptionRight.style).to.deep.equal(style);
  });

  it('should return an object wth a selected getter', () => {
    expect(defaultRadioUI).to.have.property('selected').that.is.a('string');
  });

  it('should not enable setting selection directly once created', () => {
    expect(() => defaultRadioUI.selected = 'new selection').to.throw();
  });

  it('should return initial selection', () => {
    expect(defaultRadioUI.selected).to.equal(SELECTION);
  });

  it('should change returned value when new selection is made', () => {
    mockRadioOptionLeft.press();
    expect(defaultRadioUI.selected).to.equal(OPTION.LEFT[1]);

    mockRadioOptionMiddle.press();
    expect(defaultRadioUI.selected).to.equal(OPTION.MIDDLE[1]);

    mockRadioOptionRight.press();
    expect(defaultRadioUI.selected).to.equal(OPTION.RIGHT[1]);
  });

  it('should call callback with newly selected option', () => {
    mockRadioOptionLeft.press();
    mockRadioOptionMiddle.press();
    mockRadioOptionRight.press();

    expect(callbackArgs).to.deep.equal([[OPTION.LEFT[1]], [OPTION.MIDDLE[1]], [OPTION.RIGHT[1]]]);
  });
});
