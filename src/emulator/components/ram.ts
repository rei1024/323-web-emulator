/**
 * The RAM is word-addressable; it works in units of 32 bits.
 *
 * the RAM in the 323 is divided into 64 columns of 128 words.
 */
export class RAM {
  /**
   * 0x1FFF
   */
  private ram = new Uint32Array(128 * 64);

  private static readonly INVALID_ADDRESS_LIMIT = 128;

  private checkAddressValidity(address: number) {
    if (address < 0 || address < RAM.INVALID_ADDRESS_LIMIT) {
      throw new Error(
        `Memfault: Attempted to access invalid address ${address}`,
      );
    }
  }

  setArray(array: Uint32Array, offset?: number) {
    this.ram.set(array, offset);
  }

  get(address: number): number {
    this.checkAddressValidity(address);
    return this.ram[address];
  }

  set(address: number, value: number) {
    this.checkAddressValidity(address);
    this.ram[address] = value;
  }

  /**
   * Get hword (IMM16)
   */
  get16(hwordAddress: number): number {
    // Calculate the word address and hword offset within the word
    const wordAddress = hwordAddress >> 1; // Divide by 2 (right shift by 1)
    this.checkAddressValidity(wordAddress);
    const isUpperHWord = hwordAddress & 1; // Check if odd (1 for upper hword, 0 for lower)

    const word = this.ram[wordAddress];
    return isUpperHWord ? (word >>> 16) & 0xFFFF : word & 0xFFFF;
  }

  /**
   * Get word (IMM32)
   * The least-significant hword comes first (little-endian).
   */
  get32(hwordAddress: number): number {
    // Fetch the least significant hword
    const lowHWord = this.get16(hwordAddress);

    // Fetch the most significant hword
    const highHWord = this.get16(hwordAddress + 1);

    // Combine the hwords into a 32-bit word (little-endian)
    return (highHWord << 16) | lowHWord;
  }

  set16(hwordAddress: number, value: number) {
    // Calculate the word address and hword offset within the word
    const wordAddress = hwordAddress >> 1; // Divide by 2 (right shift by 1)
    this.checkAddressValidity(wordAddress);
    const isUpperHWord = hwordAddress & 1; // Check if odd (1 for upper hword, 0 for lower)

    // Retrieve the existing word
    const word = this.ram[wordAddress];

    // Update only the relevant hword
    const newWord = isUpperHWord
      ? (word & 0x0000FFFF) | ((value & 0xFFFF) << 16) // Update upper hword
      : (word & 0xFFFF0000) | (value & 0xFFFF); // Update lower hword

    this.ram[wordAddress] = newWord;
  }
}
