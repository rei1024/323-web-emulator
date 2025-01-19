import { getExpAsm } from "../src/test/data.ts";
import { EmulatorManager } from "./emulator-manager.ts";

Deno.test("EmulatorManager", () => {
  new EmulatorManager(getExpAsm(), { getKey: () => "none" });
});
