/** @typedef {'A'|'B'|'C'|'D'|'E'|'F'|'G'|'H'|'I'|'J'|'K'|'L'|'M'|'N'|'O'|'P'|'Q'|'R'|'S'|'T'|'U'|'V'|'W'|'X'|'Y'|'Z'} UppercaseLetter */

/** @type {UppercaseLetter[]} */ const UPPERCASE_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

/**
 * @param {number} n
 * @returns {UppercaseLetter}
 */
const intToLetter = (n) => {
  const letter = UPPERCASE_LETTERS[n];
  if (!letter) throw new RangeError(`Invalid integer (${n}) for letter conversion`);
  return letter;
};

export default intToLetter;
