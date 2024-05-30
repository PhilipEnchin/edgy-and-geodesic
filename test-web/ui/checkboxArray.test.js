import { expect } from 'chai';
import createCheckboxArrayUI from '../../src/web/src/ui/checkboxArray.js';

/** @typedef {import('../../src/web/src/ui/checkboxArray.js').CheckboxArrayUI} CheckboxArrayUI */

describe('createCheckboxArrayUI', () => {
  /** @type {CheckboxArrayUI} */ let defaultCheckboxArrayUI;

  let mockDiv; let mockCheckboxLeft; let mockCheckboxMiddle; let mockCheckboxRight;
  const LABEL = { LEFT: 'left', MIDDLE: 'middle', RIGHT: 'right' };
  const INITIAL = { LEFT: true, MIDDLE: false, RIGHT: true };
  let callbackArgs;
  const [X, Y, CALLBACK] = [1, 2, (...args) => { callbackArgs.push(args); }];

  const mockSketch = {
    createDiv(...creation) {
      const newMockDiv = {
        position(...args) { this.savedArgs.position = args; return this; },
        children: [],
        savedArgs: {
          creation,
          position: null,
        },
      };
      if (!mockDiv) return mockDiv = newMockDiv;
      throw new Error('Extra mock div created');
    },
    createCheckbox(...creation) {
      const mockCheckbox = {
        callback: () => {},
        parent(parent) { parent.children.push(this); return this; },
        style(...args) { this.savedArgs.style = args; return this; },
        input: null,
        label: null,
        value: creation[1],
        changed(f) { this.callback = f; return this; },
        checked() { return this.value; },
        press() { this.value = !this.value; this.callback(); },
        get elt() {
          return {
            querySelector: (selector) => {
              const newElement = { style: { width: null, height: null, fontSize: null } };
              if (selector === 'input' && !this.input) return this.input = newElement;
              if (selector === 'label' && !this.label) return this.label = newElement;
              throw new Error('Extra or unknown element queried');
            },
          };
        },
        savedArgs: {
          creation,
          style: null,
        },
      };

      if (!mockCheckboxLeft) return mockCheckboxLeft = mockCheckbox;
      if (!mockCheckboxMiddle) return mockCheckboxMiddle = mockCheckbox;
      if (!mockCheckboxRight) return mockCheckboxRight = mockCheckbox;
      throw new Error('Extra mock checkbox created');
    },
  };

  beforeEach(() => {
    mockDiv = mockCheckboxLeft = mockCheckboxMiddle = mockCheckboxRight = null;
    defaultCheckboxArrayUI = createCheckboxArrayUI(mockSketch, {
      [LABEL.LEFT]: INITIAL.LEFT,
      [LABEL.MIDDLE]: INITIAL.MIDDLE,
      [LABEL.RIGHT]: INITIAL.RIGHT,
    }, X, Y, CALLBACK);
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

  it('should create div with checkboxes as children', () => {
    expect(mockDiv.savedArgs).to.deep.equal({
      creation: [],
      position: [X, Y],
    });
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
