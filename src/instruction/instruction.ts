import { I_ADD } from "./instruction-const.ts";

interface BaseInstruction {
  type: number;
}

interface AddInstruction extends BaseInstruction {
  type: typeof I_ADD;
  xX: number; // Register X
  xY: number; // Register Y
  xZ: number; // Register Z
}

// TODO

export type Instruction = AddInstruction;

export function parseInstructionAssembly(str: string): Instruction | Error {
  // TODO
}

export function stringifyInstructionAssembly(inst: Instruction): string {
  // TODO
}
