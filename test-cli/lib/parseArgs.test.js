import { expect } from 'chai';
import sinon from 'sinon';
import parseArgs from '../../src/cli/lib/parseArgs.js';
import {
  FREQUENCY_POSITIVE_INT, HELP_TEXT, MAX_ONE_SIZE_ARG, SIZE_ARG_POSITIVE_NUM, SIZE_ARG_REQUIRED,
} from '../../src/cli/lib/constants.js';

/** @typedef {import('../../src/cli/lib/parseArgs.js').ParsedArgs} ParsedArgs */

describe('parseArgs', () => {
  /** @type {sinon.SinonStub} */ let consoleLog;
  /** @type {sinon.SinonStub} */ let consoleError;

  beforeEach(() => {
    consoleLog = sinon.stub(console, 'log');
    consoleError = sinon.stub(console, 'error');
  });

  afterEach(() => {
    consoleLog.restore();
    consoleError.restore();
  });

  it('should default to icosahedron when base polyhedron is omitted', () => {
    expect(parseArgs(['-m', '42'])).to.haveOwnProperty('polyhedronId', 'icosahedron');
  });

  it('should return parsed args object when help flag is absent, and there are no errors', () => {
    /** @type {ParsedArgs} */ const expected = {
      polyhedronId: 'icosahedron',
      frequency: 42,
      sizeKey: 'radius',
      sizeValue: 2,
      fullOutput: false,
      spherify: true,
    };
    /** @type {{args: string[], expected: ParsedArgs}[]} */ const testCases = [
      { args: ['--frequency', '42', '--radius', '2'], expected },
      { args: ['--frequency', '42', '--radius', '2', '--fullOutput', '--icosahedron'], expected: { ...expected, fullOutput: true } },
      { args: ['--frequency', '42', '--radius', '2', '-F', '-i'], expected: { ...expected, fullOutput: true } },
      { args: ['--frequency', '42', '--radius', '2', '--doNotSpherify', '--octahedron'], expected: { ...expected, spherify: false, polyhedronId: 'octahedron' } },
      { args: ['--frequency', '42', '--radius', '2', '-d', '-o'], expected: { ...expected, spherify: false, polyhedronId: 'octahedron' } },
      { args: ['-f', '42', '-r', '2', '--tetrahedron'], expected: { ...expected, polyhedronId: 'tetrahedron' } },
      { args: ['-f', '42', '--minLength', '2', '-t'], expected: { ...expected, sizeKey: 'minLength', polyhedronId: 'tetrahedron' } },
      { args: ['-f', '42', '-m', '2'], expected: { ...expected, sizeKey: 'minLength' } },
      { args: ['-f', '42', '--maxLength', '2'], expected: { ...expected, sizeKey: 'maxLength' } },
      { args: ['-f', '42', '-M', '2'], expected: { ...expected, sizeKey: 'maxLength' } },
    ];
    testCases.forEach(({ args, expected: expectedReturn }) => {
      expect(parseArgs(args)).to.deep.equal(expectedReturn);
    });
  });

  it('should display usage with help flag', () => {
    parseArgs(['-h']);
    expect(consoleLog.calledWithExactly(HELP_TEXT)).to.be.true;
  });

  it('should return false with help flag', () => {
    expect(parseArgs(['--help'])).to.be.false;
    expect(parseArgs(['-h'])).to.be.false;
  });

  it('should not check other args with help flag', () => {
    const parsed = parseArgs(['-f', '1', '-h', '-r', '2', 't']);

    expect(parsed).to.be.false;
    expect(consoleLog.calledWithExactly(HELP_TEXT)).to.be.true;
  });

  it('should accept a maximum of one of icosahedron, octahedron, tetrahedron', () => {
    expect(parseArgs(['-r', '1'])).to.be.an('object');
    expect(parseArgs(['-r', '1', '-i'])).to.be.an('object');
    expect(parseArgs(['-r', '1', '-o'])).to.be.an('object');
    expect(parseArgs(['-r', '1', '-t'])).to.be.an('object');

    expect(parseArgs(['-r', '1', '-i', '-o'])).to.be.false;
    expect(parseArgs(['-r', '1', '-i', '-t'])).to.be.false;
    expect(parseArgs(['-r', '1', '-o', '-t'])).to.be.false;
    expect(parseArgs(['-r', '1', '-i', '-o', '-t'])).to.be.false;
  });

  it('should default to 1 when frequency is omitted', () => {
    /** @type {ParsedArgs} */ const expected = {
      polyhedronId: 'icosahedron',
      frequency: 1,
      sizeKey: 'radius',
      sizeValue: 42,
      fullOutput: false,
      spherify: true,
    };
    expect(parseArgs(['--radius', '42'])).to.deep.equal(expected);
  });

  it('should require the frequency argument to be a positive whole number', () => {
    expect(parseArgs(['--frequency', '1', '--radius', '42'])).to.be.an('object');
    expect(parseArgs(['--frequency', '0', '--radius', '42'])).to.be.false;
    expect(parseArgs(['--frequency=-1', '--radius', '42'])).to.be.false;
    expect(parseArgs(['--frequency', '1.5', '--radius', '42'])).to.be.false;
  });

  it('should require exactly one of radius, minLength, maxLength', () => {
    expect(parseArgs(['-r', '1'])).to.be.an('object');
    expect(parseArgs(['-m', '1'])).to.be.an('object');
    expect(parseArgs(['-M', '1'])).to.be.an('object');

    expect(parseArgs([])).to.be.false;
    expect(parseArgs(['-r', '1', '-M', '1'])).to.be.false;
    expect(parseArgs(['-r', '1', '-m', '1'])).to.be.false;
    expect(parseArgs(['-M', '1', '-m', '1'])).to.be.false;
    expect(parseArgs(['-r', '1', '-M', '1', '-m', '1'])).to.be.false;
  });

  it('should require a radius to be a positive number', () => {
    expect(parseArgs(['-r', '1'])).to.be.an('object');
    expect(parseArgs(['-r', '1.5'])).to.be.an('object');
    expect(parseArgs(['-r', '0'])).to.be.false;
    expect(parseArgs(['--radius=-1'])).to.be.false;
  });

  it('should require a minLength to be a positive number', () => {
    expect(parseArgs(['-m', '1'])).to.be.an('object');
    expect(parseArgs(['-m', '1.5'])).to.be.an('object');
    expect(parseArgs(['-m', '0'])).to.be.false;
    expect(parseArgs(['--minLength=-1'])).to.be.false;
  });

  it('should require a maxLength to be a positive number', () => {
    expect(parseArgs(['-M', '1'])).to.be.an('object');
    expect(parseArgs(['-M', '1.5'])).to.be.an('object');
    expect(parseArgs(['-M', '0'])).to.be.false;
    expect(parseArgs(['--maxLength=-1'])).to.be.false;
  });

  it('should accept optional arg, fullOutput', () => {
    expect(parseArgs(['-M', '1'])).to.be.an('object');
    expect(parseArgs(['-F', '-M', '1'])).to.be.an('object');
  });

  it('should accept optional arg, doNotSpherify', () => {
    expect(parseArgs(['-m', '42'])).to.be.an('object');
    expect(parseArgs(['-m', '42', '-d'])).to.be.an('object');
  });

  it('should return false on error', () => {
    expect(parseArgs([])).to.be.false;
    expect(parseArgs(['--notAnOption'])).to.be.false;
    expect(parseArgs(['-f', '4.4', '-r', '4'])).to.be.false;
  });

  it('should display message and help on error', () => {
    /** @type {{args: string[], expected: string}[]} */ const testCases = [
      { args: [], expected: SIZE_ARG_REQUIRED },
      { args: ['--frequency=-1'], expected: FREQUENCY_POSITIVE_INT },
      { args: ['-f', '0'], expected: FREQUENCY_POSITIVE_INT },
      { args: ['-f', '1.5'], expected: FREQUENCY_POSITIVE_INT },
      { args: ['-f', '1.5'], expected: FREQUENCY_POSITIVE_INT },
      { args: ['-r', '1', '-m', '1'], expected: MAX_ONE_SIZE_ARG },
      { args: ['-r', '1', '-M', '1'], expected: MAX_ONE_SIZE_ARG },
      { args: ['-m', '1', '-M', '1'], expected: MAX_ONE_SIZE_ARG },
      { args: ['-r', '1', '-m', '1', '-M', '1'], expected: MAX_ONE_SIZE_ARG },
      { args: ['-r', '0'], expected: SIZE_ARG_POSITIVE_NUM.radius },
      { args: ['--radius=-1'], expected: SIZE_ARG_POSITIVE_NUM.radius },
      { args: ['-m', '0'], expected: SIZE_ARG_POSITIVE_NUM.minLength },
      { args: ['--minLength=-1'], expected: SIZE_ARG_POSITIVE_NUM.minLength },
      { args: ['-M', '0'], expected: SIZE_ARG_POSITIVE_NUM.maxLength },
      { args: ['--maxLength=-1'], expected: SIZE_ARG_POSITIVE_NUM.maxLength },
    ];
    testCases.forEach(({ args, expected }) => {
      consoleLog.resetHistory();
      parseArgs(args);
      expect(consoleError.calledWithExactly(expected)).to.be.true;
      expect(consoleLog.calledWithExactly(HELP_TEXT)).to.be.true;
    });
  });
});