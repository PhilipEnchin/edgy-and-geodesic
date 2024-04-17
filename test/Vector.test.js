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

  describe('Vector3.prototype.toString', () => {
    it('should stringify a vector', () => {
      const positive = new Vector3(1, 2, 3);
      const negative = new Vector3(-1, -2, -3);
      const decimal = new Vector3(-1.5, -2.25, 3.125);

      expect(positive.toString()).to.equal('(1, 2, 3)');
      expect(negative.toString()).to.equal('(-1, -2, -3)');
      expect(decimal.toString()).to.equal('(-1.5, -2.25, 3.125)');
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
