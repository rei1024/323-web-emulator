import { assertEquals } from "@std/assert/equals";
import { parseUnsignedVal } from "./parser-util.ts";
import { ErrorWithLineContext } from "./core.ts";
import { assertThrows } from "@std/assert/throws";

Deno.test("parseUnsignedVal", () => {
  const ctx = { lineIndex: 0, lineSource: "" };
  assertEquals(parseUnsignedVal("0x1234", ctx), 0x1234);
  assertEquals(parseUnsignedVal("1234", ctx), 1234);
  assertThrows(
    () => parseUnsignedVal("0x1234G", ctx),
    ErrorWithLineContext,
    "Invalid character in hexadecimal value '0x1234G'.",
  );
  assertThrows(
    () => parseUnsignedVal("1234G", ctx),
    ErrorWithLineContext,
    "'1234G' is not a valid unsigned number.",
  );
});
