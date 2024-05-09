const fullDigitsFormatter = new Intl.NumberFormat('en-US', {
  notation: 'standard',
  maximumFractionDigits: 20,
}).format;

/**
 * @param {number} number
 * @returns {string}
 */
export const fullDigits = (number) => fullDigitsFormatter(number).replace(/,/g, '');

/**
 * @param {number} number
 * @param {number} [place=0]
 * @returns {number}
 */
export const round = (number, place = 0) => (place < 0
  ? Math.round(number * 10 ** -place) / 10 ** -place
  : Math.round(number / 10 ** place) * 10 ** place);
