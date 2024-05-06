import { expect } from 'chai';
import Vector3 from '../src/Vector.js';

describe('Vector', () => {
  describe('Constructor', () => {
    it('should create a vector with x, y and z coordinates', () => {
      const vector = new Vector3(1, 2, 3);

      expect(vector.x).to.equal(1);
      expect(vector.y).to.equal(2);
      expect(vector.z).to.equal(3);
    });
  });

  describe('Vector3.prototype.angleTo', () => {
    it('should return zero when comparing a vector to itself', () => {
      const vector = new Vector3(3, 4, 5);

      expect(vector.angleTo(vector)).to.be.closeTo(0, 0.0001);
    });

    it('should return zero when comparing a vector to an equivalent vector', () => {
      const a = new Vector3(3, 4, 5);
      const b = new Vector3(3, 4, 5);

      expect(a.angleTo(b)).to.be.closeTo(0, 0.0001);
    });

    it('should return an acute angle', () => {
      const a = new Vector3(3, 4, 5);
      const b = new Vector3(6, 7, -2.454);

      expect(a.angleTo(b)).to.be.closeTo(Math.PI / 3, 0.0001);
    });

    it('should return an right angle', () => {
      const a = new Vector3(3, 4, 5);
      const b = new Vector3(6, 7, -46 / 5);

      expect(a.angleTo(b)).to.be.closeTo(Math.PI / 2, 0.0001);
    });

    it('should return an obtuse angle', () => {
      const a = new Vector3(3, 4, 5);
      const b = new Vector3(6, 7, -34.346);

      expect(a.angleTo(b)).to.be.closeTo((2 * Math.PI) / 3, 0.0001);
    });

    it('should return an straight angle', () => {
      const a = new Vector3(3, 4, 5);
      const b = new Vector3(-3, -4, -5);

      expect(a.angleTo(b)).to.be.closeTo(Math.PI, 0.0001);
    });
  });

  describe('Vector3.prototype.copy', () => {
    it('should return a new Vector3 object', () => {
      const original = new Vector3(1, 2, 3);
      const copy = original.copy();

      expect(copy).to.not.equal(original);
    });

    it('should copy values', () => {
      const original = new Vector3(10, 20, -30);
      const copy = original.copy();

      expect(copy.x).to.equal(original.x);
      expect(copy.y).to.equal(original.y);
      expect(copy.z).to.equal(original.z);
    });

    it('should pass original vector to transformer function', () => {
      const original = new Vector3(1, 2, 3);

      let actualArgs;
      original.copy((...args) => {
        actualArgs = args;
        return {};
      });

      expect(actualArgs).to.deep.equal([original]);
    });

    it('should apply transformer if specified', () => {
      const originalNoChange = new Vector3(1, 1, 2);
      const originalX = new Vector3(1, 2, 3);
      const originalY = new Vector3(2, 3, 5);
      const originalZ = new Vector3(3, 5, 8);
      const originalXZ = new Vector3(5, 8, 13);
      const originalAll = new Vector3(8, 13, 21);

      const copyNoChange = originalNoChange.copy(() => ({}));
      const copyX = originalX.copy(() => ({ x: 0 }));
      const copyY = originalY.copy(() => ({ y: 0 }));
      const copyZ = originalZ.copy(() => ({ z: 0 }));
      const copyXZ = originalXZ.copy(() => ({ x: 0, z: -1 }));
      const copyAll = originalAll.copy(() => ({ x: 0, y: -1, z: -2 }));

      expect(copyNoChange.isEqualTo(originalNoChange)).to.be.true;
      expect(copyX.isEqualTo(new Vector3(0, 2, 3))).to.be.true;
      expect(copyY.isEqualTo(new Vector3(2, 0, 5))).to.be.true;
      expect(copyZ.isEqualTo(new Vector3(3, 5, 0))).to.be.true;
      expect(copyXZ.isEqualTo(new Vector3(0, 8, -1))).to.be.true;
      expect(copyAll.isEqualTo(new Vector3(0, -1, -2))).to.be.true;
    });
  });

  describe('Vector3.prototype.distanceTo', () => {
    it('should calculate the magnitude of the difference of two vectors', () => {
      const a = new Vector3(-4, 5, -6);
      const b = new Vector3(7, -8, 9);
      const expectedDistance = Math.sqrt(11 * 11 + 13 * 13 + 15 * 15);

      expect(a.distanceTo(b)).to.equal(expectedDistance);
      expect(b.distanceTo(a)).to.equal(expectedDistance);
    });
  });

  describe('Vector3.prototype.dividedBy', () => {
    it('should calculate a quotient when divided by a scalar', () => {
      const vector = new Vector3(36, -48, 51);

      const quotient = vector.dividedBy(6);

      expect(quotient.x).to.equal(6);
      expect(quotient.y).to.equal(-8);
      expect(quotient.z).to.equal(8.5);
    });

    it('should return a new Vector3', () => {
      const a = new Vector3(7, 8, 9);
      const quotient = a.dividedBy(5);

      expect(quotient).to.not.equal(a);
    });

    it('should not mutate original Vector3 object', () => {
      const a = new Vector3(7, 8, 9);
      const quotient = a.dividedBy(5);

      expect(quotient.x).to.not.equal(a.x);
      expect(quotient.y).to.not.equal(a.y);
      expect(quotient.z).to.not.equal(a.z);
    });
  });

  describe('Vector3.prototype.isEqualTo', () => {
    const vector = new Vector3(1, 2, 3);
    const equalVector = new Vector3(1, 2, 3);
    const slightlyGreaterVectorX = new Vector3(((0.1 + 0.2) * 10) - 2, 2, 3);
    const slightlyGreaterVectorY = new Vector3(1, ((0.1 + 0.2) * 10) - 1, 3);
    const slightlyGreaterVectorZ = new Vector3(1, 2, (0.1 + 0.2) * 10);
    const slightlyLessVectorX = new Vector3(4 - (0.1 + 0.2) * 10, 2, 3);
    const slightlyLessVectorY = new Vector3(1, 5 - (0.1 + 0.2) * 10, 3);
    const slightlyLessVectorZ = new Vector3(1, 2, 6 - (0.1 + 0.2) * 10);
    const slightlyLessPositiveTolerance = 1 / 2 ** 52;
    const exactPositiveTolerance = 1 / 2 ** 51;
    const slightlyGreaterPositiveTolerance = 1 / 2 ** 50;
    const slightlyLessNegativeTolerance = -slightlyLessPositiveTolerance;
    const exactNegativeTolerance = -exactPositiveTolerance;
    const slightlyGreaterNegativeTolerance = -slightlyGreaterPositiveTolerance;

    it('should return true with an exact match with no tolerance', () => {
      expect(vector.isEqualTo(equalVector)).to.be.true;
    });

    it('should return false with a nearly exact match with no tolerance', () => {
      expect(vector.isEqualTo(slightlyGreaterVectorX)).to.be.false;
      expect(vector.isEqualTo(slightlyGreaterVectorY)).to.be.false;
      expect(vector.isEqualTo(slightlyGreaterVectorZ)).to.be.false;
      expect(vector.isEqualTo(slightlyLessVectorX)).to.be.false;
      expect(vector.isEqualTo(slightlyLessVectorY)).to.be.false;
      expect(vector.isEqualTo(slightlyLessVectorZ)).to.be.false;
    });

    it('should return true with an exact match with any tolerance', () => {
      expect(vector.isEqualTo(equalVector, 0)).to.be.true;
      expect(vector.isEqualTo(equalVector, slightlyLessPositiveTolerance)).to.be.true;
      expect(vector.isEqualTo(equalVector, exactPositiveTolerance)).to.be.true;
      expect(vector.isEqualTo(equalVector, slightlyGreaterPositiveTolerance)).to.be.true;
      expect(vector.isEqualTo(equalVector, slightlyLessNegativeTolerance)).to.be.true;
      expect(vector.isEqualTo(equalVector, exactNegativeTolerance)).to.be.true;
      expect(vector.isEqualTo(equalVector, slightlyGreaterNegativeTolerance)).to.be.true;
    });

    it('should return false with a nearly exact match with tolerance of zero', () => {
      expect(vector.isEqualTo(slightlyGreaterVectorX, 0)).to.be.false;
      expect(vector.isEqualTo(slightlyGreaterVectorY, 0)).to.be.false;
      expect(vector.isEqualTo(slightlyGreaterVectorZ, 0)).to.be.false;
      expect(vector.isEqualTo(slightlyLessVectorX, 0)).to.be.false;
      expect(vector.isEqualTo(slightlyLessVectorY, 0)).to.be.false;
      expect(vector.isEqualTo(slightlyLessVectorZ, 0)).to.be.false;
    });

    it('should return false with a nearly exact match with too-small tolerance', () => {
      expect(vector.isEqualTo(slightlyGreaterVectorX, slightlyLessPositiveTolerance)).to.be.false;
      expect(vector.isEqualTo(slightlyGreaterVectorX, slightlyLessNegativeTolerance)).to.be.false;
      expect(vector.isEqualTo(slightlyGreaterVectorY, slightlyLessPositiveTolerance)).to.be.false;
      expect(vector.isEqualTo(slightlyGreaterVectorY, slightlyLessNegativeTolerance)).to.be.false;
      expect(vector.isEqualTo(slightlyGreaterVectorZ, slightlyLessPositiveTolerance)).to.be.false;
      expect(vector.isEqualTo(slightlyGreaterVectorZ, slightlyLessNegativeTolerance)).to.be.false;
      expect(vector.isEqualTo(slightlyLessVectorX, slightlyLessPositiveTolerance)).to.be.false;
      expect(vector.isEqualTo(slightlyLessVectorX, slightlyLessNegativeTolerance)).to.be.false;
      expect(vector.isEqualTo(slightlyLessVectorY, slightlyLessPositiveTolerance)).to.be.false;
      expect(vector.isEqualTo(slightlyLessVectorY, slightlyLessNegativeTolerance)).to.be.false;
      expect(vector.isEqualTo(slightlyLessVectorZ, slightlyLessPositiveTolerance)).to.be.false;
      expect(vector.isEqualTo(slightlyLessVectorZ, slightlyLessNegativeTolerance)).to.be.false;
    });

    it('should return true with a nearly exact match with exact tolerance', () => {
      expect(vector.isEqualTo(slightlyGreaterVectorX, exactPositiveTolerance)).to.be.true;
      expect(vector.isEqualTo(slightlyGreaterVectorX, exactNegativeTolerance)).to.be.true;
      expect(vector.isEqualTo(slightlyGreaterVectorY, exactPositiveTolerance)).to.be.true;
      expect(vector.isEqualTo(slightlyGreaterVectorY, exactNegativeTolerance)).to.be.true;
      expect(vector.isEqualTo(slightlyGreaterVectorZ, exactPositiveTolerance)).to.be.true;
      expect(vector.isEqualTo(slightlyGreaterVectorZ, exactNegativeTolerance)).to.be.true;
      expect(vector.isEqualTo(slightlyLessVectorX, exactPositiveTolerance)).to.be.true;
      expect(vector.isEqualTo(slightlyLessVectorX, exactNegativeTolerance)).to.be.true;
      expect(vector.isEqualTo(slightlyLessVectorY, exactPositiveTolerance)).to.be.true;
      expect(vector.isEqualTo(slightlyLessVectorY, exactNegativeTolerance)).to.be.true;
      expect(vector.isEqualTo(slightlyLessVectorZ, exactPositiveTolerance)).to.be.true;
      expect(vector.isEqualTo(slightlyLessVectorZ, exactNegativeTolerance)).to.be.true;
    });

    it('should return true with a nearly exact match with greater tolerance', () => {
      expect(vector.isEqualTo(slightlyGreaterVectorX, slightlyGreaterPositiveTolerance)).to.be.true;
      expect(vector.isEqualTo(slightlyGreaterVectorX, slightlyGreaterNegativeTolerance)).to.be.true;
      expect(vector.isEqualTo(slightlyGreaterVectorY, slightlyGreaterPositiveTolerance)).to.be.true;
      expect(vector.isEqualTo(slightlyGreaterVectorY, slightlyGreaterNegativeTolerance)).to.be.true;
      expect(vector.isEqualTo(slightlyGreaterVectorZ, slightlyGreaterPositiveTolerance)).to.be.true;
      expect(vector.isEqualTo(slightlyGreaterVectorZ, slightlyGreaterNegativeTolerance)).to.be.true;
      expect(vector.isEqualTo(slightlyLessVectorX, slightlyGreaterPositiveTolerance)).to.be.true;
      expect(vector.isEqualTo(slightlyLessVectorX, slightlyGreaterNegativeTolerance)).to.be.true;
      expect(vector.isEqualTo(slightlyLessVectorY, slightlyGreaterPositiveTolerance)).to.be.true;
      expect(vector.isEqualTo(slightlyLessVectorY, slightlyGreaterNegativeTolerance)).to.be.true;
      expect(vector.isEqualTo(slightlyLessVectorZ, slightlyGreaterPositiveTolerance)).to.be.true;
      expect(vector.isEqualTo(slightlyLessVectorZ, slightlyGreaterNegativeTolerance)).to.be.true;
    });
  });

  describe('Vector3.prototype.magnitude', () => {
    it('should calculate the magnitude of a vector', () => {
      const vector = new Vector3(-4, 6, -7);
      const expectedMagnitude = Math.sqrt(4 * 4 + 6 * 6 + 7 * 7);

      expect(vector.magnitude).to.equal(expectedMagnitude);
    });
  });

  describe('Vector3.prototype.minus', () => {
    it('should calculate a difference between two vectors', () => {
      const a = new Vector3(7, 8, 9);
      const b = new Vector3(3, 2, -1);
      const difference = a.minus(b);

      expect(difference.x).to.equal(4);
      expect(difference.y).to.equal(6);
      expect(difference.z).to.equal(10);
    });

    it('should return a new Vector3', () => {
      const a = new Vector3(7, 8, 9);
      const b = new Vector3(3, 2, -1);
      const difference = a.minus(b);

      expect(difference).to.not.equal(a);
      expect(difference).to.not.equal(b);
    });

    it('should not mutate original Vector3 objects', () => {
      const a = new Vector3(7, 8, 9);
      const b = new Vector3(3, 2, -1);
      const difference = a.minus(b);

      expect(difference.x).to.not.equal(a.x);
      expect(difference.y).to.not.equal(a.y);
      expect(difference.z).to.not.equal(a.z);
      expect(difference.x).to.not.equal(b.x);
      expect(difference.y).to.not.equal(b.y);
      expect(difference.z).to.not.equal(b.z);
    });
  });

  describe('Vector3.prototype.plus', () => {
    it('should calculate a sum of two vectors', () => {
      const a = new Vector3(7, 8, 9);
      const b = new Vector3(3, 20, -1);
      const sum = a.plus(b);

      expect(sum.x).to.equal(10);
      expect(sum.y).to.equal(28);
      expect(sum.z).to.equal(8);
    });

    it('should return a new Vector3', () => {
      const a = new Vector3(7, 8, 9);
      const b = new Vector3(3, 2, -1);
      const sum = a.plus(b);

      expect(sum).to.not.equal(a);
      expect(sum).to.not.equal(b);
    });

    it('should not mutate original Vector3 objects', () => {
      const a = new Vector3(7, 8, 9);
      const b = new Vector3(3, 2, -1);
      const sum = a.plus(b);

      expect(sum.x).to.not.equal(a.x);
      expect(sum.y).to.not.equal(a.y);
      expect(sum.z).to.not.equal(a.z);
      expect(sum.x).to.not.equal(b.x);
      expect(sum.y).to.not.equal(b.y);
      expect(sum.z).to.not.equal(b.z);
    });
  });

  describe('Vector3.prototype.times', () => {
    it('should calculate a product when multiplied by a scalar', () => {
      const vector = new Vector3(36, -48, 51);

      const product = vector.times(6);

      expect(product.x).to.equal(216);
      expect(product.y).to.equal(-288);
      expect(product.z).to.equal(306);
    });

    it('should return a new Vector3', () => {
      const a = new Vector3(7, 8, 9);
      const product = a.times(5);

      expect(product).to.not.equal(a);
    });

    it('should not mutate original Vector3 object', () => {
      const a = new Vector3(7, 8, 9);
      const quotient = a.dividedBy(5);

      expect(quotient.x).to.not.equal(a.x);
      expect(quotient.y).to.not.equal(a.y);
      expect(quotient.z).to.not.equal(a.z);
    });
  });

  describe('Vector3.prototype.toString', () => {
    it('should stringify a vector', () => {
      const positive = new Vector3(1, 2, 3);
      const negative = new Vector3(-1, -2, -3);
      const decimal = new Vector3(-1.5, -2.25, 3.125);

      expect(positive.toString()).to.equal('(1, 2, 3)');
      expect(negative.toString()).to.equal('(-1, -2, -3)');
      expect(decimal.toString()).to.equal('(-1.5, -2.25, 3.125)');
    });

    it('should not include any exponential notation', () => {
      const tinyPositive = new Vector3(2 ** -500, 0, 0).toString();
      const hugePositive = new Vector3(2 ** 500, 0, 0).toString();
      const tinyNegative = new Vector3(-(2 ** -500), 0, 0).toString();
      const hugeNegative = new Vector3(-(2 ** 500), 0, 0).toString();

      const exponentialRegex = /e[-+]?\d+/;

      expect(exponentialRegex.test(tinyPositive)).to.be.false;
      expect(exponentialRegex.test(hugePositive)).to.be.false;
      expect(exponentialRegex.test(tinyNegative)).to.be.false;
      expect(exponentialRegex.test(hugeNegative)).to.be.false;
    });
  });

  describe('Vector3.prototype.x/y/z', () => {
    /** @type {Vector3} */ let vector;

    beforeEach(() => {
      vector = new Vector3(1, 2, 3);
    });

    it('should get x value', () => {
      expect(vector.x).to.equal(1);
    });

    it('should get y value', () => {
      expect(vector.y).to.equal(2);
    });

    it('should get z value', () => {
      expect(vector.z).to.equal(3);
    });

    it('should not set x value', () => {
      // @ts-ignore
      expect(() => { vector.x = 3; }).to.throw();
      expect(vector.x).to.equal(1);
    });

    it('should not set y value', () => {
      // @ts-ignore
      expect(() => { vector.y = 4; }).to.throw();
      expect(vector.y).to.equal(2);
    });

    it('should not set z value', () => {
      // @ts-ignore
      expect(() => { vector.z = 5; }).to.throw();
      expect(vector.z).to.equal(3);
    });
  });
});
