/**
 * @typedef {object} MockSketch
 * @property {MockButton[]} buttons
 * @property {MockDiv[]} divs
 * @property {MockSpan[]} spans
 * @property {MockCheckbox[]} checkboxes
 * @property {MockRadio[]} radios
 * @property {()=>void} reset Reset element arrays
 * @property {(...creation:*) => MockButton} createButton
 * @property {(...creation:*) => MockDiv} createDiv
 * @property {(...creation:*) => MockSpan} createSpan
 * @property {(...creation:*) => MockCheckbox} createCheckbox
 * @property {(...creation:*) => MockRadio} createRadio
*/

/**
 * @typedef {object} MockButton
 * @property {function} callback
 * @property {?boolean} visible
 * @property {(...args:*) => MockButton} position
 * @property {(...args:*) => MockButton} size
 * @property {() => MockButton} show
 * @property {() => MockButton} hide
 * @property {(f:function) => MockButton} mousePressed
 * @property {() => void} press
 * @property {object} savedArgs
 * @property {*[]} savedArgs.creation
 * @property {*[]?} savedArgs.position
 * @property {*[]?} savedArgs.size
*/

/**
 * @typedef {object} MockDiv
 * @property {(...args:*) => MockDiv} position
 * @property {(...args:*) => MockDiv} style
 * @property {*[]} children
 * @property {object} savedArgs
 * @property {*[]} savedArgs.creation
 * @property {*[]?} savedArgs.position
 * @property {*[]?} savedArgs.style
*/

/**
 * @typedef {object} MockSpan
 * @property {(parent:*) => MockSpan} parent
 * @property {(...args:*) => MockSpan} html
 * @property {object} savedArgs
 * @property {*[]} savedArgs.creation
 * @property {*[][]} savedArgs.html
 */

/**
 * @typedef {object} MockCheckbox
 * @property {function} callback
 * @property {(parent:*) => MockCheckbox} parent
 * @property {(...args:*) => MockCheckbox} style
 * @property {MockElement} input
 * @property {MockElement} label
 * @property {boolean} value
 * @property {(f:function) => MockCheckbox} changed
 * @property {() => boolean} checked
 * @property {() => void} press
 * @property {{querySelector: (selector:string) => MockElement}} elt
 * @property {object} savedArgs
 * @property {*[]} savedArgs.creation
 * @property {*[]?} savedArgs.style

/**
 * @typedef {object} MockElement
 * @property {object} style
 * @property {number?} style.width
 * @property {number?} style.height
 * @property {string?} style.fontSize
 */

/**
 * @typedef {object} MockRadio
 * @property {function} callback
 * @property {(...args:*) => MockRadio} position
 * @property {(...args:*) => MockRadio} style
 * @property {(...args:*) => MockRadioOption} option
 * @property {MockRadioOption[]} options
 * @property {string} selectedValue
 * @property {(selection?:string) => MockRadioOption} selected
 * @property {(f:function) => void} mouseClicked
 * @property {() => string} value
 * @property {object} savedArgs
 * @property {*[]} savedArgs.creation
 * @property {*[]?} savedArgs.position
 * @property {*[]?} savedArgs.style
 */

/**
 * @typedef {object} MockRadioOptionExtras
 * @property {string} value
 * @property {string} label
 * @property {MockRadio} parentRadio
 * @property {() => void} press
 */

/** @typedef {MockElement & MockRadioOptionExtras} MockRadioOption */

/** @returns {MockElement} */
const makeMockElement = () => ({ style: { width: null, height: null, fontSize: null } });

/**
 * @param {string} value
 * @param {string} label
 * @param {MockRadio} parentRadio
 * @returns {MockRadioOption}
 */
const makeMockRadioOption = (value, label, parentRadio) => ({
  ...makeMockElement(),
  value,
  label,
  parentRadio,
  press() {
    parentRadio.selected(this.value);
    parentRadio.callback(this.value);
  },
});

/**
 * @param {object} limits
 * @param {number} [limits.buttonLimit]
 * @param {number} [limits.divLimit]
 * @param {number} [limits.spanLimit]
 * @param {number} [limits.checkboxLimit]
 * @param {number} [limits.radioLimit]
 * @param {number} [limits.radioOptionLimit]
 * @returns {MockSketch}
 */
