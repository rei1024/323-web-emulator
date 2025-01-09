import { toUnsigned32 } from "../../util.ts";
import { Cache } from "../components/cache.ts";
import type { Emulator } from "../emulator.ts";

export function decodeSaveState(
  ss: Uint8Array,
): ReturnType<typeof Emulator.prototype.getState> {
  const header = [...new TextEncoder().encode("323"), 23];
  for (let i = 0; i < 4; i++) {
    if (ss[i] !== header[i]) {
      throw new Error("Invalid header.");
    }
  }

  if (ss.length < 346) {
    throw new Error(".3ss too small.");
  }

  let index = 3;

  function readByte() {
    index += 1;
    if (ss.length <= index) {
      throw new Error("Save state decoding failed. index=" + index);
    }
    return ss[index];
  }

  function readWord() {
    let word = readByte();
    word |= readByte() << 8;
    word |= readByte() << 16;
    word |= readByte() << 24;
    word = toUnsigned32(word);
    return word;
  }

  const flag = readByte();
  if (flag !== 0 && flag !== 1) {
    throw new Error("Malformed flag");
  }
  const pc = readWord();
  const regs = [0];

  // registers
  for (let i = 1; i < 16; i++) {
    regs.push(readWord());
  }

  // cache
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 16; j++) {
      readWord(); // TODO
    }
  }
  for (let i = 0; i < 4; i++) {
    readWord(); // TODO
  }
  const cacheOrder = readByte();

  // RAM
  const ramSize = readWord();
  if (ramSize > 128 * 64) {
    throw new Error("RAM size too big.");
  }
  const ram = new Uint32Array(128 * 64);
  for (let i = 0; i < ramSize; i++) {
    ram[i] = readWord();
  }

  return {
    stepCount: 0, // Placeholder value, replace with actual step count if available
    pc,
    registers: regs,
    flag,
    cache: new Cache().getState(), // TODO
    ram: Array.from(ram),
  };
}
