import { ErrorWithLineContext, type LineContext } from "./core.ts";

const instructionSet: Record<string, {
  opcode: number;
  argsPattern: `${"R" | "I" | ""}${"R" | "I" | ""}${"R" | "I" | ""}`;
  registers: number[];
}[]> = {
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

const allOp = new Set(Object.keys(instructionSet));

export function parseInstruction(inst: string, ctx: LineContext) {
  inst = inst.trim();
  const { op, argStr } = inst.match(/^(?<op>[a-z]) (?<argStr>.*)$/)?.groups ??
    {};
  if (!op || !argStr) {
    throw new ErrorWithLineContext("Malformed instruction.", ctx);
  }
  const infoList = instructionSet[op];
  if (infoList == null) {
    throw new ErrorWithLineContext(`Unrecognised opcode mnemonic '${op}'`, ctx);
  }
  const args = argStr.split(",");

  for (const info of infoList) {
    if (args.length !== info.argsPattern.length) {
      throw new ErrorWithLineContext(`Number of operands is incorrect`, ctx);
    }
    if ([...info.argsPattern].every((pat) => TODO)) {
      // TODO: implement
    }
  }
}

// function argType(s)
// 	if s:match("^x[0-9A-F]$") then
// 		return "register"
// 	elseif s:match("^[@a-zA-Z_]") then
// 		return "label"
// 	elseif s:match("^%-?[0-9]") then
// 		return "number"
// 	else
// 		return "unknown"
// 	end
// end

function parseOperand(
  operand: string,
):
  | { type: "immediate"; value: number }
  | {
    type: "pseudo-immediate";
    value: number;
  }
  | { type: "register"; index: number }
  | { type: "unknown"; raw: string } {
  {
    const index = operand.match(/^x(?<index>[0-9A-F])$/)?.groups?.index;
    if (index) {
      return { type: "register", index: parseInt(index, 16) };
    }
  }

  // TODO
}
