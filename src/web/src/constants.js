/** @typedef {import('../../lib/polyhedra/index.js').PolyhedronId} PolyhedronId */
/** @typedef {import('./lib/p5Model.js').ColorOptionId} ColorOptionId */

const UI_ROW_HEIGHT = 30;
const UI_TEXT_SCALE = 0.9;

export const RENDER = {
  BACKGROUND_COLOR: '#222',
  FLAT_EDGE_COLOR: '#CCF',
  FLAT_VERTEX_COLOR: '#AAF',
  ROUND_EDGE_COLOR: '#CFC',
  ROUND_VERTEX_COLOR: '#AFA',
  VERTEX_SPHERE_DETAIL: 5,
};
export const INCREMENTOR = { BUTTON_WIDTH: UI_ROW_HEIGHT, PADDING_INTRA: 5 };
export const UI = {
  MARGIN_LEFT: 10,
  MARGIN_TOP: 10,
  PADDING_INTER: 5,
  ROW_HEIGHT: UI_ROW_HEIGHT,
  TEXT_SIZE: UI_ROW_HEIGHT * UI_TEXT_SCALE,
};
export const USER_PARAMETERS = {
  FREQUENCY: {
    INITIAL: 1, MIN: 1, MAX: 10, INCREMENT: 1,
  },
  BASE_POLYHEDRON: {
    /** @type {[string,PolyhedronId][]} */ get OPTIONS() {
      return [
        ['20-gon', 'icosahedron'],
        ['8-gon', 'octahedron'],
        ['4-gon', 'tetrahedron'],
      ];
    },
    /** @type {PolyhedronId} */ INITIAL: 'icosahedron',
  },
  SPHERIFIED: {
    get INITIAL() { return { Flat: true, Spherified: false }; },
  },
  COLOR: {
    /** @type {[string,ColorOptionId][]} */ get OPTIONS() {
      return [
        ['single', 'single'],
        ['spectrum', 'spectrum'],
        ['highlight', 'highlight'],
      ];
    },
    /** @type {ColorOptionId} */ INITIAL: 'single',
  },
};
export const POLYHEDRON = { RELATIVE_RADIUS: 0.4, RELATIVE_VERTEX_RADIUS: 0.03, RELATIVE_EDGE_RADIUS: 0.02 };

export const ERROR = {
  INCREMENTOR_MIN_MAX_FLIPPED: 'Incrementor min must be less than or equal to max',
  INCREMENTOR_INITIAL_OUT_OF_BOUNDS: 'Initial value must be within bounds',
  INCREMENTOR_INCREMENT_NOT_POSITIVE: 'Increment value must be a positive number',
  INCREMENTOR_VALUES_EMPTY: 'Incrementor values array must not be empty',
  INCREMENTOR_INDEX_OUT_OF_RANGE: 'Incrementor index must be withing values array range',
};
