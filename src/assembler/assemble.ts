import { ErrorWithLineContext, type LineContext } from "./core.ts";
import { parseUnsignedVal } from "./parser-util.ts";

type ItemRaw = { type: "label-def"; label: string } | {
  type: "hword";
  value: number;
} | {
  type: "word";
  value: number;
};
// TODO add more types

type ObjectCodeItem =
  & {
    /**
     * 0-based line index
     */
    lineIndex: number;
  }
  & ItemRaw;

type ObjectCode = {
  items: ObjectCodeItem[];
  symbolTable: Map<string, number>;
};

class Parser {
  private items: ObjectCodeItem[] = [];
  private symbolTable = new Map<string, number>();
  private addrToLineIndex = new Map<number, number>();
  private addrAt = 256;
  constructor() {}

  parse(src: string): ObjectCode {
    const lines = src.replace("\r", "").split("\n");
    for (const [lineIndex, lineComment] of lines.entries()) {
      this.parseLine(lineComment, lineIndex);
    }

    return {
      items: this.items,
      symbolTable: this.symbolTable,
    };
  }

  private parseLine(lineComment: string, lineIndex: number) {
    const commentIndex = lineComment.indexOf(";");
    const line = commentIndex === -1
      ? lineComment
      : lineComment.slice(0, commentIndex);
    // without ';'
    // const comment = commentIndex === -1
    //   ? ""
    //   : lineComment.slice(commentIndex + 1);

    if (line === "") {
      return;
    }

    const ctx = { lineIndex, lineSource: line };

    const label = line.match(/^(?<label>[A-Za-z][A-Za-z0-9_]*):/)?.groups
      ?.label;
    const cmd = line.slice(label ? label.length : 0).trim();

    if (label) {
      this.items.push({ type: "label-def", label, lineIndex });
      this.symbolTable.set(label, this.addrAt);
    }

    if (cmd.match(/^\t?align /)) {
      const n = cmd.match(/align\s+(?<num>\S+)\s*$/)?.groups?.num;
      if (!n) {
        throw new ErrorWithLineContext(
          "Invalid arguments to 'align'.",
          ctx,
        );
      }

      const nVal = parseUnsignedVal(n, ctx);
      this.align(nVal, ctx);
    } else if (cmd.match(/^\t?d[hw] /)) {
      const val = cmd.match(/d[hw]\s+(?<val>\S+)\s*$/)?.groups?.val;
      if (!val) {
        throw new ErrorWithLineContext(
          "Invalid argument to dh/dw.",
          ctx,
        );
      }

      const size = cmd.match(/^\t?dh /) ? "1" : "2";
      if (size === "1") {
        this.pushHword(parseUnsignedVal(val, ctx), ctx);
      } else {
        this.pushWord(parseUnsignedVal(val, ctx), ctx);
      }
    } else if (cmd.match(/^\t?rep /)) {
      const { val, amt } = cmd.match(/rep\s+(?<val>\S+)\s+(?<amt>\S+)\s*$/)
        ?.groups ??
        {};
      if (!val || !amt) {
        throw new ErrorWithLineContext(
          "Invalid arguments to 'rep'.",
          ctx,
        );
      }

      const amtVal = parseUnsignedVal(amt, ctx);
      for (let i = 0; i < amtVal; i++) {
        this.pushWord(parseUnsignedVal(val, ctx), ctx);
      }
    } else if (cmd.match(/^\t?str /)) {
      this.parseStr(cmd, ctx);
    } else {
      this.parseInst(cmd, ctx);
    }
  }

  private parseInst(cmd: string, ctx: LineContext) {
    cmd = cmd.trim();
    const match = cmd.trim().match(/^[a-z] ()$/);
  }

  private parseStr(cmd: string, ctx: LineContext) {
    this.align(2, ctx);
    const str = cmd.match(/\t?str (?<str>.*)/)?.groups?.str ?? "";
    const strLitChars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ,.;:~0123456789()[]?!<>/\\+*%^'£_- |nt";

    let chars = [...str];

    while (chars.length > 0) {
      let w = 0;
      for (let i = 0; i < Math.min(5, chars.length); i++) {
        const charCode = strLitChars.indexOf(chars[i]);
        if (charCode === -1) {
          throw new ErrorWithLineContext(
            `Character '${chars[i]}' is not supported in strings.`,
            ctx,
          );
        }
        w += charCode * 2 ** (6 * i);
      }
      this.pushWord(w, ctx);
      chars = chars.slice(6);
    }
  }

  pushWord(value: number, { lineIndex }: LineContext) {
    this.items.push({ type: "word", value, lineIndex });
    this.addrToLineIndex.set(this.addrAt, lineIndex);
    this.addrAt += 2;
  }

  pushHword(value: number, { lineIndex }: LineContext) {
    this.items.push({ type: "hword", value, lineIndex });
    this.addrToLineIndex.set(this.addrAt, lineIndex);
    this.addrAt++;
  }

  align(n: number, ctx: LineContext) {
    if (n < 2) {
      throw new ErrorWithLineContext(
        "Argument to 'align' must be at least 2.",
        ctx,
      );
    }

    for (let i = 0; i < n - ((this.addrAt - 1) % n) - 1; i++) {
      this.pushHword(0, ctx);
    }
  }
}

export function parseAssembly(src: string): ObjectCode {
  return new Parser().parse(src);
}

function argType(s: string): "register" | "label" | "number" | "unknown" {
  if (/^x[0-9A-F]$/.test(s)) {
    return "register";
  } else if (/^[@a-zA-Z_]/.test(s)) {
    return "label";
  } else if (/^-?[0-9]/.test(s)) {
    return "number";
  } else {
    return "unknown";
  }
}

export function linkObjectCode(objectCode: ObjectCode): Uint32Array {
  // hwords
  const machineCode: number[] = [];

  // TODO
  for (const item of objectCode.items) {
    switch (item.type) {
      case "label-def": {
        break;
      }
      case "hword": {
        machineCode.push(item.value);
        break;
      }
      case "word": {
        machineCode.push(item.value & 0xffff, item.value >>> 16);
      }
    }
  }

  const u32: number[] = [];
  // flush last hword
  u32.push(0);
  let hwBuf: number | null = null;
  for (const hword of machineCode) {
    if (hwBuf == null) {
      hwBuf = hword;
    } else {
      u32.push(hwBuf | hword << 16);
      hwBuf = null;
    }
  }

  return new Uint32Array(u32);
}

/**
 * @returns hword
 */
function parseImmidiate(objectCode: ObjectCode, imm: TODO): number {
  // TODO
}

export function assemble(src: string): Uint32Array {
  const objectCode = parseAssembly(src);
  return linkObjectCode(objectCode);
}
