const markdownIt = require('markdown-it')
const { renderToString } = require('katex')
const taskLists = require('markdown-it-task-lists')
const attrs = require('@zeromake/markdown-it-attrs')
const admonition = require('markdown-it-admonition')
const katex = require('./markdown-it-katex')
const highlight = require('./highlight')
const lineNumbers = require('./highlight-line-numbers')
const anchor = require('./markdown-it-anchor')
const langPrefix = 'language-'

module.exports = () => {
    const md = markdownIt('commonmark', {
        langPrefix,
        highlight(code, lang) {
            let escaped = false
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
                langPrefix +
                escape(lang, true) +
                '">' +
                (escaped ? code : escape(code, true)) +
                '</code></pre>\n'
            )
        }
    })

    md.enable(['table'])


    md.use(katex, {
        render(latex, isBlock) {
            const html = renderToString(latex)
            return isBlock ? `<span class="katex-display">${html}</span>` : html
        }
    })

    // add attrs
    md.use(attrs, {
        ignore(token) {
            return token.tag === 'math'
        }
    })

    md.use(anchor, {
        class: 'headerlink anchor',
        after: true,
        inject: true
    })
    // add task
    md.use(taskLists)

    // add admonition
    md.use(admonition)

    return {
        render(text) {
            return md.render(text)
        },
        renderToc(text) {
            const env = {
                tocs: []
            }
            return [md.render(text, env), env.tocs]
        }
    }
}
