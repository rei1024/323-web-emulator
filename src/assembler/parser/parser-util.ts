import { ErrorWithLineContext, type LineContext } from "../core.ts";

export function parseUnsignedVal(v: string, ctx: LineContext): number {
  // Values are all <= 32-bit. TypeScript uses 64-bit floats (doubles),
  // so it can represent these numbers without precision loss.

  if (v.startsWith("0x")) {
    // Hexadecimal case
    if (v.length > 10) {
      throw new ErrorWithLineContext(
        `Hexadecimal value '${v}' too long.`,
        ctx,
      );
    }
    if (/^0x.*[^0-9a-fA-F]/.test(v)) {
      throw new ErrorWithLineContext(
        `Invalid character in hexadecimal value '${v}'.`,
        ctx,
      );
    }
    return parseInt(v.substring(2), 16);
  } else if (/^[0-9]+$/.test(v)) {
    // Decimal case
    return parseInt(v, 10);
  } else {
    throw new ErrorWithLineContext(
      `'${v}' is not a valid unsigned number.`,
      ctx,
    );
  }
}

export function parseInteger(v: string, ctx: LineContext): number {
  if (v.startsWith("-")) {
    // Apply bitwise AND with 0xffffffff to mimic 32-bit signed behavior
    return toUnsigned32((-parseUnsignedVal(v.slice(1), ctx)) & 0xffffffff);
  } else {
    return parseUnsignedVal(v, ctx);
  }
}

const buf = new Uint32Array([0]);

function toUnsigned32(x: number) {
  buf[0] = x;
  return buf[0];
}
