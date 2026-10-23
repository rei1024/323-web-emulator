import { test } from "../src/deps_test.ts";
import { getExpAsm } from "../src/test/data.ts";
import { EmulatorManager } from "./emulator-manager.ts";

test("EmulatorManager", () => {
  new EmulatorManager(getExpAsm(), { getKey: () => "none" });
});
