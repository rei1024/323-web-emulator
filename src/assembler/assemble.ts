function assemble(assemblyCode: string): Uint32Array {
  // ... (Lexing, parsing, symbol table creation) ...

  const machineCode: number[] = [];
  // ... (Code generation) ...

  return new Uint32Array(machineCode);
}
