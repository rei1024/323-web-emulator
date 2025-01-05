import { assertEquals } from "@std/assert/equals";
import { Emulator } from "./emulator.ts";

Deno.test("Emulator add x0,x0,xF", () => {
  const emulator = new Emulator(new Uint32Array([0x000f]));
  emulator.step();
  assertEquals(
    emulator.prettyRegisters(),
    "Registers { x0:0, x1:0, x2:0, x3:0, x4:0, x5:0, x6:0, x7:0, x8:0, x9:0, xA:0, xB:0, xC:0, xD:0, xE:0, xF:4294967295 }",
  );
});

const exp = new Uint32Array([
  0x0003e011,
  0xe0120000,
  0x0000000a,
  0x010be01c,
  0xe0000000,
  0xe01e0114,
  0x0000000e,
  0xe01ea8e1,
  0x0000000e,
  0xeeeea0e1,
  0x0001e019,
  0xd0980000,
  0xd02ad01b,
  0xffffe01e,
  0xda00ffff,
  0xc9a0e2c1,
  0x0123e001,
  0x2bbb2b88,
  0xe0007aea,
  0x0000011d,
]);

Deno.test("Emulator run exp", () => {
  const emulator = new Emulator(exp);
  emulator.run();
  assertEquals(
    emulator.prettyRegisters(),
    "Registers { x0:0, x1:3, x2:10, x3:0, x4:0, x5:0, x6:0, x7:0, x8:59049, x9:1, xA:0, xB:43046721, xC:267, xD:0, xE:14, xF:0 }",
  );
});
