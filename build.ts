import * as esbuild from "esbuild";
import { denoPlugins } from "jsr:@luca/esbuild-deno-loader@0.11.1";
import { serveDir } from "jsr:@std/http@^1/file-server";
// deno run --allow-env --allow-read --allow-write=. --allow-run build.ts

const entryPoint = "./app/index.ts";
const outputPath = "./dist/index.dist.js";

const target = ["chrome99", "firefox99", "safari15"];

const isDev = Deno.args.includes("dev");

await esbuild.build({
  plugins: [...denoPlugins()],
  entryPoints: [entryPoint],
  outfile: outputPath,
  bundle: true,
  format: "esm",
  minify: true,
  target: target,
  treeShaking: true,
  sourcemap: isDev ? "linked" : false,
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

const html = await Deno.readTextFile("./app/index.html");
await Deno.writeTextFile(
  "./dist/index.html",
  html.replaceAll("%__DATE__%", new Date().toISOString()),
);

await Deno.copyFile("./static/favicon.svg", "./dist/favicon.svg");

if (isDev) {
  Deno.serve((req) => serveDir(req, { fsRoot: "./dist" }));
}
