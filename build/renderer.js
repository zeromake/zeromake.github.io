const marked = require("marked");
const util = require("hexo-util");
const stripIndent = require("strip-indent");

const highlight = util.highlight;
const stripHTML = util.stripHTML;

const MarkedRenderer = marked.Renderer;

const codeStart = /<pre><code *[^>]*>/i;
const codeEnd = /<\/code><\/pre>/i;

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
            ' id="' +
            id +
            '"><a href="#' +
            id +
            '" class="headerlink anchor" title="' +
            stripHTML(text) +
            '"><span>' +
            text +
            "</span></a></h" +
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
        }

        code = code.replace(codeStart, '').replace(codeEnd, '');


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
}

function anchorId(str, transformOption) {
    return util.slugize(str.trim(), { transform: transformOption });
}
marked.setOptions({
    langPrefix: "",
    highlight: function(code, lang) {
        return highlight(stripIndent(code), {
            hljs: true,
            lang: lang,
            gutter: false,
            wrap: false
        });
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
