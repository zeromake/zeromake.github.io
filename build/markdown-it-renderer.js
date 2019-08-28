const markdownIt = require('markdown-it');
const katex = require('@iktakahiro/markdown-it-katex');
const highlight = require('./highlight');
const lineNumbers = require('./highlight-line-numbers');
const anchor = require('./markdown-it-anchor');
const langPrefix = 'language-';

module.exports = () => {
    const md = markdownIt('commonmark', {
        langPrefix,
        highlight(code, lang) {
            let escaped = false;
            let out = highlight(code, lang);
            if (out != null && out !== code) {
                escaped = true;
                code = out;
            }
            out = lineNumbers(code);
            if (out != null && out !== code) {
                escaped = true;
                code = out;
            }

            if (!lang) {
                return `<pre><code class='hljs'>${
                    (escaped ? code : escape(code, true))
                }</code></pre>`
            }

            const escapeLang = escape(lang, true);
            return (
                '<pre data-lang="' + escapeLang + '"><code class="hljs ' +
                langPrefix +
                escape(lang, true) +
                '">' +
                (escaped ? code : escape(code, true)) +
                "</code></pre>\n"
            );
        },
    });

    md.enable(['table']);
    md.use(anchor, {
        class: 'headerlink anchor',
        after: true,
        inject: true,
    });
    md.use(katex);
    return {
        render(text) {
            return md.render(text);
        },
        renderToc(text) {
            const env = {
                tocs: [],
            };
            return [md.render(text, env), env.tocs];
        }
    }
}
