const js = require("@eslint/js");
const eslintConfigPrettier = require("eslint-config-prettier");
const globals = require("globals");

module.exports = [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "commonjs",
            globals: {
                ...globals.node
            }
        },
        rules: {
            "no-console": "warn",
            "no-unused-vars": "warn"
        }
    },
    eslintConfigPrettier
];