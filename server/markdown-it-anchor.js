const util = require('hexo-util')

const hasProp = Object.prototype.hasOwnProperty

function anchorId(str, transformOption) {
    return util.slugize(str.trim(), { transform: transformOption })
}

function uniqueSlug(slug, slugs) {
    let uniq = slug
    let i = 2
    while (hasProp.call(slugs, uniq)) {
        uniq = `${slug}-${i++}`
    }
    slugs[uniq] = true
    return uniq
}

function slugify(title) {
    return encodeURIComponent(anchorId(title))
}

const defaultOption = {
    after: false,
    class: 'anchor',
    slugify,
    inject: false,
    content: '¶'
}

/**
 * @param {import('markdown-it')} md
 */
module.exports = function (md, option) {
    option = Object.assign({}, defaultOption, option)
    const Token = md.core.State.prototype.Token
    md.renderer.rules.heading_open = function (tokens, idx, opts, env, self) {
        const open = tokens[idx]
        const content = []
        const index = idx + 1
        const token = tokens[index]
        const children = token.children
        for (const child of children) {
            content.push(child.content)
        }
        const title = content.join('')
        const slugs = env.slugs || (env.slugs = {})
        const tocs = env.tocs
        let id = open.attrGet('id')
        if (!id) {
            id = option.slugify(title)
        } else if (option.inject) {
            open.attrs = open.attrs.filter(i => i[0] !== 'id')
        }

        id = uniqueSlug(id, slugs)
        const level = open.markup.length
        if (tocs) {
            tocs.push({
                id,
                title,
                level
            })
        }
        const injectIndex = option.after ? children.length : 0
        const linkStart = new Token('link_open', 'a', 1)
        linkStart.attrs = [
            ['class', option.class],
            ['href', `#${id}`]
        ]
        if (option.inject) {
            linkStart.attrs.push(['id', id])
        }
        const linkClose = new Token('link_close', 'a', -1)
        if (option.content) {
            const text = new Token('html_inline', '', 0)
            text.content = option.content
            children.splice(injectIndex, 0, linkStart, text, linkClose)
        } else {
            children.splice(injectIndex, 0, linkStart, linkClose)
        }
        return md.renderer.renderToken(tokens, idx, opts, env, self)
    }
}
