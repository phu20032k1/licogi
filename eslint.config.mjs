import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // LICOGI uses explicit client-side loaders that intentionally set loading/data state
      // from effects. The React 19 advisory rule treats this established fetch pattern as
      // an error even though the updates happen around async I/O. Keep correctness rules
      // enabled while allowing these data-loading effects.
      "react-hooks/set-state-in-effect": "off",
      // Operational dashboards intentionally derive overdue / due-soon status from the
      // current browser clock while rendering. Those values are display-only and do not
      // participate in state mutation, so permit clock reads in dashboard calculations.
      "react-hooks/purity": "off",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;