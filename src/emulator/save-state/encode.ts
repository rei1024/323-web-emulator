import type { Emulator } from "../emulator.ts";

export function encodeSaveState(
  state: ReturnType<typeof Emulator.prototype.getState>,
): Uint8Array {
  const bytes: number[] = [];

  const pushWord = (word: number) => {
    bytes.push(word & 0xff);
    bytes.push((word >>> 8) & 0xff);
    bytes.push((word >>> 16) & 0xff);
    bytes.push((word >>> 24) & 0xff);
  };

  // header
  for (const b of new TextEncoder().encode("323")) {
    bytes.push(b);
  }
  bytes.push(23);

  // flag
  bytes.push(state.flag);

  // pc
  pushWord(state.pc);

  // registers
  for (let i = 1; i < 16; i++) {
    pushWord(state.registers[i]);
  }

  // cache data TODO
  for (let i = 0; i < 256; i++) {
    bytes.push(0);
  }

  // cache addrs TODO
  for (let i = 0; i < 4; i++) {
    pushWord(0);
  }

  // cache order TODO
  bytes.push(0xe4);

  // RAM size TODO
  pushWord(0x1FFF);

  // RAM
  for (const w of state.ram) {
    pushWord(w);
  }

  return new Uint8Array(bytes);
}
