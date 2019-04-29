<template>
    <div>
        <div class="page-view">
            <div class="content">
                <header class="post-header" v-if="pageData">
                    <h1 class="post-title">{{ pageData.title }}</h1>
                    <div class="post-meta">
                        <span class="post-time">
                            <span class="post-meta-item-icon">
                                <i class="fa fa-calendar-o"></i>
                            </span>
                            <span class="post-meta-item-text">发表于</span>
                            <time title="创建于">
                                {{ pageData.date | formatTime }}
                            </time>
                        </span>
                        <span class="post-category">
                            <span class="post-meta-divider">|</span>
                            <span class="post-meta-item-icon">
                                <i class="fa fa-folder-o"></i>
                            </span>
                            <span class="post-meta-item-text">分类于</span>
                            <span>
                                <a href="javascript:void(0);">
                                    <span>{{pageData.type}}</span>
                                </a>
                            </span>
                        </span>
                    </div>
                </header>
                <div class="markdown-body" v-html="pageData.body">
                </div>
                <div>
                    <h3>支持我</h3>
                    <div class="alipay_div">
                        <p>如果你觉得这篇文章对你有帮助请支持我。</p>
                        <a href="https://qr.alipay.com/tsx014836oaivqqvutbcb9a" alt="支付宝" title="支付宝">
                            <img class="support" src="/public/alipay.png" alt="支付宝">
                        </a>
                        <a href="https://paypal.me/zerobuild" alt="PayPal" title="PayPal">
                            <img class="support" src="/public/paypal.png" alt="PayPal">
                        </a>
                    </div>
                </div>
                <div v-pre id="container" class="container"></div>
            </div>
        </div>
        <sidebar></sidebar>
    </div>
</template>

<script>
import Sidebar from 'components/sidebar'
import PageToc from 'components/page-toc'
export default {
    beforeCreate () {
        if (this.$store.getters.activePage) {
            this.$store.commit('SET_TOCS', this.$store.getters.activePage.toc)
        }
    },
    asyncData ({ store, route }) {
        const page = route.params.page
        return store.dispatch('FETCH_PAGE_DATA', { page })
    },
    components: {
        PageToc,
        Sidebar
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
// @import url('../../node_modules/github-markdown-css/github-markdown.css')
// .support
//     padding 10px
//     width 240px

// .alipay_div
//     width 600px
//     margin 0 auto

// @media (max-width 520px)
//     .alipay_div
//         width 260px

// .post-meta a
//     color #555
//     text-decoration none
//     border-bottom 1px solid #999
//     word-wrap break-word
//     background-color transparent

// .post-meta a:hover
//     color #222
//     border-bottom-color #222
// .post-meta a:active, a:hover
//     outline 0
// .page-view
//     float right
//     box-sizing border-box
//     padding 40px
//     width calc(100% - 240px)
//     background #fff
//     box-shadow initial
//     border-radius initial
// .post-title
//     font-size 26px
//     text-align center
//     word-break break-word
//     font-weight 400
// .post-meta
//     margin 3px 0 60px 0
//     color #999
//     font-size 12px
//     text-align center
// .post-meta-divider
//     margin 0 0.5em
// .post-meta-item-icon
//     margin-right 3px
// .markdown-body
//     box-sizing border-box
//     min-width 200px
//     max-width 980px
//     margin 0 auto
//     padding 35px
//     h1, h2, h3, h4
//         margin-left -1.5rem
//     img
//         width 100%
//     code
//         color #c7254e
//     pre
//         // background-color #2D2D2D
//         box-shadow 0 1px 3px #e3e3e3
//     pre.code
//         font-size 0.8em
//         position relative
//         code
//             color inherit
//         &.language-html:after
//             content 'HTML'
//         &.language-js:after
//             content 'JS'
//         &.language-javascript:after
//             content 'JavaScript'
//         &.language-typescript:after
//             content 'TypeScript'
//         &.language-json:after
//             content 'JSON'
//         &.language-css:after
//             content 'CSS'
//         &.language-bash:after
//             content 'Shell'
//         &.language-yaml:after
//             content 'Yaml'
//         &.language-python:after
//             content 'Python'
//         &.language-c:after
//             content 'C'
//         &.language-c\+\+:after
//             content 'CPP'
//         &.language-cpp:after
//             content 'CPP'
//         &:after
//             position: absolute
//             top 0
//             right 0
//             // color #ccc
//             // color #c7254e
//             color #268bd2
//             text-align right
//             font-size 1em
//             padding 5px 10px 0
//             line-height 15px
//             height 15px
//             font-weight 600

// @media (max-width: 991px)
//     h1, h2, h3, h4
//         margin-left -1rem
//     .page-view
//         width 100%
//     .page-view
//         padding 20px

// // @media (max-width 767px)
// //     .markdown-body
// //         padding 10px

// @media (max-width 767px)
//     h1, h2, h3, h4
//         margin-left 0 !important
//     .markdown-body
//         padding 0
//     .page-view
//         padding 10px
</style>
