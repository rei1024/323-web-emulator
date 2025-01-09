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
    if (ss.length >= index) {
      throw new Error("Save state decoding failed. index=" + index);
    }
    return ss[index];
  }

  function readWord() {
    let word = readByte();
    word |= readByte() << 8;
    word |= readByte() << 16;
    word |= readByte() << 24;
  }

  throw new Error("TODO implement");
}
