import { ErrorWithLineContext, type LineContext } from "../core.ts";

const strLitChars =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ,.;:~0123456789()[]?!<>/\\+*%^'£_- |nt";
// TODO: maybe Lua is wrong.
const strLitBytes = [...new TextEncoder().encode(strLitChars)];

export function strToWords(str: string, ctx: LineContext): number[] {
  let chars = [...str];
  const words: number[] = [];

  const CHAR_CHUNK = 5;
  const BASE = CHAR_CHUNK + 1;

  while (chars.length > 0) {
    let w = 0;
    for (let i = 0; i < Math.min(CHAR_CHUNK, chars.length); i++) {
      const charCode = strLitBytes.indexOf(chars[i].charCodeAt(0));
      if (charCode === -1) {
        throw new ErrorWithLineContext(
          `Character '${chars[i]}' is not supported in strings.`,
          ctx,
        );
      }
      w += (charCode + 1) * 2 ** (BASE * i);
    }
    words.push(w);
    chars = chars.slice(CHAR_CHUNK);
  }

  return words;
}
