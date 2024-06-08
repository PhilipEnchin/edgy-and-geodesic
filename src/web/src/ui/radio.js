/** @typedef {import('../../../lib/polyhedra/index.js').PolyhedronId} PolyhedronId */

/** @typedef {[string,string]} LabelValuePair */
/** @typedef {(selected:string) => void} RadioCallback */

/**
 * @typedef {object} RadioUI
 * @property {string} selected
 */

/**
 * @param {*} sketch
 * @param {LabelValuePair[]} labelValuePairs
 * @param {string} selection
 * @param {number} x
 * @param {number} y
 * @param {RadioCallback} callback
 * @returns {RadioUI}
 */
const createRadioUI = (sketch, labelValuePairs, selection, x, y, callback) => {
  const radio = sketch.createRadio()
    .position(x, y);

  labelValuePairs.forEach(([label, value]) => {
    radio.option(value, label);
  });

  radio.selected(selection);

  radio.mouseClicked(() => { callback(radio.selected()); });

  return {
    get selected() { return radio.value(); },
  };
};

export default createRadioUI;
