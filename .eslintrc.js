// .eslintrc.js
module.exports = {
    parserOptions: {
        parser: "babel-eslint",
        sourceType: "module"
    },
    extends: [
        "plugin:vue/essential"
    ],
    rules: {
        "no-console": 0,
        "no-alert": 1,
        "indent": ["warn", 4]
    }
};