const makeMockSketch = ({
  buttonLimit = 0,
  divLimit = 0,
  spanLimit = 0,
  checkboxLimit = 0,
  radioLimit = 0,
  radioOptionLimit = 0,
} = {}) => {
  /** @type {MockButton[]} */ const buttons = [];
  /** @type {MockDiv[]} */ const divs = [];
  /** @type {MockSpan[]} */ const spans = [];
  /** @type {MockCheckbox[]} */ const checkboxes = [];
  /** @type {MockRadio[]} */ const radios = [];

  return {
    get buttons() { return [...buttons]; },
    get divs() { return [...divs]; },
    get spans() { return [...spans]; },
    get checkboxes() { return [...checkboxes]; },
    get radios() { return [...radios]; },
    reset() {
      buttons.length = divs.length = spans.length = checkboxes.length = radios.length = 0;
      return this;
    },
    /**
     * @returns {MockButton}
     */
    createButton(...creation) {
      if (buttons.length >= buttonLimit) throw new Error('Extra mock button created');
      /** @type MockButton */ const newMockButton = {
        callback: () => { },
        visible: null,
        position(...args) { this.savedArgs.position = args; return this; },
        size(...args) { this.savedArgs.size = args; return this; },
        show() { this.visible = true; return this; },
        hide() { this.visible = false; return this; },
        mousePressed(f) { this.callback = f; return this; },
        press() { this.callback(); },
        savedArgs: {
          creation,
          position: null,
          size: null,
        },
      };
      buttons.push(newMockButton);
      return newMockButton;
    },
    createDiv(...creation) {
      if (divs.length >= divLimit) throw new Error('Extra mock div created');
      /** @type {MockDiv} */ const newMockDiv = {
        position(...args) { this.savedArgs.position = args; return this; },
        style(...args) { this.savedArgs.style = args; return this; },
        children: [],
        savedArgs: {
          creation,
          position: null,
          style: null,
        },
      };
      divs.push(newMockDiv);
      return newMockDiv;
    },
    createSpan(...creation) {
      if (spans.length >= spanLimit) throw new Error('Extra mock span created');
      /** @type {MockSpan} */ const newMockSpan = {
        parent(parent) { parent.children.push(this); return this; },
        html(...args) { this.savedArgs.html.push(args); return this; },
        savedArgs: {
          creation,
          html: [],
        },
      };
      spans.push(newMockSpan);
      return newMockSpan;
    },
    createCheckbox(...creation) {
      if (checkboxes.length >= checkboxLimit) throw new Error('Extra mock checkbox created');
      /** @type {MockCheckbox} */ const newCheckbox = {
        callback: () => {},
        parent(parent) { parent.children.push(this); return this; },
        style(...args) { this.savedArgs.style = args; return this; },
        input: makeMockElement(),
        label: makeMockElement(),
        value: creation[1],
        changed(f) { this.callback = f; return this; },
        checked() { return this.value; },
        press() { this.value = !this.value; this.callback(); },
        get elt() {
          return {
          /** @type {(selector:string) => MockElement} */
            querySelector: (selector) => {
              switch (selector) {
                case 'input': return this.input;
                case 'label': return this.label;
                default: throw new Error('Unknown element queried');
              }
            },
          };
        },
        savedArgs: {
          creation,
          style: null,
        },
      };
      checkboxes.push(newCheckbox);
      return newCheckbox;
    },
    createRadio(...creation) {
      if (radios.length >= radioLimit) throw new Error('Extra mock radio created');
      /** @type {MockRadio} */ const newRadio = {
        callback: () => {},
        position(...args) { this.savedArgs.position = args; return this; },
        style(...args) { this.savedArgs.style = args; return this; },
        options: [],
        option(value, label) {
          if (this.options.length >= radioOptionLimit) throw new Error('Extra mock radio option created');
          const option = makeMockRadioOption(value, label, this);
          this.options.push(option);
          return option;
        },
        selectedValue: creation[2],
        selected(selection) {
          if (selection !== undefined) this.selectedValue = selection;
          return this.options.find(({ value }) => value === this.selectedValue);
        },
        mouseClicked(f) { this.callback = f; return this; },
        value() { return this.selectedValue; },
        savedArgs: {
          creation,
          position: null,
          style: null,
        },
      };
      radios.push(newRadio);
      return newRadio;
    },
  };
};

export default makeMockSketch;