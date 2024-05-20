import { expect } from 'chai';
import { spawn } from 'nexpect';
import { readFileSync } from 'fs';
import {
  FREQUENCY_POSITIVE_INT, HELP_TEXT, MAX_ONE_SIZE_ARG, SIZE_ARG_POSITIVE_NUM, SIZE_ARG_REQUIRED,
} from '../src/cli/lib/constants.js';

/**
 * @param {Mocha.Done} done
 * @param {number} expectedLineCount
 * @param {number} [expectedExitcode]
 * @returns {(err: Error, output: string[], exit: string | number) => void}
 */
const callback = (done, expectedLineCount, expectedExitcode = 0) => (error, output, exitcode) => {
  if (error) throw error;
  else {
    expect(output).to.have.lengthOf(expectedLineCount, `Expected ${expectedLineCount} lines of output but got ${output.length}`);
    expect(exitcode).to.equal(expectedExitcode, `Expected exitcode of ${expectedExitcode} but got ${exitcode}`);
    done();
  }
};

/**
 * Use this in place of Mocha's `done` when multiple .run callbacks are required
 * @param {Mocha.Done} done
 * @param {number} count
 * @returns
 */
const multiDone = (done, count) => {
  let i = 0;
  return () => { if (++i === count) done(); };
};

describe('CLI', () => {
  const helpText = HELP_TEXT.split('\n');

  describe('should run via', () => {
    it('npm script', (done) => {
      const scriptName = 'geodesic';
      const args = '-m 42';
      const expectedCommand = JSON.parse(readFileSync('package.json').toString()).scripts[scriptName];
      spawn(`npm run ${scriptName} -- ${args}`)
        .expect('> geodesic')
        .expect(`> ${expectedCommand} ${args}`)
        .expect('Length of 42: 30')
        .expect('TOTAL EDGES: 30')
        .run(callback(done, 4, 0));
    });

    it('root executable', (done) => {
      spawn('./geodesic -m 42')
        .expect('Length of 42: 30')
        .expect('TOTAL EDGES: 30')
        .run(callback(done, 2, 0));
    });
    xit('docker');
  });

  describe('happy path', () => {
    it('should print summary with omitted args', (done) => {
      spawn('./geodesic -m 42')
        .expect('Length of 42: 30')
        .expect('TOTAL EDGES: 30')
        .run(callback(done, 2));
    });

    it('should print summary with default, non-omitted args', (done) => {
      spawn('./geodesic -f 1 -m 42')
        .expect('Length of 42: 30')
        .expect('TOTAL EDGES: 30')
        .run(callback(done, 2));
    });

    it('should print full output with (otherwise) default args', (_done) => {
      const done = multiDone(_done, 2);
      ['--fullOutput', '-F'].forEach((fullOutputFlag) => {
        spawn(`./geodesic -f 1 -m 42 ${fullOutputFlag}`)
          .expect('Edge length: 42')
          .expect('Count: 30')
          .expect('VERTEX(A) <-> VERTEX(B)')
          .expect('VERTEX(A) <-> VERTEX(E)')
          .expect('VERTEX(A) <-> VERTEX(F)')
          .expect('VERTEX(A) <-> VERTEX(I)')
          .expect('VERTEX(A) <-> VERTEX(K)')
          .expect('VERTEX(B) <-> VERTEX(G)')
          .expect('VERTEX(B) <-> VERTEX(H)')
          .expect('VERTEX(B) <-> VERTEX(I)')
          .expect('VERTEX(B) <-> VERTEX(K)')
          .expect('VERTEX(C) <-> VERTEX(D)')
          .expect('VERTEX(C) <-> VERTEX(E)')
          .expect('VERTEX(C) <-> VERTEX(F)')
          .expect('VERTEX(C) <-> VERTEX(J)')
          .expect('VERTEX(C) <-> VERTEX(L)')
          .expect('VERTEX(D) <-> VERTEX(G)')
          .expect('VERTEX(D) <-> VERTEX(H)')
          .expect('VERTEX(D) <-> VERTEX(J)')
          .expect('VERTEX(D) <-> VERTEX(L)')
          .expect('VERTEX(E) <-> VERTEX(F)')
          .expect('VERTEX(E) <-> VERTEX(I)')
          .expect('VERTEX(E) <-> VERTEX(J)')
          .expect('VERTEX(F) <-> VERTEX(K)')
          .expect('VERTEX(F) <-> VERTEX(L)')
          .expect('VERTEX(G) <-> VERTEX(H)')
          .expect('VERTEX(G) <-> VERTEX(I)')
          .expect('VERTEX(G) <-> VERTEX(J)')
          .expect('VERTEX(H) <-> VERTEX(K)')
          .expect('VERTEX(H) <-> VERTEX(L)')
          .expect('VERTEX(I) <-> VERTEX(J)')
          .expect('VERTEX(K) <-> VERTEX(L)')
          .run(callback(done, 33));
      });
    });

    it('should print summary with doNotSpherify flag', (done) => {
      spawn('./geodesic -f 2 -m 42 -d')
        .expect('Length of 42: 120')
        .expect('TOTAL EDGES: 120')
        .run(callback(done, 2));
    });

    it('should print summary non-default frequency', (_done) => {
      const done = multiDone(_done, 2);
      ['--frequency', '-f'].forEach((frequencyFlag) => {
        spawn(`./geodesic ${frequencyFlag} 3 -m 42`)
          .expect('Length of 42: 60')
          .expect('Length of 48.62: 90')
          .expect('Length of 49.69: 120')
          .expect('TOTAL EDGES: 270')
          .run(callback(done, 4));
      });
    });

    it('should print summary with radius specified', (_done) => {
      const done = multiDone(_done, 2);
      ['--radius', '-r'].forEach((radiusFlag) => {
        spawn(`./geodesic -f 2 ${radiusFlag} 42`)
          .expect('Length of 22.95: 60')
          .expect('Length of 25.96: 60')
          .expect('TOTAL EDGES: 120')
          .run(callback(done, 3));
      });
    });

    it('should print summary with minLength specified', (_done) => {
      const done = multiDone(_done, 2);
      ['--minLength', '-m'].forEach((minLengthFlag) => {
        spawn(`./geodesic -f 2 ${minLengthFlag} 42`)
          .expect('Length of 42: 60')
          .expect('Length of 47.49: 60')
          .expect('TOTAL EDGES: 120')
          .run(callback(done, 3));
      });
    });

    it('should print summary with maxLength specified', (_done) => {
      const done = multiDone(_done, 2);
      ['--maxLength', '-M'].forEach((maxLengthFlag) => {
        spawn(`./geodesic -f 2 ${maxLengthFlag} 42`)
          .expect('Length of 37.14: 60')
          .expect('Length of 42: 60')
          .expect('TOTAL EDGES: 120')
          .run(callback(done, 3));
      });
    });

    it('should print help with help flag specified', (_done) => {
      const done = multiDone(_done, 2);
      ['--help', '-h'].forEach((helpFlag) => {
        const spawnChain = spawn(`./geodesic ${helpFlag}`);
        helpText.forEach((helpLine) => { spawnChain.expect(helpLine); });
        spawnChain.run(callback(done, helpText.length));
      });
    });
  });

  describe('sad path', () => {
    /**
     * @param {string} command
     * @param {string} expectedErrorText
     * @param {Mocha.Done} _done
     */
    const checkErrorAndHelpText = (command, expectedErrorText, _done) => {
      const done = multiDone(_done, 2);
      const spawned = spawn(command, { stream: 'stdout' });
      helpText.forEach((helpLine) => { spawned.expect(helpLine); });
      spawned.run(callback(done, helpText.length, 2));

      spawn(command, { stream: 'all' })
        .expect(expectedErrorText)
        .run(callback(done, helpText.length + 1, 2));
    };

    it('should print error and help when no size specified', (done) => {
      checkErrorAndHelpText('./geodesic', SIZE_ARG_REQUIRED, done);
    });

    it('should print error and help when unsupported flags are used', (done) => {
      checkErrorAndHelpText('./geodesic --unknown', 'Unknown option \'--unknown\'', done);
    });

    it('should print error and help when frequency is zero', (done) => {
      checkErrorAndHelpText('./geodesic -m 42 -f 0', FREQUENCY_POSITIVE_INT, done);
    });

    it('should print error and help when frequency is negative', (done) => {
      checkErrorAndHelpText('./geodesic -m 42 --frequency=-1', FREQUENCY_POSITIVE_INT, done);
    });

    it('should print error and help when frequency is not an integer', (done) => {
      checkErrorAndHelpText('./geodesic -m 42 -f 1.5', FREQUENCY_POSITIVE_INT, done);
    });

    it('should print error and help when size is zero', (_done) => {
      const done = multiDone(_done, 3);
      checkErrorAndHelpText('./geodesic -m 0', SIZE_ARG_POSITIVE_NUM.minLength, done);
      checkErrorAndHelpText('./geodesic -M 0', SIZE_ARG_POSITIVE_NUM.maxLength, done);
      checkErrorAndHelpText('./geodesic -r 0', SIZE_ARG_POSITIVE_NUM.radius, done);
    });

    it('should print error and help when size is negative', (_done) => {
      const done = multiDone(_done, 3);
      checkErrorAndHelpText('./geodesic --minLength=-1', SIZE_ARG_POSITIVE_NUM.minLength, done);
      checkErrorAndHelpText('./geodesic --maxLength=-1', SIZE_ARG_POSITIVE_NUM.maxLength, done);
      checkErrorAndHelpText('./geodesic --radius=-1', SIZE_ARG_POSITIVE_NUM.radius, done);
    });

    it('should print error and help when multiple size args are specified', (done) => {
      checkErrorAndHelpText('./geodesic -r 1 -m 2', MAX_ONE_SIZE_ARG, done);
    });
  });
});
