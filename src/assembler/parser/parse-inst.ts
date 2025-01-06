import { ErrorWithLineContext, type LineContext } from "../core.ts";
import { parseInteger } from "../parser/parser-util.ts";

export type InstructionInfo = {
  opcode: number;
  argsPattern: `${"R" | "I" | ""}${"R" | "I" | ""}${"R" | "I" | ""}`;
  registers: number[];
};

export const instructionSet: Record<string, InstructionInfo[]> = {
  add: [{ opcode: 0x0000, argsPattern: "RRR", registers: [2, 3, 4] }],
  sub: [{ opcode: 0x1000, argsPattern: "RRR", registers: [3, 2, 4] }],
  mul: [{ opcode: 0x2000, argsPattern: "RRR", registers: [2, 3, 4] }],
  div: [{ opcode: 0x3000, argsPattern: "RRR", registers: [2, 3, 4] }],
  mod: [{ opcode: 0x4000, argsPattern: "RRR", registers: [2, 3, 4] }],
  shf: [{ opcode: 0x7000, argsPattern: "RRR", registers: [2, 3, 4] }],
  rot: [{ opcode: 0x8000, argsPattern: "RRR", registers: [2, 3, 4] }],
  sha: [{ opcode: 0x9000, argsPattern: "RRR", registers: [2, 3, 4] }],
  or: [{ opcode: 0xb000, argsPattern: "RRR", registers: [2, 3, 4] }],
  and: [{ opcode: 0xc000, argsPattern: "RRR", registers: [2, 3, 4] }],
  xor: [{ opcode: 0xd000, argsPattern: "RRR", registers: [2, 3, 4] }],
  in: [{ opcode: 0xe300, argsPattern: "RR", registers: [3, 4] }],
  out: [{ opcode: 0xa001, argsPattern: "RR", registers: [2, 3] }],
  st: [{ opcode: 0xa000, argsPattern: "RR", registers: [3, 2] }],
  ld: [
    { opcode: 0xe100, argsPattern: "RR", registers: [3, 4] },
    { opcode: 0xe010, argsPattern: "IR", registers: [2, 4] },
  ],
  jmp: [
    { opcode: 0xe000, argsPattern: "I", registers: [1] },
    { opcode: 0xe200, argsPattern: "R", registers: [3] },
  ],
  jnf: [
    { opcode: 0xe001, argsPattern: "I", registers: [1] },
    { opcode: 0xe201, argsPattern: "R", registers: [3] },
  ],
  jf: [
    { opcode: 0xe002, argsPattern: "I", registers: [1] },
    { opcode: 0xe202, argsPattern: "R", registers: [3] },
  ],
  hlt: [{ opcode: 0xeeee, argsPattern: "", registers: [] }],
};

export type ParsedInstruction = {
  /** `add`, `sub`, ... */
  op: string;
  operands: ParsedOperand[];
  info: InstructionInfo;
};

export function parseInstruction(
  inst: string,
  ctx: LineContext,
): ParsedInstruction {
  inst = inst.trim();
  const { op, argStr } = inst.match(/^(?<op>[a-z]+) (?<argStr>.*)$/)?.groups ??
    {};

  if (!op || !argStr) {
    throw new ErrorWithLineContext("Malformed instruction.", ctx);
  }
  const infoList = instructionSet[op];
  if (infoList == null) {
    throw new ErrorWithLineContext(`Unrecognised opcode mnemonic '${op}'`, ctx);
  }
  const args = argStr.split(",");
  const parsedArgs = args.map((a) => parseOperand(a, ctx));

  for (const info of infoList) {
    if (args.length !== info.argsPattern.length) {
      throw new ErrorWithLineContext(`Number of operands is incorrect`, ctx);
    }
    if (
      [...info.argsPattern].every((pat, i) => {
        const parsedArg = parsedArgs[i];
        return (pat === "R" && parsedArg.type === "register") ||
          (pat === "I" && parsedArg.type !== "register");
      })
    ) {
      return {
        op,
        operands: parsedArgs,
        info,
      };
    }
  }

  throw new ErrorWithLineContext("Operand kind is incorrect", ctx);
}

export type ParsedOperand =
  | {
    /**
     * 123
     */
    type: "immediate";
    value: number;
  }
  | {
    /**
     * !0x00
     */
    type: "pseudo-immediate";
    value: number;
  }
  | {
    /**
     * !@abc
     */
    type: "pseudo-immediate-label";
    // without !
    label: string;
  }
  | {
    /**
     * xn
     */
    type: "register";
    index: number;
  }
  | {
    type: "label";
    /**
     * without @
     */
    label: string;
  };

export function parseOperand(
  operand: string,
  ctx: LineContext,
): ParsedOperand {
  // Register
  {
    const index = operand.match(/^x(?<index>[0-9A-F])$/)?.groups?.index;
    if (index) {
      return { type: "register", index: parseInt(index, 16) };
    }
  }

  // Label or Pseudo immidiate label
  {
    const { label, pi } = operand.match(
      /^(?<pi>!?)@(?<label>[A-Za-z][A-Za-z0-9_]+)/,
    )
      ?.groups ?? {};
    if (label) {
      if (pi) {
        return { type: "pseudo-immediate-label", label };
      } else {
        return { type: "label", label };
      }
    }
  }

  {
    // immediate number or pseudo immidiate number
    const { num, pi } =
      operand.match(/^(?<pi>!?)(?<num>[-A-Za-z0-9_]+)/)?.groups ?? {};
    if (num) {
      if (pi) {
        return {
          type: "pseudo-immediate",
          value: parseInteger(num, ctx),
        };
      } else {
        return {
          type: "immediate",
          value: parseInteger(num, ctx),
        };
      }
    }
  }

  throw new ErrorWithLineContext(`Malformed operand '${operand}'`, ctx);
}
