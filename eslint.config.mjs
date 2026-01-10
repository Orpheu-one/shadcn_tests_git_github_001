import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],

    rules: {
      // Desativa o erro de usar "any" (passa a ser permitido)
      "@typescript-eslint/no-explicit-any": "off",
      // Transforma variáveis não usadas em apenas avisos, sem travar o build
      "@typescript-eslint/no-unused-vars": "warn",
      // Desativa o erro de prefer-const se preferires
      "prefer-const": "warn",
    },
  },
];

export default eslintConfig;
