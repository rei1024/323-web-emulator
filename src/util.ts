const buf = new Uint32Array([0]);

export function toUnsigned32(x: number) {
  buf[0] = x;
  return buf[0];
}
