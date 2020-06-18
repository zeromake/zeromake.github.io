const prismjs = require('prismjs')
// 设置到全局对象
global.Prism = prismjs
const stripIndent = require('strip-indent')
require('prismjs/components/prism-autoit.min.js')

const languageAlias = {
    sh: 'bash',
    shell: 'bash',
    js: 'javascript',
    ts: 'typescript',
    dockerfile: 'docker',
    text: 'autoit',
    mathjax: 'autoit',
    py: 'python'
}
function loadLanguage(lang) {
    if (!lang) {
        // eslint-disable-next-line no-undef
        return Prism.languages.autoit
    }
    lang = languageAlias[lang] || lang
    // eslint-disable-next-line no-undef
    const language = Prism.languages[lang]
    if (!language) {
        try {
            require(`prismjs/components/prism-${lang}.min.js`)
        } catch (e) {
            console.warn(e)
            // eslint-disable-next-line no-undef
            return Prism.languages.autoit
        }
        // eslint-disable-next-line no-undef
        return Prism.languages[lang]
    }
    return language
}

function highlight(code, lang) {
    if (lang === 'text') {
        return code
    }
    // eslint-disable-next-line no-undef
    const language = loadLanguage(lang) || Prism.languages.autoit
    return prismjs.highlight(stripIndent(code), language, lang)
}
module.exports = highlight
