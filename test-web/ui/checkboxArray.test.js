import { expect } from 'chai';
import createCheckboxArrayUI from '../../src/web/src/ui/checkboxArray.js';
import makeMockSketch from '../support/mockSketch.js';
import { UI } from '../../src/web/src/constants.js';

/** @typedef {import('../../src/web/src/ui/checkboxArray.js').CheckboxArrayUI} CheckboxArrayUI */
/** @typedef {import('../support/mockSketch.js').MockDiv} MockDiv */
/** @typedef {import('../support/mockSketch.js').MockCheckbox} MockCheckbox */

const { ROW_HEIGHT, TEXT_SIZE } = UI;

describe('createCheckboxArrayUI', () => {
  /** @type {CheckboxArrayUI} */ let defaultCheckboxArrayUI;

  /** @type {MockDiv} */ let mockDiv;
  /** @type {MockCheckbox} */ let mockCheckboxLeft;
  /** @type {MockCheckbox} */ let mockCheckboxMiddle;
  /** @type {MockCheckbox} */ let mockCheckboxRight;

  const LABEL = { LEFT: 'left', MIDDLE: 'middle', RIGHT: 'right' };
  const INITIAL = { LEFT: true, MIDDLE: false, RIGHT: true };
  let callbackArgs;
  const [X, Y, CALLBACK] = [1, 2, (...args) => { callbackArgs.push(args); }];

  const mockSketch = makeMockSketch({ divLimit: 1, checkboxLimit: 3 });

  beforeEach(() => {
    defaultCheckboxArrayUI = createCheckboxArrayUI(mockSketch.reset(), {
      [LABEL.LEFT]: INITIAL.LEFT,
      [LABEL.MIDDLE]: INITIAL.MIDDLE,
      [LABEL.RIGHT]: INITIAL.RIGHT,
    }, X, Y, CALLBACK);
    [mockDiv] = mockSketch.divs;
    [mockCheckboxLeft, mockCheckboxMiddle, mockCheckboxRight] = mockSketch.checkboxes;
    callbackArgs = [];
  });

  it('should create checkboxes', () => {
    expect(mockCheckboxLeft.savedArgs).to.deep.equal({
      creation: [` ${LABEL.LEFT} `, INITIAL.LEFT],
      style: ['display', 'inline'],
    });
    expect(mockCheckboxMiddle.savedArgs).to.deep.equal({
      creation: [` ${LABEL.MIDDLE} `, INITIAL.MIDDLE],
      style: ['display', 'inline'],
    });
    expect(mockCheckboxRight.savedArgs).to.deep.equal({
      creation: [` ${LABEL.RIGHT} `, INITIAL.RIGHT],
      style: ['display', 'inline'],
    });
  });

  it('should format checkbox input and labels to appropriate size', () => {
    [mockCheckboxLeft, mockCheckboxMiddle, mockCheckboxRight].forEach((checkbox) => {
      expect(checkbox.input).to.deep.equal({
        style: {
          fontSize: null,
          height: `${ROW_HEIGHT}px`,
          width: `${ROW_HEIGHT}px`,
        },
      });
      expect(checkbox.label).to.deep.equal({
        style: {
          fontSize: `${TEXT_SIZE}px`,
          height: null,
          width: null,
        },
      });
    });
  });

  it('should create div with checkboxes as children', () => {
    expect(mockDiv.savedArgs).to.deep.equal({
      creation: [],
      position: [X, Y],
      style: null,
    });

    expect(mockDiv.children).to.have.lengthOf(3);
    expect(mockDiv.children).to.include(mockCheckboxLeft);
    expect(mockDiv.children).to.include(mockCheckboxMiddle);
    expect(mockDiv.children).to.include(mockCheckboxRight);
  });

  it('should return an object with a values getter', () => {
    expect(defaultCheckboxArrayUI).to.have.property('values').that.deep.equal({
      [LABEL.LEFT]: INITIAL.LEFT,
      [LABEL.MIDDLE]: INITIAL.MIDDLE,
      [LABEL.RIGHT]: INITIAL.RIGHT,
    });
  });

  it('should not enable setting values directly once created', () => {
    expect(() => defaultCheckboxArrayUI.values = {
      [LABEL.LEFT]: true,
      [LABEL.MIDDLE]: true,
      [LABEL.RIGHT]: true,
    }).to.throw();
  });

  it('should return initial values even after modifying returned values object', () => {
    defaultCheckboxArrayUI.values[LABEL.LEFT] = !INITIAL.LEFT;
    defaultCheckboxArrayUI.values[LABEL.MIDDLE] = !INITIAL.MIDDLE;
    defaultCheckboxArrayUI.values[LABEL.RIGHT] = !INITIAL.RIGHT;
    expect(defaultCheckboxArrayUI.values).to.deep.equal({
      [LABEL.LEFT]: INITIAL.LEFT,
      [LABEL.MIDDLE]: INITIAL.MIDDLE,
      [LABEL.RIGHT]: INITIAL.RIGHT,
    });
  });

  it('should change returned values when checkboxes are toggled', () => {
    mockCheckboxLeft.press();
    mockCheckboxMiddle.press();
    mockCheckboxRight.press();
    expect(defaultCheckboxArrayUI.values).to.deep.equal({
      [LABEL.LEFT]: !INITIAL.LEFT,
      [LABEL.MIDDLE]: !INITIAL.MIDDLE,
      [LABEL.RIGHT]: !INITIAL.RIGHT,
    });
  });

  it('should call callback with modified key and value on toggle', () => {
    mockCheckboxLeft.press();
    mockCheckboxMiddle.press();
    mockCheckboxRight.press();
    expect(callbackArgs).to.deep.equal([
      [{ [LABEL.LEFT]: !INITIAL.LEFT }],
      [{ [LABEL.MIDDLE]: !INITIAL.MIDDLE }],
      [{ [LABEL.RIGHT]: !INITIAL.RIGHT }],
    ]);
  });
});
