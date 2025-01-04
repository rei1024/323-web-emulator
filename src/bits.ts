export const band = (x: number, y: number) => x & y;
export const bor = (x: number, y: number) => x | y;
export const lshift = (x: number, bits: number) => x << bits;
export const rshift = (x: number, bits: number) => x >>> bits; // Use unsigned right shift
export const rrotate = (x: number, bits: number) =>
  (x >>> bits) | (x << (32 - bits));
export const lrotate = (x: number, bits: number) =>
  (x << bits) | (x >>> (32 - bits));
export const extract = (x: number, bit: number) => (x >>> bit) & 1;
