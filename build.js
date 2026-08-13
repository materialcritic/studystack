import * as esbuild from "esbuild";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

const watch = process.argv.includes("--watch");

// index.html used to carry a hand-bumped `?v=21` on the script tag. Forgetting
// to bump it means the browser (and the service worker cache) keeps serving a
// stale bundle, which looks exactly like "my fix didn't work". Derive it from
// the bundle's own contents instead.
async function stampHtml() {
  const bundle = await readFile("app.js");
  const hash = createHash("sha256").update(bundle).digest("hex").slice(0, 8);
  const html = await readFile("index.html", "utf8");
  const stamped = html.replace(
    /(<script src="\/app\.js)(\?v=[^"]*)?(")/,
    `$1?v=${hash}$3`
  );
  if (stamped !== html) {
    await writeFile("index.html", stamped);
    console.log(`index.html -> app.js?v=${hash}`);
  }
}

const opts = {
  entryPoints: ["src/main.jsx"],
  bundle: true,
  outfile: "app.js",
  jsx: "automatic",
  loader: { ".js": "jsx" },
  logLevel: "info",
  plugins: [
    {
      name: "stamp-html",
      setup(build) {
        build.onEnd((result) => {
          if (!result.errors.length) return stampHtml();
        });
      },
    },
  ],
};

if (watch) {
  const ctx = await esbuild.context(opts);
  await ctx.watch();
  console.log("Watching for changes...");
} else {
  await esbuild.build(opts);
}
