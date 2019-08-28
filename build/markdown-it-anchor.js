const util = require("hexo-util");

const hasProp = Object.prototype.hasOwnProperty;

function anchorId(str, transformOption) {
    return util.slugize(str.trim(), { transform: transformOption });
}

function uniqueSlug(slug, slugs) {
    let uniq = slug
    let i = 2
    while (hasProp.call(slugs, uniq)) uniq = `${slug}-${i++}`
    slugs[uniq] = true
    return uniq
}

/**
 *
 * @param {import('markdown-it').RulerBlock} ruler
 */
function findRule(ruler, name) {
    for(const rule of ruler.__rules__) {
        if (name === rule.name) {
            return rule;
        }
    }
}

function slugify(title) {
    return encodeURIComponent(anchorId(title))
}

const defaultOption = {
    after: false,
    class: 'anchor',
    slugify,
    inject: false,
    content: '¶',
};

/**
 * @param {import('markdown-it')} md
 */
module.exports = function (md, option) {
    option = Object.assign({}, defaultOption, option);
    function anchor(state) {
        const len = state.tokens.length;
        let index = len - 2;
        let token = state.tokens[index];
        const content = [];
        while (token && token.type !== 'heading_open') {
            content.push(token.content);
            index--;
            token = state.tokens[index];
        }
        const title = content.reverse().join('');
        const env = state.env;
        const slugs = env.slugs || (env.slugs = {});
        const tocs = env.tocs;
        let id = token.attrGet('id');
        if(!id) {
            id = option.slugify(title);
        } else {
            if(option.inject) {
                token.attrSet('id', null);
            }
        }
        id = uniqueSlug(id, slugs);
        const level = token.markup.length;
        if(tocs) {
            tocs.push({
                id,
                title,
                level,
            });
        }
        const injectIndex = option.after ? len - 1 : index + 1;
        const linkStart = new state.Token('link_open', 'a', 1);
        linkStart.attrs = [
            ['class', option.class],
            ['href', `#${id}`],
        ];
        if(option.inject) {
            linkStart.attrs.push(['id', id]);
        }
        const linkClose = new state.Token('link_close', 'a', -1);
        if(option.content) {
            const text = new state.Token('html_block', '', 0);
            text.content = option.content;
            state.tokens.splice(injectIndex, 0, linkStart, text, linkClose);
        } else {
            state.tokens.splice(injectIndex, 0, linkStart, linkClose);
        }
    }

    const heading = findRule(md.block.ruler, 'heading');
    if(!heading) {
        throw new Error('Parser rule not found: heading');
    }
    // 取出方法引用，防止出现无限递归
    const headingFn = heading.fn;
    md.block.ruler.at('heading', function headingAnchor(state, startLine, endLine, silent) {
        const flag = headingFn(state, startLine, endLine, silent);
        if(flag) {
            anchor(state);
        }
        return flag;
    }, { alt: heading.alt });
};
