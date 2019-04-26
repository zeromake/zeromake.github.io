<template>
    <div id="app" class="container">
        <div class="side" v-show="showTop">
            <div class="top" @click="top">
            </div>
            <div class="arrows" id="nav-btn"></div>
        </div>
        <div class="headband"></div>
        <header class="header">
            <div class="inner" ref="header">
                <div class="site-brand-wrapper" ref="head">
                    <div class="site-meta ">
                        <div class="custom-logo-site-title">
                            <a href="/" class="brand" rel="start">
                                <span class="site-title">ZeroMake</span>
                            </a>
                        </div>
                        <p class="site-subtitle">Keep codeing and thinking!</p>
                    </div>
                        <div class="site-nav-toggle">
                            <div class="toggle-button" @click="toggle = !toggle">
                                <span class="btn-bar"></span>
                                <span class="btn-bar"></span>
                                <span class="btn-bar"></span>
                            </div>
                        </div>
                </div>
                <nav class="site-nav" :style="(toggle ? 'display: block;': '')">
                    <ul id="menu" class="menu">
                        <li class="menu-item menu-item-home">
                            <router-link to="/">
                                <i class="menu-item-icon fa fa-fw fa-home"></i>
                                Home
                            </router-link>
                        </li>
                        <li class="menu-item menu-item-archives">
                            <router-link to="/archives/">
                                <i class="menu-item-icon fa fa-fw fa-archive"></i>
                                Archives
                            </router-link>
                        </li>
                        <li class="menu-item menu-item-tags">
                            <router-link to="/resume">
                                <i class="menu-item-icon fa fa-fw fa-tags"></i>
                                Resume
                            </router-link>
                        </li>
                        <li class="menu-item menu-item-about">
                            <router-link to="/about">
                                <i class="menu-item-icon fa fa-fw fa-user"></i>
                                About
                            </router-link>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
        <zero-header :navigations="navigations" :showNav="showNav"/>
        <zero-navigation :navigations="navigations" ref="navigation"/>
        <transition name="fade" mode="out-in">
            <router-view class="view"></router-view>
        </transition>
        <footer class="footer">
            <section class="copyright">
                <a href="https://blog.zeromake.com">zeromake</a>
                &copy; 2017
            </section>
            <section>
                Proudly published with
                <a href="https://github.com/zeromake/zeromake.github.io">vue-ssr blog</a>
            </section>
        </footer>
    </div>
</template>
<script>
import debounce from 'lodash.debounce'
import ZeroHeader from './views/zero-header'
import ZeroNavigation from './views/zero-navigation'
export default {
    components: {
        ZeroHeader,
        ZeroNavigation,
    },
    mounted () {
        const head = this.$refs['head']
        const header = this.$refs['header']
        if ('IntersectionObserver' in window) {
            if (head) {
                this.io1 = new IntersectionObserver(debounce((entries) => {
                    const top = entries[0].intersectionRatio <= 0
                    if (top !== this.showTop) {
                        this.showTop = top
                    }
                }, 200))
                this.io1.observe(head)
            }
            if (header) {
                this.io2 = new IntersectionObserver(debounce((entries) => {
                    const top = entries[0].intersectionRatio <= 0
                    this.$store.commit('TOGGLE_SIDEBAR', top)
                }, 200))
                this.io2.observe(header)
            }
        }
    },
    beforeDestroy () {
        if (this.io1) {
            this.io1.disconnect()
        }
        if (this.io2) {
            this.io2.disconnect()
        }
    },
    data () {
        return {
            showTop: false,
            toggle: false,
            navigations: [
                {
                    title: "Archives",
                    href: "/archives",
                    target: "_self",
                    route: true,
                },
                {
                    title: "Resume",
                    href: "/resume",
                    target: "_self",
                    route: true,
                },
                {
                    title: "About",
                    href: "/about",
                    target: "_self",
                    route: true,
                },
                {
                    title: "Rss",
                    href: "/atom.xml",
                    target: "_blank"
                }
            ],
        }
    },
    methods: {
        top () {
            window.scroll(0, 0)
        },
        showNav() {
            if(this.$refs.navigation) {
                console.log(this.$refs.navigation);
                this.$refs.navigation.show();
            }
        }
    }
}
</script>

