const prismjs = require("prismjs");
const stripIndent = require("strip-indent");
require('prismjs/components/prism-autoit.min.js');

const languageAlias = {
    sh: "bash",
    shell: "bash",
    js: "javascript",
    ts: "typescript",
    dockerfile: "docker",
    text: "autoit",
    mathjax: "autoit"
}
function loadLanguage(lang) {
    if(!lang) {
        return Prism.languages.autoit;
    }
    lang = languageAlias[lang] || lang;
    const language = Prism.languages[lang];
    if (!language) {
        try {
            require(`prismjs/components/prism-${lang}.min.js`);
        } catch (e) {
            console.warn(e);
            return Prism.languages.autoit;
        }
        return Prism.languages[lang];
    }
    return language;
}

function highlight(code, lang) {
    if(lang === 'text') {
        return code;
    }
    const language = loadLanguage(lang) || Prism.languages.autoit;
    return prismjs.highlight(stripIndent(code), language, lang);
}
module.exports = highlight;
