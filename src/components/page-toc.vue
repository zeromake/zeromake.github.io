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
            class: 'left_toca',
            attrs: { title: tocItem.text, href: '#' + tocItem.text }
        },
        [tocItem.text]
    )
    return !tocs ? h(
        'li',
        [toca]
    ) : h(
        'li',
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
        return h('div', null, [h('ul', { class: 'left_toc_ul' }, tocs.toc)])
    }
}
</script>

<style lang="stylus" scoped>
.left_toca
    color: #34495e;
    padding 3px 0
    text-decoration none
    display block
.left_toc_ul
    list-style-type square
.left_toca:hover
    text-decoration underline
</style>

