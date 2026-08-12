import * as esbuild from "esbuild";

const watch = process.argv.includes("--watch");

const opts = {
  entryPoints: ["src/main.jsx"],
  bundle: true,
  outfile: "app.js",
  jsx: "automatic",
  loader: { ".js": "jsx" },
  logLevel: "info",
};

if (watch) {
  const ctx = await esbuild.context(opts);
  await ctx.watch();
  console.log("Watching for changes...");
} else {
  await esbuild.build(opts);
}
