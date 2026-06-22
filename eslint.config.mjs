import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import boundaries from "eslint-plugin-boundaries";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends(
    "next/core-web-vitals",
    "next/typescript",
    "plugin:jsx-a11y/recommended",
    "prettier",
  ),
  {
    ignores: [".next/**", "node_modules/**", "public/**", "src/lib/api/schema.d.ts"],
  },
  // Feature boundary enforcement — prevents features from reaching into each
  // other's internals. Cross-feature imports must go through the barrel index.ts.
  //
  // Strategy: each feature folder is an element in "folder" mode so all files
  // inside it are treated as private. The only public surface is the barrel
  // (index.ts at the folder root). External consumers (app, other features)
  // may only import from the barrel — deep paths are blocked by no-private.
  {
    plugins: { boundaries },
    settings: {
      "boundaries/elements": [
        // Next.js app router — treated as a flat element, no private concept
        {
          type: "app",
          pattern: "src/app",
          mode: "folder",
        },
        // Each feature folder is an isolated element; sub-paths are private
        {
          type: "feature",
          pattern: "src/features/*",
          mode: "folder",
          capture: ["featureName"],
        },
        // Shared utilities, UI components, hooks, providers, types — no restrictions
        {
          type: "shared",
          pattern: ["src/components", "src/lib", "src/hooks", "src/providers", "src/types"],
          mode: "folder",
        },
      ],
    },
    rules: {
      // Block imports of private files from outside the owning feature folder.
      // "Private" means any file that is NOT the feature's index.ts barrel.
      // Same-feature internal imports are always fine (allowed by default).
      "boundaries/no-private": "error",
    },
  },
];

export default eslintConfig;
