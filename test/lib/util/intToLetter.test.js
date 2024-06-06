import { expect } from 'chai';
import intToLetter from '../../../src/lib/util/intToLetter.js';

describe('intToLetter', () => {
  it('should convert numbers 0 to 25 into uppercase letters A to Z', () => {
    ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
      .forEach((letter, int) => {
        expect(intToLetter(int)).to.equal(letter);
      });
  });

  it('should throw error when given numbers outside the 0 to 25 range', () => {
    expect(() => { intToLetter(-1); }).to.throw();
    expect(() => { intToLetter(26); }).to.throw();
  });

  it('should throw error when given a non-whole number', () => {
    expect(() => { intToLetter(4.2); }).to.throw();
  });
});
