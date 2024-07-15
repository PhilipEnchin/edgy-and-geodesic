/** @type {'string'} */ const STRING = 'string';
/** @type {'boolean'} */ const BOOLEAN = 'boolean';

export const PARSE_CONFIG = {
  options: {
    icosahedron: {
      type: BOOLEAN,
      short: 'i',
    },
    octahedron: {
      type: BOOLEAN,
      short: 'o',
    },
    tetrahedron: {
      type: BOOLEAN,
      short: 't',
    },
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
    doNotSpherify: {
      type: BOOLEAN,
      short: 'd',
    },
    help: {
      type: BOOLEAN,
      short: 'h',
    },
  },
  strict: true,
};

const COMMAND = 'PLACEHOLDER';

export const HELP_TEXT = [
  `Usage: ${COMMAND} [options]`,
  'Options:',
  '  -i, --icosahedron          Use icosahedron as base polyhedron (default)',
  '  -o, --octahedron          Use octahedron as base polyhedron',
  '  -t, --tetrahedron          Use tetrahedron as base polyhedron',
  '  -f, --frequency <value>    Frequency of triangular subdivisions (default: 1)',
  '  -r, --radius <value>       Center-to-vertex radius of final sphere',
  '  -m, --minLength <value>    Minimum vertex to vertex length of final polyhedron',
  '  -M, --maxLength <value>    Maximum vertex to vertex length of final polyhedron',
  '  -F, --fullOutput           Display every edge (default: display only summary)',
  '  -h, --help                 Display this!',
].join('\n');

export const MAX_ONE_POLYHEDRON_ARG = 'A maximum of one of icosahedron, octahedron or tetrahedron is allowed.';
export const FREQUENCY_POSITIVE_INT = 'Frequency must be a positive integer.';
export const SIZE_ARG_REQUIRED = 'One of radius, minLength or maxLength is required.';
export const MAX_ONE_SIZE_ARG = 'A maximum of one of radius, minLength or maxLength is allowed.';
export const SIZE_ARG_POSITIVE_NUM = {
  radius: 'Radius must be a positive number.',
  minLength: 'MinLength must be a positive number.',
  maxLength: 'MaxLength must be a positive number.',
};

export const DEFAULT_PRECISION = -2;
