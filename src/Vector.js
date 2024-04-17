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
   * @returns {Vector3}
   */
  copy() {
    return new Vector3(this.#x, this.#y, this.#z);
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
    return `(${this.#x}, ${this.#y}, ${this.#z})`;
  }

  get x() { return this.#x; }

  get y() { return this.#y; }

  get z() { return this.#z; }
}

export default Vector3;
