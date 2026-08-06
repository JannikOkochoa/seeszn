// ─── Test-Loader: Projekt-Imports auflösen ────────────────────────────────────
// Zwei Dinge, die der Bundler kann und Nodes Type-Stripping nicht:
//   1. "@/…" ist der tsconfig-Alias auf das Projektwurzelverzeichnis.
//   2. Relative Imports stehen ohne Endung; Type-Stripping verlangt ".ts".
// Beides wird hier nur ergänzt, wenn die Datei tatsächlich existiert.
// Ausschließlich für `node --test`.

import { registerHooks } from "node:module";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const ROOT = new URL("../", import.meta.url);

/** Ergänzt ".ts", wenn die Datei ohne Endung angegeben wurde. */
function withTsExtension(url) {
  if (/\.[a-z]+$/i.test(url.pathname)) return url;
  const candidate = new URL(`${url.href}.ts`);
  return existsSync(fileURLToPath(candidate)) ? candidate : url;
}

registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith("@/")) {
      const target = withTsExtension(new URL(specifier.slice(2), ROOT));
      if (existsSync(fileURLToPath(target))) return next(target.href, context);
    }
    if ((specifier.startsWith("./") || specifier.startsWith("../")) && context.parentURL) {
      const target = withTsExtension(new URL(specifier, context.parentURL));
      if (target.href !== new URL(specifier, context.parentURL).href) {
        return next(target.href, context);
      }
    }
    return next(specifier, context);
  },
});
