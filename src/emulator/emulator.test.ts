import { assertEquals } from "@std/assert/equals";
import { Emulator } from "./emulator.ts";

Deno.test("Emulator add x0,x0,xF", () => {
  const emulator = new Emulator(new Uint32Array([0x000f]));
  emulator.step();
  assertEquals(emulator.getState().registers, [
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0xffffffff,
  ]);
});
