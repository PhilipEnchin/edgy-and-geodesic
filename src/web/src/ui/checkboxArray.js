/**
 * @typedef {object} CheckboxArrayUI
 * @property {CheckboxArray} values
 */

import { UI } from '../constants.js';

/** @typedef {Object<string,boolean>} CheckboxArray */

/**
 * @param {*} sketch
 * @param {CheckboxArray} checkboxes
 * @param {number} x
 * @param {number} y
 * @param {function} callback
 * @returns {CheckboxArrayUI}
 */
const createCheckboxArrayUI = (sketch, checkboxes, x, y, callback) => {
  const { ROW_HEIGHT, TEXT_SIZE } = UI;
  const div = sketch.createDiv()
    .position(x, y);

  const checkboxLookup = {};
  Object.entries(checkboxes).forEach(([label, initial]) => {
    const checkbox = sketch.createCheckbox(` ${label} `, initial)
      .parent(div)
      .style('display', 'inline');
    const input = checkbox.elt.querySelector('input');
    input.style.width = input.style.height = `${ROW_HEIGHT}px`;
    checkbox.elt.querySelector('label').style.fontSize = `${TEXT_SIZE}px`;

    checkbox.changed(() => callback({ [label]: checkbox.checked() }));

    checkboxLookup[label] = checkbox;
  });

  return {
    get values() {
      /** @type {CheckboxArray} */ const checkboxValues = {};
      Object.entries(checkboxLookup).forEach(([label, checkbox]) => {
        checkboxValues[label] = checkbox.checked();
      });
      return checkboxValues;
    },
  };
};

export default createCheckboxArrayUI;
