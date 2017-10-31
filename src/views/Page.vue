<template>
    <div>
        <div class="page-view">
            <div class="content">
                <div class="title-wrap" v-if="pageData">
                    <h1>{{ pageData.title }}</h1>
                    <div>
                        <time>创建时间：{{ pageData.date | formatTime }}</time><br>
                        <time v-if="pageData.last_date">最后更新：{{ pageData.last_date | formatTime }}</time>
                    </div>
                    <br>
            <div class="tocs">
                <div>目录</div>
                <page-toc v-if="pageData" :tocs="pageData.toc"></page-toc>
            </div>
                    <span class="post-meta post-meta-tags">
                        <i class="fa fa-tag" v-once></i>
                        <span class="meta-tag" v-for="meta_tag in pageData.tags" :key="meta_tag">{{ meta_tag }}</span>
                    </span>
                </div>
                <div class="markdown-body" v-html="pageData.body"></div>
                <div v-pre id="container" class="container"></div>
            </div>
        </div>
    </div>
</template>

<script>
import PageToc from 'components/page-toc'
export default {
    asyncData ({ store, route }) {
        const page = route.params.page
        return store.dispatch('FETCH_PAGE_DATA', { page })
    },
    components: {
        PageToc
    },
    data () {
        return {
            code: null,
            flag: false,
            pageData: this.$store.getters.activePage || {}
        }
    },
    title: function () {
        return this.$route.params.page
    },
    mounted () {
        this.loadYunTie()
        // const nodeList = document.querySelectorAll('.flow')
        // const flowDiagram = document.querySelector('#flow-diagram')
        // Array.prototype.forEach.call(nodeList, (node) => {
        //     const code = node.innerText.replace(/\\n/g, '\n')
        //     const diagram = this.$flowchart.parse(code)
        //     diagram.drawSVG('flow-diagram')
        //     console.log()
        //     node.innerHTML = flowDiagram.innerHTML
        // })
    },
    methods: {
        loadYunTie () {
            const page = this.$route.params.page
            if (this.$gitment) {
                const gitment = new this.$gitment({
                    id: page, // 可选。默认为 location.href
                    owner: 'zeromake',
                    repo: 'zeromake.github.io',
                    oauth: {
                        'client_id': '6f4e103c0af2b0629e01',
                        'client_secret': '22f0c21510acbdda03c9067ee3aa2aee0c805c9f'
                    }
                })
                gitment.render('container')
            }
        }
    }
}
</script>

<style lang="stylus">
@import url('../../node_modules/github-markdown-css/github-markdown.css')
.page-view
    background-color #fff
.title-wrap
    margin 20px 0
    padding-bottom 10px
    border-bottom 1px solid #e0e0e0
.markdown-body
    box-sizing border-box
    min-width 200px
    max-width 980px
    margin 0 auto
    padding 35px
    code
        color #c7254e
    pre
        box-shadow 0 1px 3px #e3e3e3
        // .hljs-comment, .xml .hljs-doctype, .html .hljs-doctype, .html .hljs-meta, .xml .hljs-meta
        //     color #999999
        // .hljs-number, .ruby .hljs-keyword
        //     color #538192
        // .hljs-string, .hljs-regexp, .xml .hljs-value, .html .hljs-value
        //     color #739200
        // .hljs-keyword, .hljs-title, .hljs-constant, .xml .hljs-tag, .html .hljs-tag, .css .hljs-attribute
        //     color #ff0055
        // .xml .hljs-tag .hljs-title, .html .hljs-tag .hljs-title, .html .hljs-tag .hljs-name, .xml .hljs-tag .hljs-name
        //     color #111111
    pre.code
        font-size 0.8em
        position relative
        code
            color inherit
        &.language-html:after
            content 'HTML'
        &.language-js:after
            content 'JS'
        &.language-javascript:after
            content 'JavaScript'
        &.language-typescript:after
            content 'TypeScript'
        &.language-json:after
            content 'JSON'
        &.language-css:after
            content 'CSS'
        &.language-bash:after
            content 'Shell'
        &:after
            position: absolute
            top 0
            right 0
            color #ccc
            text-align right
            font-size 0.75em
            padding 5px 10px 0
            line-height 15px
            height 15px
            font-weight 600

@media (max-width 767px)
    .markdown-body
        padding 15px
</style>
