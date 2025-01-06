import { ErrorWithLineContext, type LineContext } from "./core.ts";
import {
  type ParsedOperand,
  parseInstruction,
  validatePseudoImmediates,
} from "./parser/parse-inst.ts";
import { strToWords } from "./parser/parse-str.ts";
import { parseUnsignedVal } from "./parser/parser-util.ts";

type ItemRaw =
  | { type: "label-def"; label: string }
  | {
    type: "hword";
    value: number;
  }
  | {
    type: "word";
    value: number;
  }
  | {
    type: "label";
    isWordBased: boolean;
    immidiateHwordCount: number;
    label: string;
  };

type ObjectCodeItem =
  & {
    ctx: LineContext;
  }
  & ItemRaw;

type ObjectCode = {
  items: ObjectCodeItem[];
  symbolTable: Map<string, number>;
  // TODO: { hwordCount: number; lineIndex: number; }
  addrToLineIndex: Map<number, number>;
};

class Parser {
  private items: ObjectCodeItem[] = [];
  private symbolTable = new Map<string, number>();
  private addrToLineIndex = new Map<number, number>();
  /**
   * hword based address
   */
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
      addrToLineIndex: this.addrToLineIndex,
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
    const cmd = line.slice(label ? (label.length + 1) : 0).trim();

