import { assertEquals } from "@std/assert/equals";
import { Emulator } from "./emulator.ts";
import { expMachineCode, textMachineCode } from "../test/data.ts";
import { OutDeviceImpl } from "./devices/devices.ts";
import { encodeSaveState } from "./save-state/encode.ts";
import { decodeSaveState } from "./save-state/decode.ts";

Deno.test("Emulator add x0,x0,xF", () => {
  const emulator = new Emulator({ machineCode: new Uint32Array([0x000f]) });
  emulator.step();
  assertEquals(
    emulator.prettyRegisters(),
    "Registers { x0:0, x1:0, x2:0, x3:0, x4:0, x5:0, x6:0, x7:0, x8:0, x9:0, xA:0, xB:0, xC:0, xD:0, xE:0, xF:4294967295 }",
  );
});

Deno.test("Emulator run exp", () => {
  const emulator = new Emulator({ machineCode: expMachineCode });
  emulator.run();
  assertEquals(
    emulator.prettyRegisters(),
    "Registers { x0:0, x1:3, x2:10, x3:0, x4:0, x5:0, x6:0, x7:0, x8:59049, x9:1, xA:0, xB:43046721, xC:267, xD:0, xE:14, xF:0 }",
  );
});

Deno.test("Emulator run text", () => {
  const outDevice = new OutDeviceImpl();
  const emulator = new Emulator({ machineCode: textMachineCode }, {
    outDevice,
  });
  for (let i = 0; i < 10000; i++) {
    const res = emulator.step();
    if (res === "halt") {
      break;
    }
  }

  assertEquals(
    outDevice.prettyDisplay(),
    [
      "                                                                ",
      "  o     o   o   o   o                                           ",
      "o o     o   o   o   o                                           ",
      "  o     o o o   o o o                                           ",
      "  o         o       o                                           ",
      "o o o       o       o                                           ",
      "                                                                ",
      "  o       o o     o                                             ",
      "o o     o       o   o                                           ",
      "  o     o o o   o o o                                           ",
      "  o     o   o       o                                           ",
      "o o o     o     o o                                             ",
      "                                                                ",
      "  o       o       o o                                           ",
      "o o     o   o   o                                               ",
      "  o     o o o   o o o                                           ",
      "  o         o   o   o                                           ",
      "o o o   o o       o                                             ",
      "                                                                ",
      "o o     o o     o o o                                           ",
      "    o       o   o                                               ",
      "  o       o     o o                                             ",
      "o       o           o                                           ",
      "o o o   o o o   o o                                             ",
      "                                                                ",
      "                                                                ",
      "                                                                ",
      "                                                                ",
      "                                                                ",
      "                                                                ",
      "                                                                ",
      "                                                                ",
    ],
  );

  const state = emulator.getState();
  const ss = encodeSaveState(state);
  const decodedState = decodeSaveState(ss);
  decodedState.stepCount = 10000;
  assertEquals(state, decodedState);
});
