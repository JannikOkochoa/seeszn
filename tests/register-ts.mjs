// ─── Test-Loader: extensionslose TS-Imports auflösen ──────────────────────────
// Der App-Code importiert relativ ohne Endung (Bundler-Auflösung); Nodes
// Type-Stripping verlangt explizite ".ts"-Endungen. Dieser Hook ergänzt sie
// nur, wenn die .ts-Datei existiert. Ausschließlich für `node --test`.

import { registerHooks } from "node:module";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

registerHooks({
  resolve(specifier, context, next) {
    if (
      (specifier.startsWith("./") || specifier.startsWith("../")) &&
      !/\.[a-z]+$/i.test(specifier) &&
      context.parentURL
    ) {
      const tsPath = fileURLToPath(new URL(`${specifier}.ts`, context.parentURL));
      if (existsSync(tsPath)) return next(`${specifier}.ts`, context);
    }
    return next(specifier, context);
  },
});
