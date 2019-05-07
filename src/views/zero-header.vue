<template>
    <header class="header">
        <div class="header-left">
            <span class="header-left-title">
                <a href="/">{{title}}</a>
            </span>
            <span v-if="motto" class="header-left-motto"> | {{motto}}</span>
        </div>
        <div class="header-right">
            <nav class="header-navigation">
                <template
                    v-for="nav in navigations"
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
                </template>
            </nav>
            <div class="header-btn">
                <a href="https://github.com/zeromake" target="_blank" class="header-btn-github">
                    <i class="fa fa-github-alt"></i>
                </a>
                <a href="javascript:void(0);" class="header-btn-search">
                    <i class="fa fa-search"></i>
                </a>
                <a href="javascript:void(0);" class="header-btn-more" @click="showNav">
                    <i class="fa fa-ellipsis-v"></i>
                </a>
            </div>
        </div>
    </header>
</template>

<script>
export default {
    props: {
        navigations: {
            type: Array,
            default() {
                return [];
            }
        },
        showNav: {
            type: Function,
            default: () => {
                return () => {};
            }
        }
    },
    name: "ZeroHeader",
    data() {
        return {
            title: "ZEROMAKE",
            motto: "keep codeing and thinking!",
            navTitle: "导航",
            navShow: false
        };
    },
    methods: {

    }
}
</script>

<style lang="stylus">
    .header
        display flex
        justify-content space-between
        position fixed
        top 0
        left 0
        width 100%
        height 60px
        border-bottom #FAFAFA solid 2px
        padding-left 10px
        background #FAFAFA
        z-index 300
        box-shadow 0 1px 2px 0 rgba(0,0,0,.1),0 2px 4px 0 rgba(0,0,0,.1)
        // border-bottom transparent solid 2px
        // box-shadow 0 2px 2px #eee
    .header-left, .header-right
        display flex
        align-items center
    .header-left
        display: flex;
        align-items: center;
    .header-left-title
        font-weight: bold;
        font-size: 24px;
    .header-left-motto
        display inline-block
        margin-left 5px
        font-size 14px
        color #616161
    .header-right
        justify-content flex-end
    .header-navigation
        font-size 16px
        padding-left 10px
        display flex
        overflow auto
        a
            margin-right 15px
            color #9E9E9E
            display block
            transition all .3s linear
        a:hover
            color #616161
    .header-btn
        font-size 18px
        display flex
        justify-content flex-end
        a
            display inline-block
            text-align center
            height 58px
            line-height 58px
            cursor pointer
            i
                padding 0 20px 0 10px
                color #616161;
    @media screen and (min-width: 769px)
        .header-btn a
            width 58px

        .header-btn-more
            display none !important

        .header-btn-github
            background #4FC3F7
        .header-btn-search
            background #03A9F4

        .header-btn a i
            color white
    @media screen and (max-width: 768px)
        .header-btn-github
            display none !important
        .header-btn a i
            padding 0 20px 0 10px
            color #616161
        .header-navigation
            display none
        .header-left-title
            font-size 22px
    @media screen and (max-width 400px)
        .header-left-motto
            display none
</style>

