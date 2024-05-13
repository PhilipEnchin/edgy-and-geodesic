import { expect } from 'chai';
import sinon from 'sinon';
import parseArgs from '../../src/cli/lib/parseArgs.js';
import {
  FREQUENCY_POSITIVE_INT, HELP_TEXT, MAX_ONE_SIZE_ARG, SIZE_ARG_POSITIVE_NUM, SIZE_ARG_REQUIRED,
} from '../../src/cli/lib/constants.js';

/** @typedef {import('../../src/cli/lib/parseArgs.js').ParsedArgs} ParsedArgs */

describe('parseArgs', () => {
  /** @type {sinon.SinonStub} */ let consoleLog;

  beforeEach(() => {
    consoleLog = sinon.stub(console, 'log');
  });

  afterEach(() => {
    consoleLog.restore();
  });

  it('should return parsed args object when help flag is absent, and there are no errors', () => {
    /** @type {ParsedArgs} */ const expected = {
      frequency: 42,
      sizeKey: 'radius',
      sizeValue: 2,
      fullOutput: false,
    };
    [
      { args: ['--frequency', '42', '--radius', '2'], expected },
      { args: ['--frequency', '42', '--radius', '2', '--fullOutput'], expected: { ...expected, fullOutput: true } },
      { args: ['--frequency', '42', '--radius', '2', '-F'], expected: { ...expected, fullOutput: true } },
      { args: ['-f', '42', '-r', '2'], expected },
      { args: ['-f', '42', '--minLength', '2'], expected: { ...expected, sizeKey: 'minLength' } },
      { args: ['-f', '42', '-m', '2'], expected: { ...expected, sizeKey: 'minLength' } },
      { args: ['-f', '42', '--maxLength', '2'], expected: { ...expected, sizeKey: 'maxLength' } },
      { args: ['-f', '42', '-M', '2'], expected: { ...expected, sizeKey: 'maxLength' } },
    ].forEach(({ args, expected: expectedReturn }) => {
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
    const parsed = parseArgs(['-f', '1', '-h', '-r', '2']);

    expect(parsed).to.be.false;
    expect(consoleLog.calledWithExactly(HELP_TEXT)).to.be.true;
  });

  it('should default to 1 when frequency is omitted', () => {
    expect(parseArgs(['--radius', '42'])).to.deep.equal({
      frequency: 1, sizeKey: 'radius', sizeValue: 42, fullOutput: false,
    });
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

  it('should return false on error', () => {
    expect(parseArgs([])).to.be.false;
    expect(parseArgs(['--notAnOption'])).to.be.false;
    expect(parseArgs(['-f', '4.4', '-r', '4'])).to.be.false;
  });

  it('should display message and help on error', () => {
    [
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
    ].forEach(({ args, expected }) => {
      consoleLog.resetHistory();
      parseArgs(args);
      expect(consoleLog.calledWithExactly(`${expected}\n${HELP_TEXT}`)).to.be.true;
    });
  });
});
