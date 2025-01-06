import { ErrorWithLineContext, type LineContext } from "../core.ts";
import { parseInteger } from "../parser/parser-util.ts";

export type InstructionInfo = {
  opcode: number;
  argsPattern: `${"R" | "I" | ""}${"R" | "I" | ""}${"R" | "I" | ""}`;
  registers: (number | { immidiateHwordCount: number })[];
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
    {
      opcode: 0xe010,
      argsPattern: "IR",
      registers: [{ immidiateHwordCount: 2 }, 4],
    },
  ],
  jmp: [
    {
      opcode: 0xe000,
      argsPattern: "I",
      registers: [{ immidiateHwordCount: 1 }],
    },
    { opcode: 0xe200, argsPattern: "R", registers: [3] },
  ],
  jnf: [
    {
      opcode: 0xe001,
      argsPattern: "I",
      registers: [{ immidiateHwordCount: 1 }],
    },
    { opcode: 0xe201, argsPattern: "R", registers: [3] },
  ],
  jf: [
    {
      opcode: 0xe002,
      argsPattern: "I",
      registers: [{ immidiateHwordCount: 1 }],
    },
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
  let { op, argStr } =
    inst.match(/^(?<op>[a-z]+)(?:\s+(?<argStr>.*))?$/)?.groups ?? {};

  argStr = argStr ?? "";

  if (!op) {
    throw new ErrorWithLineContext(
      `Malformed instruction. '${ctx.lineSource}'`,
      ctx,
    );
  }
  const infoList = instructionSet[op];
  if (infoList == null) {
    throw new ErrorWithLineContext(`Unrecognised opcode mnemonic '${op}'`, ctx);
  }
  const args = argStr.split(",").filter((x) => x !== "");
  const parsedArgs = args.map((a) => parseOperand(a, ctx));

  for (const info of infoList) {
    if (args.length !== info.argsPattern.length) {
      throw new ErrorWithLineContext(`Number of operands is incorrect`, ctx);
    }

    const isMatch = [...info.argsPattern].every((pat, i) => {
      const parsedArg = parsedArgs[i];
      // pseudo value is read from register
      const type: "R" | "I" =
        parsedArg.type === "register" || parsedArg.isPseudo ? "R" : "I";
      return (pat === type);
    });

    if (isMatch) {
      return {
        op,
        operands: parsedArgs,
        info,
      };
    }
  }

  throw new ErrorWithLineContext("Operand kind is incorrect", ctx);
}

export type ParsedOperand = {
  type: "label";
  /** with @ */
  is32: boolean;
  /**
   * with !
   */
  isPseudo: boolean;
  /** without @ */
  label: string;
} | {
  /**
   * xA
   */
  type: "register";
  /** 0x0 ~ 0xF */
  registerIndex: number;
} | {
  /**
   * 123, 0x23
   */
  type: "immediate";
  /**
   * with !
   */
  isPseudo: boolean;
  value: number;
};

export function parseOperand(
  operand: string,
  ctx: LineContext,
): ParsedOperand {
  // Register
  {
    const index = operand.match(/^x(?<index>[0-9A-F])$/)?.groups?.index;
    if (index) {
      return { type: "register", registerIndex: parseInt(index, 16) };
    }
  }

  // Label or Pseudo immidiate label
  {
    const { label, pi, is32 } = operand.match(
      /^(?<pi>!)?(?<is32>@)?(?<label>[A-Za-z][A-Za-z0-9_]+)/,
    )
      ?.groups ?? {};
    if (label) {
      return {
        type: "label",
        isPseudo: pi != null,
        is32: is32 != null,
        label: label,
      };
    }
  }

  {
    // immediate number or pseudo immidiate number
    const { num, pi } =
      operand.match(/^(?<pi>!)?(?<num>[-A-Za-z0-9_]+)/)?.groups ?? {};
    if (num) {
      return {
        type: "immediate",
        isPseudo: pi != null,
        value: parseInteger(num, ctx),
      };
    }
  }

  throw new ErrorWithLineContext(`Malformed operand '${operand}'`, ctx);
}

const isPseudoImmediate = (
  o: ParsedOperand,
) =>
  (o.type === "immediate" && o.isPseudo) ||
  (o.type === "label" && o.isPseudo);

export function validatePseudoImmediates(
  inst: ParsedInstruction,
  ctx: LineContext,
) {
  if (inst.info.argsPattern === "RRR") {
    const thirdOperand = inst.operands[2];
    if (isPseudoImmediate(thirdOperand)) {
      throw new ErrorWithLineContext(
        "Incorrect use of pseudo-immediates.",
        ctx,
      );
    }
  } else if (["in", "out", "st"].includes(inst.op)) {
    // allow 0, 1, or 2 pseudo-imms
    // no checking needed
  } else if (inst.op === "ld") {
    const secondOperand = inst.operands[1];
    if (isPseudoImmediate(secondOperand)) {
      throw new ErrorWithLineContext(
        "Second argument of ld cannot be pseudo-immediate.",
        ctx,
      );
    }
  } else {
    for (const operand of inst.operands) {
      if (isPseudoImmediate(operand)) {
        throw new ErrorWithLineContext(
          `Pseudo-immediates cannot be used for ${inst.op} instructions.`,
          ctx,
        );
      }
    }
  }
}
