import { expect } from 'chai';
import { fullDigits, round } from '../src/numberFormatters.js';

describe('Number formatters', () => {
  describe('fullDigits', () => {
    it('should display small whole numbers without a fuss', () => {
      expect(fullDigits(42)).to.equal('42');
      expect(fullDigits(-42)).to.equal('-42');
    });

    it('should display small numbers with decimals without a fuss', () => {
      expect(fullDigits(0.42)).to.equal('0.42');
      expect(fullDigits(-0.42)).to.equal('-0.42');
      expect(fullDigits(42.42)).to.equal('42.42');
      expect(fullDigits(-42.42)).to.equal('-42.42');
    });

    it('should display very large numbers in their entirety', () => {
      expect(fullDigits(2 ** 70)).to.equal('1180591620717411300000');
      expect(fullDigits(-(2 ** 70))).to.equal('-1180591620717411300000');
    });

    it('should display very long decimals with up to 20 digits', () => {
      expect(fullDigits(2 ** -20)).to.equal('0.00000095367431640625');
      expect(fullDigits(-(2 ** -20))).to.equal('-0.00000095367431640625');
    });
  });

  describe('round', () => {
    it('should not change a number that requires no rounding', () => {
      expect(round(42)).to.equal('42');
      expect(round(42, 0)).to.equal('42');
      expect(round(42000.3)).to.equal('42000');
      expect(round(42.42, -2)).to.equal('42.42');
    });

    it('should round to a whole number', () => {
      expect(round(42.42)).to.equal('42');
      expect(round(-42.42)).to.equal('-42');
      expect(round(41.5)).to.equal('42');
      expect(round(-42.5)).to.equal('-42');
      expect(round(42.42, 0)).to.equal('42');
      expect(round(-42.42, 0)).to.equal('-42');
      expect(round(41.5, 0)).to.equal('42');
      expect(round(-42.5, 0)).to.equal('-42');
    });

    it('should round to nearest 10, 100, etc.', () => {
      expect(round(42, 1)).to.equal('40');
      expect(round(45, 1)).to.equal('50');
      expect(round(149, 2)).to.equal('100');
      expect(round(150, 2)).to.equal('200');
      expect(round(-150, 2)).to.equal('-100');
      expect(round(-151, 2)).to.equal('-200');
      expect(round(35000, 4)).to.equal('40000');
      expect(round(95000, 4)).to.equal('100000');
    });
  });
});
