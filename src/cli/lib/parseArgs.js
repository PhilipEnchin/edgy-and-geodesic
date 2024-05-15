#!/usr/bin/env node

import { parseArgs } from 'node:util';
import {
  FREQUENCY_POSITIVE_INT, HELP_TEXT, MAX_ONE_SIZE_ARG, SIZE_ARG_POSITIVE_NUM, SIZE_ARG_REQUIRED,
} from './constants.js';

/** @type {'string'} */ const STRING = 'string';
/** @type {'boolean'} */ const BOOLEAN = 'boolean';

/**
 * @typedef {object} ParsedArgs
 * @property {number} frequency
 * @property {'radius'|'minLength'|'maxLength'} sizeKey
 * @property {number} sizeValue
 * @property {boolean} fullOutput
*/

const PARSE_CONFIG = {
  options: {
    frequency: {
      type: STRING,
      short: 'f',
      default: '1',
    },
    radius: {
      type: STRING,
      short: 'r',
    },
    minLength: {
      type: STRING,
      short: 'm',
    },
    maxLength: {
      type: STRING,
      short: 'M',
    },
    fullOutput: {
      type: BOOLEAN,
      short: 'F',
    },
    help: {
      type: BOOLEAN,
      short: 'h',
    },
  },
  strict: true,
};

/**
 * Print help, with an optional preamble first
 * @param {string} [preamble]
 */
const printHelp = (preamble = '') => {
  if (preamble) console.error(preamble);
  console.log(HELP_TEXT);
};

class ArgParseError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ArgParseError'; // Set the name of the custom error class
  }
}

/**
 * @param {string[]} [args]
 * @returns {ParsedArgs|false}
 */
const argParser = (args = process.argv.slice(2)) => {
  try {
    const { values } = parseArgs({ args, ...PARSE_CONFIG });
    if (values.help) {
      printHelp();
      return false;
    }

    const frequency = Number(values.frequency);
    if (Number.isNaN(frequency) || !Number.isInteger(frequency) || frequency <= 0) throw new ArgParseError(FREQUENCY_POSITIVE_INT);

    const sizeArgCount = ['radius', 'minLength', 'maxLength'].reduce((acc, arg) => acc + (arg in values ? 1 : 0), 0);
    if (sizeArgCount === 0) throw new ArgParseError(SIZE_ARG_REQUIRED);
    if (sizeArgCount > 1) throw new ArgParseError(MAX_ONE_SIZE_ARG);

    const sizeArgName = 'radius' in values ? 'radius' : ('minLength' in values ? 'minLength' : 'maxLength');
    const sizeArg = Number(values[sizeArgName]);
    if (Number.isNaN(sizeArg) || sizeArg <= 0) throw new ArgParseError(SIZE_ARG_POSITIVE_NUM[sizeArgName]);

    return {
      frequency,
      sizeKey: sizeArgName,
      sizeValue: sizeArg,
      fullOutput: !!values.fullOutput,
    };
  } catch (error) {
    process.exitCode = 2;
    printHelp(error.message);
  }
  return false;
};

export default argParser;
