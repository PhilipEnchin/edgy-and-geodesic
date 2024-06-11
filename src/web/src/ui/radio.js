import { UI } from '../constants.js';

/** @typedef {import('../../../lib/polyhedra/index.js').PolyhedronId} PolyhedronId */

/** @typedef {[string,string]} LabelValuePair */
/** @typedef {(selected:string) => void} RadioCallback */

/**
 * @typedef {object} RadioUI
 * @property {string} selected
 */

const { ROW_HEIGHT, TEXT_SIZE } = UI;

/**
 * @param {*} sketch
 * @param {LabelValuePair[]} labelValuePairs
 * @param {string} selection selected value (second in labelValuePair)
 * @param {number} x
 * @param {number} y
 * @param {RadioCallback} callback
 * @returns {RadioUI}
 */
const createRadioUI = (sketch, labelValuePairs, selection, x, y, callback) => {
  const radio = sketch.createRadio()
    .position(x, y)
    .style('fontSize', `${TEXT_SIZE}px`);

  labelValuePairs.forEach(([label, value]) => {
    const option = radio.option(value, label);
    option.style.height = option.style.width = `${ROW_HEIGHT}px`;
  });

  radio.selected(selection);

  radio.mouseClicked(() => { callback(radio.value()); });

  return {
    get selected() { return radio.value(); },
  };
};

export default createRadioUI;
