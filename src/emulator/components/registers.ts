/**
 * 15 32-bit Registers.
 *
 * x0, x1, ..., xE, xF
 *
 * x0 (pronounced "cross nought") is a special register;
 * attempts to read from it will always return 0,
 * and attempts to write to it do nothing.
 * Attempts to write to xF will result in the value being inverted
 * (that is, bitwise NOT). All other registers are normal.
 */
export class Registers {
  private registers = new Uint32Array(16);

  getState() {
    return Array.from(this.registers);
  }

  /** Get xi register */
  get(i: number): number {
    if (i < 0 || i > 0xF) {
      throw new Error(`Invalid register index: ${i}`);
    }
    // x0 is always 0
    if (i === 0) {
      return 0;
    }
    return this.registers[i];
  }

  /** Set xi register to value */
  set(i: number, value: number) {
    if (i < 0 || i > 0xF) {
      throw new Error(`Invalid register index: ${i}`);
    }
    if (i === 0) {
      // x0 do nothing
      return;
    }
    // xF is inverted
    this.registers[i] = i === 0xF ? ~value : value;
  }
}
