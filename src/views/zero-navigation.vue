<template>
    <nav :class="['nav-content', open ? 'nav-content-show' : '']">
        <div class="nav-content-title">
            <span>
                {{ navTitle }}
            </span>
        </div>
        <div class="nav-content-main">
            <ol class="nav-content-toc" @click="hide">
                <li
                    v-for="nav in navigations"
                    :key="nav.href"
                    class="nav-content-toc-item"
                >
                    <a
                        v-if="!nav.route"
                        :key="nav.href"
                        :href="nav.href"
                        :target="nav.target"
                    >
                        {{nav.title}}
                    </a>
                    <router-link
                        v-else
                        :key="nav.href"
                        :to="nav.href"
                        :target="nav.target"
                    >
                        {{ nav.title }}
                    </router-link>
                </li>
            </ol>
        </div>
    </nav>
</template>
<script>
export default {
    props: {
        navigations: {
            type: Array,
            default() {
                return [];
            }
        }
    },
    data() {
        return {
            navTitle: "导航",
            open: false,
        };
    },
    methods: {
        show() {
            this.open = true;
            this.$layer.show(null, () => {
                this.open = false;
            });
        },
        hide() {
            return this.$layer.hide();
        }
    }
}
</script>


<style lang="stylus" scoped>
    .nav-content
        z-index 900
        right -200px
        width 200px
        display block
        position fixed
        top 0
        height 100vh
        background #F5F5F5
        overflow-y auto
        z-index 900
        transition right .3s ease
    .nav-content-show
        right 0
    .nav-content-title
        position relative
        display flex
        align-items center
        justify-content center
        height 60px
        border-bottom 2px dotted #42A5F5
        span
            display inline-block
            background #03A9F4
            color white
            margin 0 auto
            padding 0 15px
            height 30px
            line-height 30px
            transition all .3s ease
        span:hover
            background #29B6F6
            cursor pointer
    .nav-content-main
        max-height calc(100% - 60px)
        overflow auto
        padding 20px 0 20px 0
        font-family -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif
    .nav-content-toc, .nav-content-toc-item
        list-style none
    .nav-content-toc-item
        text-align center
        line-height 35px
        a
            border-left 0
            color #757575
            padding-left 0
            border-left 2px solid transparent
            display inline-block
            width 100%
            transition padding-left .3s ease, background .3s ease, border-left-color .1s linear
        a:hover
            color #03A9F4
            background #E1F5FE
</style>
