const js = require("@eslint/js")

module.exports = [
	js.configs.recommended,
	{
		rules: {
			"no-constant-binary-expression": "error",
			indent: [ "warn", 4, { SwitchCase: 1 } ],
			semi: [ "error", "never" ],
			"no-unused-vars": [
				"error", {
					vars: "all",
					args: "all",
					caughtErrorsIgnorePattern: "^_",
					argsIgnorePattern: "^_"
				}
			],
		},
	},
]
