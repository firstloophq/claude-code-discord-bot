import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";
import n from "eslint-plugin-n";
import jsdoc from "eslint-plugin-jsdoc";

export default defineConfig([
    {
        files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
        plugins: { js, n },
        extends: ["js/recommended"],
        languageOptions: { globals: globals.browser },
    },
    tseslint.configs.strict,
    jsdoc.configs["flat/recommended-typescript-error"],
    {
        rules: {
            "n/no-process-env": ["error"],
            "no-restricted-imports": [
                "error",
                {
                    patterns: ["./*", "../*"],
                },
            ],
        },
    },
]);
