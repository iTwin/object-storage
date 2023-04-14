require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  "parser": "@typescript-eslint/parser",
  "plugins": [
    "@itwin",
    "mocha"
  ],
  "extends": [
    "plugin:@itwin/itwinjs-recommended",
    "plugin:prettier/recommended"
  ],
  "parserOptions": {
    "project": "tsconfig.json",
    "sourceType": "module"
  },
  "rules": {
    "@itwin/no-internal-barrel-imports": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-module-boundary-types": [
      "error",
      {
        "allowArgumentsExplicitlyTypedAsAny": true
      }
    ],
    "no-param-reassign": [
      "error",
      {
        "props": true
      }
    ],
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-unsafe-call": "off",
    "@typescript-eslint/no-unsafe-return": "warn",
    "@typescript-eslint/no-empty-function": "off",
    "import/order": ["error", {
      "groups": [
        "builtin",
        "external",
        "internal",
        "parent",
        "sibling",
        "index",
        "object"
      ],
      "pathGroups": [
        {
          "pattern": "@itwin/cloud-agnostic-core",
          "group": "internal"
        },
        {
          "pattern": "@itwin/object-storage**",
          "group": "internal"
        },
        {
          "pattern": "@itwin/**",
          "group": "external",
          "position": "after"
        }
      ],
      "pathGroupsExcludedImportTypes": ["builtin"],
      "alphabetize": {
        "order": "asc",
        "caseInsensitive": true
      },
      "newlines-between": "always"
    }],
    "mocha/no-skipped-tests": "error",
    "mocha/no-exclusive-tests": "error"
  }
}