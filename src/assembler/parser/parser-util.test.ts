import { assertEquals } from "@std/assert/equals";
import { parseInteger, parseUnsignedVal } from "./parser-util.ts";
import { ErrorWithLineContext } from "../core.ts";
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

Deno.test("parseInteger", () => {
  const ctx = { lineIndex: 0, lineSource: "" };

  assertEquals(parseInteger("123", ctx), 123);
  assertEquals(parseInteger("0xabc", ctx), 0xabc);

  assertEquals(parseInteger("-1", ctx), 4294967295);
  assertEquals(parseInteger("-2", ctx), 4294967294);
});
