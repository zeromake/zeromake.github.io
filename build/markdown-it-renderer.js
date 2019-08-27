const markdownIt = require('markdown-it');
const katex = require('@iktakahiro/markdown-it-katex');
const highlight = require('./highlight');
const lineNumbers = require('./highlight-line-numbers');
const anchor = require('./markdown-it-anchor');

const util = require("hexo-util");
const stripHTML = util.stripHTML;


function anchorId(str, transformOption) {
    return util.slugize(str.trim(), { transform: transformOption });
}

const langPrefix = 'language-';

module.exports = () => {
    let tocs = [];
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
    md.use(anchor);
    md.use(katex);
    md.renderer.rules.heading_close = (tokens, idx) => {
        const token = tokens[idx];
        const content = [];
        let index = idx - 1;
        let t = tokens[index];
        while(t && t.type !== 'heading_open') {
            content.push(t.children.reduce((c, i) => {
                if(i.type === 'text' || i.type === 'code_inline') {
                    c += i.content;
                }
                return c;
            }, ''));
            index--;
            t = tokens[index];
        }
        const title = stripHTML(content.reverse().join(''));
        const id = encodeURIComponent(anchorId(title));
        const level = token.markup.trim().length;
        tocs.push({
            id,
            title,
            level,
        });
        return `<a id="${id}" href="#${id}" class="headerlink anchor"></a></${token.tag}>`;
    };
    return {
        render(text) {
            return md.render(text);
        },
        renderToc(text) {
            tocs = [];
            return [md.render(text), tocs];
        }
    }
}
