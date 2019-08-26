const marked = require("marked");
const util = require("hexo-util");
const prismjs = require("prismjs");
const stripIndent = require("strip-indent");
const katex = require('katex');
const lineNumbers = require('./highlight-line-numbers');
require('prismjs/components/prism-autoit.min.js');
const lruCached = require('./lru-cache');

const stripHTML = util.stripHTML;

const MarkedRenderer = marked.Renderer;
const mathLine = /\$([^\$]+)\$/gi;
const mathBlock = /^\s*\$\$([^\$]+)\$\$\s*$/;
const dlTest = /(^|\s)(\S.+)(<br>:(\s+))(\S.+)/;
// const codeStart = /<pre><code *[^>]*>/i;
// const codeEnd = /<\/code><\/pre>/i;

const katexRenderToString = lruCached(katex.renderToString, {
    maxSize: 30
});


const highlight = function(code, lang) {
    if(mathTexCode.indexOf(lang) !== -1) {
        return katexRenderToString(stripIndent(code));
    }
    const language = loadLanguage(lang) || Prism.languages.autoit;
    return prismjs.highlight(stripIndent(code), language, lang);
    // return highlight(stripIndent(code), {
    //     hljs: true,
    //     lang: lang,
    //     gutter: false,
    //     wrap: false
    // });
}

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

class Renderer extends MarkedRenderer {
    constructor() {
        super();
        this._headingId = {};
        this.toc = [];
    }
    heading(text, level) {
        const transformOption = this.options.modifyAnchors;
        let id = anchorId(stripHTML(text), transformOption);
        const headingId = this._headingId;

        // Add a number after id if repeated
        if (headingId[id]) {
            id += "-" + headingId[id]++;
        } else {
            headingId[id] = 1;
        }
        const title = stripHTML(text);
        this.toc.push({
            level,
            id,
            title
        });
        // add headerlink
        return (
            "<h" +
                level +
            '>' +
            '<span class="header-text">' +
                text +
            "</span>" +
            '<a id="' +
                id +
            '" href="#' +
                id +
            '" class="headerlink anchor" title="' +
                stripHTML(text) +
            '"></a>' +
            "</h" +
                level +
            ">"
        );
    }
    link(href, title, text) {
        let prot;

        if (this.options.sanitize) {
            try {
                prot = decodeURIComponent(unescape(href))
                    .replace(/[^\w:]/g, "")
                    .toLowerCase();
            } catch (e) {
                return "";
            }

            if (
                prot.indexOf("javascript:") === 0 ||
                prot.indexOf("vbscript:") === 0 ||
                prot.indexOf("data:") === 0
            ) {
                return "";
            }
        }

        if (!this.options.autolink && href === text && title == null) {
            return href;
        }

        let out = '<a href="' + href + '"';

        if (title) {
            out += ' title="' + title + '"';
        }

        out += ">" + text + "</a>";
        return out;
    }
    code(code, infostring, escaped) {
        const lang = (infostring || "").match(/\S*/)[0];
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
            this.options.langPrefix +
            escape(lang, true) +
            '">' +
            (escaped ? code : escape(code, true)) +
            "</code></pre>\n"
        );
    }
    paragraph(text) {
        const mathCode = mathBlock.exec(text);
        if(mathCode) {
            const code = mathCode[1].replace(/(<br>)|(<\/br>)/ig, '\n');
            return `<div class="tex-block">${katexRenderToString(code)}</div>`;
        }

        let result = "";
        const dl = "<dl><dt>$2</dt><dd>$5</dd></dl>";

        if (text.match(dlTest)) {
            result = text.replace(dlTest, dl);
        } else {
            result = `<p>${text}</p>\n`;
        }
        return result;
    }
    text(text) {
        text = text.replace(mathLine, function(sub) {
            const code = sub.substr(1, sub.length - 2);
            return katexRenderToString(code);
        });
        return text;
    }
}

function anchorId(str, transformOption) {
    return util.slugize(str.trim(), { transform: transformOption });
}


marked.setOptions({
    langPrefix: "language-",
    highlight: null,
});

module.exports = function builder(options) {
    const renderer = new Renderer();
    const opt = Object.assign(
        {
            gfm: true,
            pedantic: false,
            sanitize: false,
            tables: true,
            breaks: true,
            smartLists: true,
            smartypants: true,
            modifyAnchors: "",
            autolink: true,
            renderer,
        },
        options,
    );
    return {
        render(text) {
            renderer.toc = [];
            return marked(
                text,
                opt,
            );
        },
        toc() {
            return renderer.toc;
        },
        renderToc(text) {
            const renderer = new Renderer();
            const body = marked(
                text,
                Object.assign({}, opt, {
                    renderer
                }),
            );
            return [body, renderer.toc];
        }
    };
};
