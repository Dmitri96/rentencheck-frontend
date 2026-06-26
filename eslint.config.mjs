import nextPlugin from "eslint-config-next";
import boundaries from "eslint-plugin-boundaries";
import prettierConfig from "eslint-config-prettier";

/*
 * ESLint flat config for Next.js 16.
 *
 * Next 16 ships `eslint-config-next` as a native flat-config array that already
 * includes Core Web Vitals + TypeScript + jsx-a11y rule presets — we no longer
 * need `FlatCompat` or a separate jsx-a11y entry. Spread the array directly.
 */
const eslintConfig = [
  ...nextPlugin,

  // Disable any stylistic rule that conflicts with Prettier
  prettierConfig,

  {
    ignores: [".next/**", "node_modules/**", "public/**", "src/lib/api/schema.d.ts"],
  },

  // ---------------------------------------------------------------------------
  // Next 16 / React 19 — new react-hooks v6 rules.
  //
  // eslint-plugin-react-hooks v6 (bundled by eslint-config-next 16) ships a
  // batch of React-Compiler-flavoured rules even when the compiler is not
  // enabled. Several are valid long-term goals but flag legitimate patterns
  // we use today (TanStack Query effects, controlled component factories,
  // etc.). They are turned off here until we either:
  //   (a) opt into React Compiler, or
  //   (b) refactor each call site in a dedicated pass.
  //
  // The pre-existing `react-hooks/exhaustive-deps` rule stays at its default.
  // ---------------------------------------------------------------------------
  {
    rules: {
      "react-hooks/immutability": "off",
      "react-hooks/incompatible-library": "off",
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/static-components": "off",
    },
  },

  // Feature boundary enforcement — features can't reach into each other's
  // internals. Cross-feature imports must go through the barrel index.ts.
  {
    plugins: { boundaries },
    settings: {
      "boundaries/elements": [
        {
          type: "app",
          pattern: "src/app",
          mode: "folder",
        },
        {
          type: "feature",
          pattern: "src/features/*",
          mode: "folder",
          capture: ["featureName"],
        },
        {
          type: "shared",
          pattern: ["src/components", "src/lib", "src/hooks", "src/providers", "src/types"],
          mode: "folder",
        },
      ],
    },
    rules: {
      // Block deep-path imports of feature internals from outside that feature.
      // "Private" = anything that isn't the feature's index.ts barrel.
      "boundaries/no-private": "error",
    },
  },
];

export default eslintConfig;
