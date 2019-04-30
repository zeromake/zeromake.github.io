<template>
    <div class="passage">
        <passage-meta :data="post"/>
        <h1 class="passage-title">
            {{ post.title }}
        </h1>
        <div class="passage-cover" v-if="post.cover">
            <figure :style="`background-image:url(${post.cover});`"/>
        </div>
        <article class="passage-article" v-html="post.body">
        </article>
        <aside class="passage-copyright">
            <div>本文作者: zeromake</div>
                <div>
                    原文链接:
                    <a :href="href" target="_blank">
                        {{href}}
                    </a>
                </div>
            <div>
                版权声明: 本博客所有文章除特别声明外, 均采用 <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/">CC BY-NC-SA 4.0</a> 许可协议. 转载请注明出处!
            </div>
        </aside>
    </div>
</template>

<script>
import PassageMeta from 'components/passage-meta.vue';
export default {
    components: {
        PassageMeta,
    },
    asyncData({ store, route }) {
        return store.dispatch('FETCH_POST_DATA', { post: route.params.page });
    },
    data() {
        return {
            href: 'https://blog.zeromake.com' + this.route.fullPath,
            post: this.$store.getters.activePage || {}
        }
    }
}
</script>

<style lang="stylus">
.passage
    max-width 1024px
    margin 20px auto
.passage-title
    font-size 36px
    line-height 42px
    margin 25px 0 40px
.passage-cover
    display block
    width 100%
    position relative
    padding-bottom 50%
    margin-bottom 40px
    figure
        position absolute
        left 0px
        top 0px
        right 0px
        bottom 0px
        overflow hidden
        border-radius 10px
        background-position 50% 50%
        background-size contain
        background-repeat no-repeat
        background-attachment fixed
.passage-article
    font-size 16px
    font-family -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
    line-height 2
    letter-spacing 0.2px
    word-break break-word
    // pre
    //     background-color #2D2D2D
    //     box-shadow 0 1px 3px #e3e3e3
    pre
        // font-size 0.8em
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
        &.language-yaml:after
            content 'Yaml'
        &.language-yml:after
            content 'Yaml'
        &.language-python:after
            content 'Python'
        &.language-c:after
            content 'C'
        &.language-c\+\+:after
            content 'CPP'
        &.language-cpp:after
            content 'CPP'
        &.language-text:after
            content 'Text'
        &.language:after
            content 'Text'
        &.language-go:after
            content 'Go'
        &.language-shell:after
            content 'Shell'
        &:after
            position: absolute
            top 0
            right 0
            // color #ccc
            // color #c7254e
            color #268bd2
            text-align right
            font-size 1em
            padding 5px 10px 0
            line-height 15px
            height 15px
            font-weight 600
.passage-copyright
        border-left 3px solid #FF5722
        background #EEEEEE
        padding 15px 20px
        margin-top 30px
    div
        line-height 2
    a
      transition all .1s linear
    a:hover
        color #F4511E

@media screen and (max-width: 768px)
    .passage-cover
        display none
</style>