    if (label) {
      this.items.push({ type: "label-def", label, ctx });
      if (this.symbolTable.has(label)) {
        throw new ErrorWithLineContext(`Duplicated label '${label}'`, ctx);
      }
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
      if (cmd.trim().length === 0) {
        return;
      }
      this.parseInstruction(cmd, ctx);
    }
  }

  private parseInstruction(cmd: string, ctx: LineContext) {
    cmd = cmd.trim();
    let inst = parseInstruction(cmd, ctx);
    validatePseudoImmediates(inst, ctx);
    // pseudo immediates
    const numPseudoImmediate = { value: 0 };

    const ldi = () => {
      // ld IMM32,{xE, xD, ...}
      this.pushHword(0xe01e - numPseudoImmediate.value, ctx);
    };
    const modify = (operandIndex: number) => {
      inst = structuredClone(inst);
      const LAST_USABLE_REGISTER = 0xe;
      inst.operands[operandIndex] = {
        type: "register",
        registerIndex: LAST_USABLE_REGISTER - numPseudoImmediate.value,
      };
      numPseudoImmediate.value++;
    };

    for (const [operandIndex, operand] of inst.operands.entries()) {
      switch (operand.type) {
        case "immediate": {
          if (operand.isPseudo) {
            ldi();
            this.pushPseudoImmidiateValue(operand, ctx);
            modify(operandIndex);
          }
          break;
        }
        case "label": {
          if (operand.isPseudo) {
            ldi();
            // TODO: is this correct?
            const info = inst.info.registers[operandIndex];
            // if (typeof info === "number") {
            //   throw new ErrorWithLineContext("Internal Error", ctx);
            // }
            this.pushLabel(
              operand,
              typeof info === "number" ? 2 : info.immidiateHwordCount,
              ctx,
            );
            modify(operandIndex);
          }
          break;
        }
        case "register": {
          // nop
          break;
        }
        default: {
          operand satisfies never;
        }
      }
    }

    // emit instruction
    let opcodeHword = inst.info.opcode;
    // handle register operands first
    for (const [patIndex, pat] of [...inst.info.argsPattern].entries()) {
      if (pat === "R") {
        const operandIndex = inst.info.registers[patIndex];
        if (typeof operandIndex !== "number") {
          throw new ErrorWithLineContext(
            "Internal error: parseInstruction",
            ctx,
          );
        }
        // DEBUG
        // console.log(inst.operands, { inst, patIndex, pat, operandIndex });

        const operand = inst.operands[patIndex] ?? (() => {
          throw new ErrorWithLineContext(
            "Internal error: parseInstruction",
            ctx,
          );
        })();

        if (operand.type !== "register") {
          throw new ErrorWithLineContext(
            "Internal error: parseInstruction",
            ctx,
          );
        }

        opcodeHword = opcodeHword |
          (operand.registerIndex << ((4 - operandIndex) * 4));
      }
    }
    this.pushHword(opcodeHword, ctx);
    // then immediates
    for (const [patIndex, pat] of [...inst.info.argsPattern].entries()) {
      if (pat === "I") {
        const operandInfo = inst.info.registers[patIndex];
        if (typeof operandInfo === "number") {
          throw new ErrorWithLineContext(
            "Internal error: parseInstruction",
            ctx,
          );
        }
        const operand = inst.operands[patIndex];
        switch (operand.type) {
          case "register": {
            // register is handled above
            throw new ErrorWithLineContext("Internal error", ctx);
          }
          case "immediate": {
            if (operand.isPseudo) {
              // pseudo immediate is handled above
              throw new ErrorWithLineContext("Internal error", ctx);
            }
            if (operandInfo.immidiateHwordCount === 1) {
              this.pushHword(operand.value, ctx);
            } else if (operandInfo.immidiateHwordCount === 2) {
              this.pushWord(operand.value, ctx);
            } else {
              throw new ErrorWithLineContext(
                "Internal error: parseInstruction",
                ctx,
              );
            }
            break;
          }
          case "label": {
            if (operand.isPseudo) {
              // pseudo immediate is handled above
              throw new ErrorWithLineContext("Internal error", ctx);
            }
            this.pushLabel(operand, operandInfo.immidiateHwordCount, ctx);
            break;
          }
          default: {
            operand satisfies never;
          }
        }
      }
    }
  }

  private parseStr(cmd: string, ctx: LineContext) {
    this.align(2, ctx);
    const str = cmd.match(/\t?str (?<str>.*)/)?.groups?.str ?? "";
    const words = strToWords(str, ctx);
    for (const word of words) {
      this.pushWord(word, ctx);
    }
  }

  pushWord(value: number, ctx: LineContext) {
    this.items.push({ type: "word", value, ctx });
    this.addrToLineIndex.set(this.addrAt, ctx.lineIndex);
    this.addrAt += 2;
  }

  pushLabel(
    label: ParsedOperand & { type: "label" },
    immidiateHwordCount: number,
    ctx: LineContext,
  ) {
    // TODO: is this correct?
    const isWordBased = label.isWordBased;
    this.items.push({
      type: "label",
      label: label.label,
      isWordBased,
      immidiateHwordCount,
      ctx,
    });
    this.addrToLineIndex.set(this.addrAt, ctx.lineIndex);
    this.addrAt += immidiateHwordCount;
  }

  pushHword(value: number, ctx: LineContext) {
    this.items.push({ type: "hword", value, ctx });
    this.addrToLineIndex.set(this.addrAt, ctx.lineIndex);
    this.addrAt++;
  }

  pushPseudoImmidiateValue(
    item: ParsedOperand & { type: "immediate" },
    ctx: LineContext,
  ) {
    this.pushWord(item.value, ctx);
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

export function linkObjectCode(objectCode: ObjectCode): Uint32Array {
  // hwords
  const machineCode: number[] = [];

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
        break;
      }
      case "label": {
        const addr = objectCode.symbolTable.get(item.label);
        if (addr == null) {
          throw new ErrorWithLineContext(
            `Label '${item.label}' not found`,
            item.ctx,
          );
        }
        const value = item.isWordBased ? (addr >> 1) : addr;
        if (item.immidiateHwordCount === 1) {
          machineCode.push(value);
        } else if (item.immidiateHwordCount === 2) {
          machineCode.push(value & 0xffff, value >>> 16);
        } else {
          throw new ErrorWithLineContext("Internal error", item.ctx);
        }
        break;
      }
      default: {
        item satisfies never;
      }
    }
  }

  // flush last hword
  machineCode.push(0);
  const u32: number[] = [];

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

export function assemble(
  src: string,
): { objectCode: ObjectCode; machineCode: Uint32Array } {
  const objectCode = parseAssembly(src);
  return { objectCode, machineCode: linkObjectCode(objectCode) };
}
