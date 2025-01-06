function boolToInt(b: boolean): 0 | 1 {
  return b ? 1 : 0;
}

export class Func {
  /**
   * xZ = xX + xY; flag = overflow
   * @param x unsigned 32-bit integer
   * @param y unsigned 32-bit integer
   * @returns xZ (unsigned 32-bit integer) and flag
   */
  static add(x: number, y: number): { value: number; flag: 0 | 1 } {
    const value = x + y;
    return {
      value: value >>> 0,
      flag: boolToInt(value > 0xffffffff),
    };
  }

  /**
   * xZ = xY - xX; flag = xY >= xX
   * @param x unsigned 32-bit integer to subtract (xX)
   * @param y unsigned 32-bit integer from which to subtract (xY)
   * @returns xZ (unsigned 32-bit integer) and flag
   */
  static sub(x: number, y: number): { value: number; flag: 0 | 1 } {
    const flag = y >= x;
    const value = (y - x) >>> 0;
    return {
      value: value,
      flag: boolToInt(flag),
    };
  }

  /**
   * xZ = xX * xY; flag = overflow
   * @param x unsigned 32-bit integer
   * @param y unsigned 32-bit integer
   * @returns xZ (unsigned 32-bit integer) and flag
   */
  static mul(x: number, y: number): { value: number; flag: 0 | 1 } {
    const product = x * y;
    const value = product >>> 0;
    const flag = product > 0xffffffff;
    return {
      value: value,
      flag: boolToInt(flag),
    };
  }
  /**
   * xZ = xX / xY; flag = INZ (non-zero result)
   * @param x unsigned 32-bit integer (dividend)
   * @param y unsigned 32-bit integer (divisor)
   * @returns xZ (unsigned 32-bit integer) and flag (0 if result is zero, 1 if result is non-zero)
   */
  static div(x: number, y: number): { value: number; flag: 0 | 1 } {
    if (y === 0) {
      return {
        value: 0xffffffff, // -1 in 32-bit unsigned form
        flag: 1, // Division by 0 always results in a non-zero flag
      };
    }
    const value = Math.floor(x / y) >>> 0;
    const flag = boolToInt(value !== 0); // INZ: 1 if result has non-zero bits
    return {
      value: value,
      flag: flag,
    };
  }

  /**
   * xZ = xX % xY; flag = INZ (non-zero result)
   * @param x unsigned 32-bit integer (dividend)
   * @param y unsigned 32-bit integer (divisor)
   * @returns xZ (unsigned 32-bit integer) and flag (0 if result is zero, 1 if result is non-zero)
   */
  static mod(x: number, y: number): { value: number; flag: 0 | 1 } {
    const value = y === 0 ? x : x % y;
    const flag = boolToInt(value !== 0); // INZ: 1 if result has non-zero bits
    return {
      value: value >>> 0,
      flag: flag,
    };
  }

  /**
   * xZ = xX shifted logically by xY
   * xY is a signed two's-complement integer (6 bits) representing the shift amount.
   * Positive xY means shift to the left, negative xY means shift to the right.
   * @param x unsigned 32-bit integer (value to shift)
   * @param y unsigned 32-bit integer (shift amount, rightmost 6 bits)
   * @returns xZ (unsigned 32-bit integer)
   */
  static shf(x: number, y: number): { value: number; flag: 0 } {
    const shiftAmountRaw = y & 0x3f;
    const shiftAmount = (shiftAmountRaw & 0x20)
      ? shiftAmountRaw - 0x40
      : shiftAmountRaw;
    const value = (shiftAmount >= 0)
      ? (x << shiftAmount)
      : (x >>> -shiftAmount);
    return {
      value: value,
      flag: 0, // flag is always 0
    };
  }

  /**
   * xZ = xX rotated by xY
   * @param x unsigned 32-bit integer (value to rotate)
   * @param y unsigned 32-bit integer (rotate amount)
   * @returns xZ (unsigned 32-bit integer) with flag always 0
   */
  static rot(x: number, y: number): { value: number; flag: 0 } {
    const shiftAmountRaw = y & 0x3f;
    const shiftAmount = (shiftAmountRaw & 0x20)
      ? shiftAmountRaw - 0x40
      : shiftAmountRaw;

    const value = shiftAmount >= 0
      ? ((x << shiftAmount) | (x >>> (32 - shiftAmount)))
      : ((x >>> -shiftAmount) | (x << (32 + shiftAmount))) >>> 0;

    return {
      value: value,
      flag: 0, // flag is always 0
    };
  }

  /**
   * xZ = xX shifted arithmetically by xY
   * Rightmost 6 bits of xY are used as a signed shift amount.
   * @param x unsigned 32-bit integer
   * @param y unsigned 32-bit integer (shift amount)
   * @returns xZ (unsigned 32-bit integer) with flag always 0
   */
  static sha(x: number, y: number): { value: number; flag: 0 } {
    const shiftAmountRaw = y & 0x3f;
    const shiftAmount = (shiftAmountRaw & 0x20)
      ? shiftAmountRaw - 0x40
      : shiftAmountRaw;

    const value = shiftAmount >= 0
      ? (x << shiftAmount) >>> 0
      : (x >> -shiftAmount) >>> 0; // Arithmetic shift: preserves sign bit on right shift

    return {
      value: value,
      flag: 0, // flag is always 0
    };
  }

  /**
   * xZ = xX | xY; flag = INZ
   */
  static or(x: number, y: number): { value: number; flag: 0 | 1 } {
    const value = x | y;
    return {
      value: value,
      flag: boolToInt(value !== 0),
    };
  }

  /**
   * xZ = xX & xY; flag = INZ
   */
  static and(x: number, y: number): { value: number; flag: 0 | 1 } {
    const value = x & y;
    return {
      value: value,
      flag: boolToInt(value !== 0),
    };
  }

  static xor(x: number, y: number): { value: number; flag: 0 | 1 } {
    const value = x ^ y;
    return {
      value: value,
      flag: boolToInt(value !== 0),
    };
  }
}
