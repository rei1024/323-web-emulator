import { expAsm } from "../src/test/data.ts";
import { EmulatorManager } from "./emulator-manager.ts";

Deno.test("EmulatorManager", () => {
  new EmulatorManager(expAsm, { getKey: () => "none" });
});
