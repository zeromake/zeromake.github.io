<template>
<div class="footer-wrapper">
    <footer class="footer">
        <div class="footer-col" v-for="f in footer" :key="f.title">
            <h5 class="footer-title">{{ f.title }}</h5>
            <span class="footer-item" v-for="item in f.info" :key="item.title">
                <a :href="item.href" target="_blank" rel="noopener noreferrer">
                    {{ item.title }}
                </a>
            </span>
        </div>
        <div class="footer-info" v-for="info in infos" v-html="info.html ? info.html : ''" :key="info.key">
            <i :class="`fa fa-${info.icon}`"/>
            {{
                info.text
            }}
        </div>
    </footer>
</div>
</template>

<script>
export default {
    data() {
        return {
            footer: [
                {
                    title: '实验室',
                    info: [
                        {
                            title: 'http2',
                            href: 'https://github.com/zeromake/http2',
                        },
                        {
                            title: 'docker-debug',
                            href: 'https://github.com/zeromake/docker-debug',
                        },
                        {
                            title: 'zreact',
                            href: 'https://github.com/zeromake/zreact',
                        },
                    ]
                },
                {
                    title: '技术社交',
                    info: [
                        {
                            title: 'Github',
                            href: 'https://github.com/zeromake',
                        }
                    ]
                },
                {
                    title: '博客推荐',
                    info: [
                        {
                            title: '面向信仰编程',
                            href: 'https://draveness.me',
                        },
                        {
                            title: '吴叶磊',
                            href: 'http://aleiwu.com',
                        }
                    ]
                }
            ],
            infos: [
                {
                    key: 1,
                    icon: 'at',
                    text: '联系方式：a390720046@gmail.com'
                },
                {
                    key: 2,
                    html: `<i class="fa fa-copyright"></i>
                    2019 Created by <a href="https://blog.zeromake.com/" target="_blank">zeromake</a>.
                    Theme copy <a href="https://github.com/dongyuanxin/theme-ad/" target="_blank">Theme-AD</a>.
                    All rights reserved.`
                }
            ]
        }
    }
}
</script>

<style lang="stylus">
.footer-wrapper
    background #455A64
    margin-bottom 50px
    word-break break-all
.footer
    display flex
    flex-wrap wrap
    padding 30px 0
    max-width 1024px
    margin 0 auto
    font-size 15px
    a
        color #EEEEEE
        transition all .15s linear
    a:hover
        color white
.footer-col
    display flex
    flex-direction column
    padding-bottom 30px
    width 33.33333%
    h5
        margin-bottom 15px
        font-size 1.1em
        color #CFD8DC
    span
        display inline-block
        margin-bottom 10px
        font-weight bold
.footer-info:not(:last-child)
    margin-bottom 5px
.footer-info
    width 100%
    color #CFD8DC

@media screen and (max-width: 768px)
    .footer
        padding 30px 20px 30px
    .footer-col
        width 50%
@media screen and (min-width: 769px) and (max-width: 1024px)
    .footer
        padding 30px 50px 30px
</style>

