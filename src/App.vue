<template>
    <div id="app">
        <div class="side">
            <div class="top" id="back-top" @click="top"></div>
            <div class="arrows" id="nav-btn"></div>
        </div>
        <header class="header">
            <nav class="inner">
                <router-link to="/" class="logo-link" exact>
                    <img class="logo" src="~public/logo-48.png" alt="zeromake">
                </router-link>
            <router-link to="/">Home</router-link>
            <router-link to="/archives">Archives</router-link>
            <router-link to="/resume">Resume</router-link>
            <router-link to="/about">About</router-link>
            </nav>
        </header>
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
export default {
    methods: {
        top () {
            window.scroll(0, 0)
        }
    }
}
</script>

<style lang="stylus">
body
    // font-family -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
    font-family "Source Sans Pro", "Helvetica Neue", Arial, sans-serif
    font-size 15px
    background-color lighten(#fff, 30%)
    margin 0
    color #34495e
    overflow-y scroll
    word-wrap break-word
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

.header
    max-width 840px
    background-color #fff
    height 55px
    margin 0 auto
    box-shadow 0 1px 3px #e3e3e3

    .inner
        max-width 450px
        box-sizing border-box
        margin 0 auto
        padding 15px 5px

    a
        color rgba(32, 32, 32, .8)
        line-height 24px
        transition color .15s ease
        display liline-block
        vertical-align middle
        font-weight 300
        letter-spacing .075em
        text-decoration none
        margin-right 1.8em
        &:hover
            color #b71c1c
        &.router-link-active
            color #b71c1c
            font-weight 400
        &:nth-child(6)
            margin-right 0
.logo
    width 24px
    margin-right 10px
    display inline-block
    vertical-align middle
.view
    overflow hidden
    padding 10px 20px
    max-width 800px
    margin 10px auto 0
    box-shadow 0 1px 3px #e3e3e3
.side
    position fixed
    right 10px
    bottom 10px
    transition .3s all
    .top
        width 35px
        height 35px
        border 1px solid transparent
        background-color #e3e3e3
        line-height 35px
        text-align center
        cursor pointer
        border-radius 3px
        &::after
            content '\f077'
            font-family FontAwesome
            font-size 16px
            color #323232
.footer
    max-width 840px
    margin 10px auto 5px
    background-color #fff
    text-align center
    box-shadow 0 0 5px #e3e3e3
    section
        padding 5px
.fade-enter-active, .fade-leave-active
    transition all .2s ease
.fade-enter, .fade-leave-active
    opacity 0
@media (max-width 860px)
    .header .inner
        padding 15px 30px
        max-width 460px

@media (max-width 600px)
    body
        font-size 14px
    .header
        .inner
            padding 15px
            max-width 480px
        a
            margin-right 1em
    .side
        display none
@media (max-width 500px)
    .view
        padding 10px 10px
    .header .inner
        max-width 300px
        .logo-link
            display none
@media (max-width 320px)
    .header .inner
            padding 10px
            max-width 290px

</style>
