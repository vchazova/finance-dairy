import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  // Start from the official Next.js flat config (core-web-vitals + TS support).
  ...nextCoreWebVitals,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
];

export default eslintConfig;
