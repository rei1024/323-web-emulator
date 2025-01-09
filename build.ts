import * as esbuild from "esbuild";
import { denoPlugins } from "jsr:@luca/esbuild-deno-loader@0.11.1";
import { serveDir } from "jsr:@std/http@^1/file-server";
// deno run --allow-env --allow-read --allow-write=. --allow-run build.ts

const entryPoint = "./app/index.ts";
const outputPath = "./dist/index.dist.js";

const target = ["chrome99", "firefox99", "safari15"];

await esbuild.build({
  plugins: [...denoPlugins()],
  entryPoints: [entryPoint],
  outfile: outputPath,
  bundle: true,
  format: "esm",
  minify: true,
  target: target,
  treeShaking: true,
});

await esbuild.build({
  entryPoints: ["./app/style.css"],
  outfile: "./dist/style.min.css",
  minify: true,
  target: target,
});

esbuild.stop();

const fileInfo = await Deno.stat(outputPath);
const file = await Deno.open(outputPath);
const compressed = await new Response(
  file.readable.pipeThrough(new CompressionStream("gzip")),
).arrayBuffer();

console.log(`${entryPoint} -> ${outputPath}`);
console.log(
  fileInfo.size.toLocaleString() + " bytes" +
    `\n${compressed.byteLength.toLocaleString()} bytes (gzip)`,
);

await Deno.copyFile("./app/index.html", "./dist/index.html");
await Deno.copyFile("./static/favicon.svg", "./dist/favicon.svg");

if (Deno.args.includes("with-serve")) {
  Deno.serve((req) => serveDir(req, { fsRoot: "./dist" }));
}