<style lang="stylus">
html, body
    width 100%
    height 100%
body
    font: 16px/1.6em "Helvetica Neue", Helvetica, Arial, sans-serif;
    -webkit-text-size-adjust: 100%;
    font-weight: 300;
    background-color #eee
    margin 0
    color #34495e
    overflow-y scroll
    word-wrap break-word
    line-height 2
.post-meta
    margin-left: 8px;
    padding-left: 12px;
    border-left: #d5dbde 1px solid;
    .meta-tag
        margin 0 5px
        padding 0 6px
        line-height 22px
        font-size 13px
        color #017e66
        background-color rgba(1, 126, 102, .08)
        display inline-block
.btn-bar
    display block
    background-color #fff
    width 22px
    height 2px
    border-radius 1px

.btn-bar + .btn-bar
    margin-top: 4px

.header
    width 70%
    background transparent
    margin 0 auto
    display block
    .site-brand-wrapper
        position relative
    .site-nav-toggle
        display none
        position absolute
        left 20px
        top 35%
        .toggle-button
            cursor pointer
            margin-top 2px
            padding 9px 10px
            background transparent
            border none
    .inner
        position absolute
        top 0
        overflow hidden
        padding 0
        width 240px
        background #fff
        box-shadow initial
        border-radius initial
    .brand
        color #fff
    .menu
        list-style none
        margin-top 20px
        padding-left 0
        text-align center
        .menu-item
            display block
            margin 0
            a
                display block
                font-size 13px
                border-bottom 1px solid transparent
                position relative
                box-sizing border-box
                padding 5px 20px
                text-align left
                line-height inherit
                color #555
                text-decoration none
                word-wrap break-word
                transition-property background-color
                transition-duration 0.2s
                transition-timing-function ease-in-out
                transition-delay 0s
                background-color transparent
            .fa
                margin-right 5px
a.router-link-active::after
    content " "
    position absolute
    top 50%
    margin-top -3px
    right 15px
    width 6px
    height 6px
    border-radius 50%
    background-color #bbb
.view
    background #fff
    overflow hidden
    width 70%
    margin 0 auto
    box-shadow 0 1px 3px #e3e3e3
.side
    position fixed
    right 30px
    bottom 30px
    transition .3s all
    background #fff
    .top
        width 24px
        height 24px
        border 1px solid transparent
        line-height 24px
        text-align center
        cursor pointer
        border-radius 3px
        &::after
            content '\F062'
            font-family FontAwesome
            font-size 16px
            color #fff
.footer
    max-width 840px
    margin 10px auto 5px
    background-color #fff
    text-align center
    box-shadow 0 0 5px #e3e3e3
    section
        padding 5px

.site-meta
    padding 20px 0
    color #fff
    background #222
    text-align center

.site-title
    display inline-block
    vertical-align: top
    line-height 36px
    font-size 20px
    font-weight normal
    font-family 'Lato', "PingFang SC", "Microsoft YaHei", sans-serif
.headband
    height 3px
    background #222
.site-subtitle
    margin 10px 10px 0
    font-weight initial
    margin-top 10px
    font-size 13px
    color #ddd
@media (max-width: 1500px)
    .view
        width 90%
    .header
        width 90%

@media (max-width: 991px)
    .view
        width auto
    .header
        width auto
        .inner
            width auto
            position relative
            border-radius initial
        .site-nav
            display none
        .site-meta
            box-shadow 0 0 16px rgba(0,0,0,0.5)
        .site-nav-toggle
            display block

</style>
