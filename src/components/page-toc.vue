<script>
function renderTocs (h, tocs, index) {
    const renderToc = []
    const len = tocs.length
    let i = index
    for (; i < len; i++) {
        const tocItem = tocs[i]
        const nextItem = tocs[i + 1]
        if (nextItem && nextItem.level === tocItem.level) {
            renderToc.push(renderLi(h, tocItem))
        } else if (nextItem && nextItem.level > tocItem.level) {
            const deepItem = renderTocs(h, tocs, i + 1)
            i = deepItem.index
            renderToc.push(renderLi(h, tocItem, deepItem.toc))
        } else {
            renderToc.push(renderLi(h, tocItem))
            break
        }
    }

    return { toc: renderToc, index: i }
}
function renderLi (h, tocItem, tocs) {
    const toca = h(
        'a',
        {
            class: 'nav-link',
            attrs: { title: tocItem.text, href: '#' + tocItem.text.toLowerCase() }
        },
        [tocItem.text]
    )
    return !tocs ? h(
        'li',
        { class: 'nav-item' },
        [toca]
    ) : h(
        'li',
        { class: 'nav-item' },
        [
            toca,
            h(
                'ul',
                null,
                tocs
            )
        ]
    )
}
export default {
    props: {
        tocs: {
            required: true,
            type: Array
        }
    },
    render (h) {
        const tocs = renderTocs(h, this.tocs, 0)
        return h('div', null, [h('ul', { class: 'nav' }, tocs.toc)])
    }
}
</script>

<style lang="stylus" scoped>
.nav
    margin 0
    padding 0 2px 5px 10px
    text-align left
    list-style none
    font-size 14px
.nav-item
    overflow hidden
    text-overflow ellipsis
    white-space nowrap
    line-height 1.8
.nav a
    transition-duration 0.2s
    transition-timing-function ease-in-out
    transition-delay 0s
    transition-property all
    color #666
    border-bottom-color: #ccc
    text-decoration none
    border-bottom 1px solid #999
.nav a:hover
    color #000
    border-bottom-color #000
</style>

