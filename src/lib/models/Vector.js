import { fullDigits } from '../util/numberFormatters.js';

/**
 * @typedef {object} TransformedVector
 * @property {number} [x]
 * @property {number} [y]
 * @property {number} [z]
 */

/** @typedef {(vector3:Vector3) => TransformedVector} Vector3TransformerFunction */

/**
 * Helper function for testing Vector3 equality
 * @param {number} a
 * @param {number} b
 * @param {number} tolerance
 * @returns {boolean}
 */
const areEqual = (a, b, tolerance) => Math.abs(a - b) <= Math.abs(tolerance);

class Vector3 {
  /** @type {number} */ #x;

  /** @type {number} */ #y;

  /** @type {number} */ #z;

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} z
   */
  constructor(x, y, z) {
    this.#x = x;
    this.#y = y;
    this.#z = z;
  }

  /**
   * @param {Vector3} that
   * @returns {number}
   */
  angleTo(that) {
    return Math.acos((this.x * that.x + this.y * that.y + this.z * that.z) / this.magnitude / that.magnitude);
  }

  /**
   * @param {Vector3TransformerFunction | TransformedVector} [transformer] Transformer: Return/include any/all of x, y, z
   * @returns {Vector3}
   */
  copy(transformer = () => ({})) {
    const transformed = typeof transformer === 'function' ? transformer(this) : { ...transformer };
    return new Vector3(
      'x' in transformed && transformed.x !== undefined ? transformed.x : this.#x,
      'y' in transformed && transformed.y !== undefined ? transformed.y : this.#y,
      'z' in transformed && transformed.z !== undefined ? transformed.z : this.#z,
    );
  }

  /**
   * Returns the cross product of this and another vector
   * @param {Vector3} that
   * @returns {Vector3}
   */
  cross(that) {
    return new Vector3(
      this.#y * that.#z - this.#z * that.#y,
      this.#z * that.#x - this.#x * that.#z,
      this.#x * that.#y - this.#y * that.#x,
    );
  }

  /**
   * @param {Vector3} that
   * @returns {number}
   */
  distanceTo(that) {
    return this.minus(that).magnitude;
  }

  /**
   * Return quotient of this divided by a scalar
   * @param {number} scalar
   * @return {Vector3}
   */
  dividedBy(scalar) {
    return new Vector3(this.#x / scalar, this.#y / scalar, this.#z / scalar);
  }

  /**
   * @returns {number}
   */
  get magnitude() {
    return Math.sqrt(this.#x ** 2 + this.#y ** 2 + this.#z ** 2);
  }

  /**
   * Return equality, within an optional tolerance for each vector component
   * @param {Vector3} that
   * @param {number} [tolerance]
   * @returns {boolean}
   */
  isEqualTo(that, tolerance = 0) {
    return areEqual(this.#x, that.#x, tolerance) && areEqual(this.#y, that.#y, tolerance) && areEqual(this.#z, that.#z, tolerance);
  }

  /**
   * Return difference
   * @param {Vector3} that
   * @returns {Vector3}
   */
  minus(that) {
    return new Vector3(this.#x - that.x, this.#y - that.y, this.#z - that.z);
  }

  /**
   * Return sum
   * @param {Vector3} that
   * @returns {Vector3}
   */
  plus(that) {
    return new Vector3(this.#x + that.x, this.#y + that.y, this.#z + that.z);
  }

  /**
   * Return product of this and a scalar
   * @param {number} scalar
   * @returns {Vector3}
  */
  times(scalar) {
    return new Vector3(this.#x * scalar, this.#y * scalar, this.#z * scalar);
  }

  toString() {
    return `(${fullDigits(this.#x)}, ${fullDigits(this.#y)}, ${fullDigits(this.#z)})`;
  }

  get x() { return this.#x; }

  get y() { return this.#y; }

  get z() { return this.#z; }
}

export default Vector3;
