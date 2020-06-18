const marked = require('marked')
const util = require('hexo-util')
const katex = require('katex')
const highlight = require('./highlight')
const lineNumbers = require('./highlight-line-numbers')
require('prismjs/components/prism-autoit.min.js')
const lruCached = require('./lru-cache')

const stripHTML = util.stripHTML

const MarkedRenderer = marked.Renderer
const mathLine = /\$([^$]+)\$/gi
const mathBlock = /^\s*\$\$([^$]+)\$\$\s*$/
const dlTest = /(^|\s)(\S.+)(<br>:(\s+))(\S.+)/
// const codeStart = /<pre><code *[^>]*>/i
// const codeEnd = /<\/code><\/pre>/i

const options = {
    throwOnError: false,
    displayMode: false,
    maxSize: 5
}
const blockOptions = {
    throwOnError: false,
    displayMode: true,
    maxSize: 5
}

const katexRenderToString = lruCached((s, block) => {
    return katex.renderToString(s, block ? blockOptions : options)
}, {
    maxSize: 30
})

const decodeTable = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&#39;': `'`,
    '&quot;': `'`
}
const decodeReg = /&(\w+|#\d+);/gi
/**
 *
 * @param {string} s
 * @returns {string}
 */
const htmlUescape = (s) => {
    return s.replace(decodeReg, (key) => {
        const v = decodeTable[key]
        if (v) {
            return v
        }
        return key
    })
}

class Renderer extends MarkedRenderer {
    constructor() {
        super()
        this._headingId = {}
        this.toc = []
    }
    heading(text, level) {
        const transformOption = this.options.modifyAnchors
        let id = anchorId(stripHTML(text), transformOption)
        const headingId = this._headingId

        // Add a number after id if repeated
        if (headingId[id]) {
            id += '-' + headingId[id]++
        } else {
            headingId[id] = 1
        }
        const title = stripHTML(text)
        this.toc.push({
            level,
            id,
            title
        })
        // add headerlink
        return (
            '<h' +
            level +
            '>' +
            '<span class="header-text">' +
            text +
            '</span>' +
            '<a id="' +
            id +
            '" href="#' +
            id +
            '" class="headerlink anchor" title="' +
            stripHTML(text) +
            '"></a>' +
            '</h' +
            level +
            '>'
        )
    }
    link(href, title, text) {
        let prot

        if (this.options.sanitize) {
            try {
                prot = decodeURIComponent(unescape(href))
                    .replace(/[^\w:]/g, '')
                    .toLowerCase()
            } catch (e) {
                return ''
            }

            if (
                prot.indexOf('javascript:') === 0 ||
                prot.indexOf('vbscript:') === 0 ||
                prot.indexOf('data:') === 0
            ) {
                return ''
            }
        }

        if (!this.options.autolink && href === text && title == null) {
            return href
        }

        let out = '<a href="' + href + '"'

        if (title) {
            out += ' title="' + title + '"'
        }

        out += '>' + text + '</a>'
        return out
    }
    code(code, infostring, escaped) {
        const lang = (infostring || '').match(/\S*/)[0]
        let out = highlight(code, lang)
        if (out != null && out !== code) {
            escaped = true
            code = out
        }
        out = lineNumbers(code)
        if (out != null && out !== code) {
            escaped = true
            code = out
        }

        if (!lang) {
            return `<pre><code class='hljs'>${
                (escaped ? code : escape(code, true))
            }</code></pre>`
        }

        const escapeLang = escape(lang, true)
        return (
            '<pre data-lang="' + escapeLang + '"><code class="hljs ' +
            this.options.langPrefix +
            escape(lang, true) +
            '">' +
            (escaped ? code : escape(code, true)) +
            '</code></pre>\n'
        )
    }
    paragraph(text) {
        const mathCode = mathBlock.exec(text)
        if (mathCode) {
            const code = htmlUescape(mathCode[1].replace(/(<br>)|(<\/br>)/ig, '\n'))
            return `<span class='katex-display'>${katexRenderToString(code, true)}</span>`
        }

        let result = ''
        const dl = '<dl><dt>$2</dt><dd>$5</dd></dl>'

        if (text.match(dlTest)) {
            result = text.replace(dlTest, dl)
        } else {
            result = `<p>${text}</p>\n`
        }
        return result
    }
    text(text) {
        text = text.replace(mathLine, function (sub) {
            const code = sub.substr(1, sub.length - 2)
            return katexRenderToString(code, false)
        })
        return text
    }
}

function anchorId(str, transformOption) {
    return util.slugize(str.trim(), { transform: transformOption })
}

marked.setOptions({
    langPrefix: 'language-',
    highlight: null
})

module.exports = function builder(options) {
    const renderer = new Renderer()
    const opt = Object.assign(
        {
            gfm: true,
            pedantic: false,
            sanitize: false,
            tables: true,
            breaks: true,
            smartLists: true,
            smartypants: true,
            modifyAnchors: '',
            autolink: true,
            renderer
        },
        options
    )
    return {
        render(text) {
            renderer.toc = []
            return marked(
                text,
                opt
            )
        },
        toc() {
            return renderer.toc
        },
        renderToc(text) {
            const renderer = new Renderer()
            const body = marked(
                text,
                Object.assign({}, opt, {
                    renderer
                })
            )
            return [body, renderer.toc]
        }
    }
}
