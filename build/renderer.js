const marked = require("marked");
const util = require("hexo-util");
const prismjs = require("prismjs");
const stripIndent = require("strip-indent");
const katex = require('katex');
const lineNumbers = require('./highlight-line-numbers');
require('prismjs/components/prism-autoit.min.js');

// const highlight = util.highlight;
const stripHTML = util.stripHTML;

const MarkedRenderer = marked.Renderer;
const mathTexLine = /\$([^\$]+)\$/i;
const mathTexCode = [
    'tex',
];
// const codeStart = /<pre><code *[^>]*>/i;
// const codeEnd = /<\/code><\/pre>/i;

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
    paragraph(text) {
        let result = "";
        const dlTest = /(^|\s)(\S.+)(<br>:(\s+))(\S.+)/;
        const dl = "<dl>" + "<dt>$2</dt>" + "<dd>$5</dd>" + "</dl>";

        if (text.match(dlTest)) {
            result = text.replace(dlTest, dl);
        } else {
            result = "<p>" + text + "</p>\n";
        }
        return result;
    }
    code(code, infostring, escaped) {
        const lang = (infostring || "").match(/\S*/)[0];
        if (this.options.highlight) {
            const out = this.options.highlight(code, lang);
            if (out != null && out !== code) {
                escaped = true;
                code = out;
            }
            if(mathTexCode.indexOf(lang) !== -1) {
                return `<div class="tex-block">${code}</div>`;
            }
        }

        // code = code.replace(codeStart, '').replace(codeEnd, '');
        // console.log(code);
        code = lineNumbers(code);

        if (!lang) {
            return (
                "<pre><code class='hljs'>" +
                (escaped ? code : escape(code, true)) +
                "</code></pre>"
            );
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
    /**
     * @param {string} text
     * @returns {string}
     */
    paragraph(text) {
        text = text.replace(mathTexLine, function(sub) {
            const code = sub.substr(1, sub.length - 2);
            return katex.renderToString(code);
        });
        return '<p>' + text + '</p>\n';
    }
}

function anchorId(str, transformOption) {
    return util.slugize(str.trim(), { transform: transformOption });
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

marked.setOptions({
    //
    langPrefix: "language-",
    highlight: function(code, lang) {
        if(mathTexCode.indexOf(lang) !== -1) {
            return katex.renderToString(stripIndent(code));
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
});

module.exports = function builder(options) {
    const renderer = new Renderer();
    return {
        render(text) {
            renderer.toc = [];
            return marked(
                text,
                Object.assign(
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
                        renderer
                    },
                    options
                )
            );
        },
        toc() {
            return renderer.toc;
        },
        renderToc(text) {
            const renderer = new Renderer();
            const body = marked(
                text,
                Object.assign(
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
                        renderer
                    },
                    options
                )
            );
            return [body, renderer.toc];
        }
    };
};
