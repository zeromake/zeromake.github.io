<template>
    <div class="share-btn">
        <a
            v-for="share in shares"
            :key="share.name"
            :class="`share-btn-${share.name}`"
            :href="share.href(opt)"
            target="_blank"
        >
            <i :class="['fa', `fa-${share.name}`]"/>
        </a>

        <!-- <a class="share-btn-wechat" href="javascript:void(0);" target="_blank">
            <i class="fa fa-wechat"></i>
        </a> -->
    </div>
</template>

<script>
export default {
    data() {
        const origin = 'https://blog.zeromake.com';
        return {
            opt: {
                url: origin + this.$route.fullPath,
                title: 'zeromake\'blog',
            },
            shares: [
                {
                    name: 'twitter',
                    href(opt) {
                        return `https://twitter.com/intent/tweet?url=${opt.url}&amp;text=${opt.title}&amp;via=${opt.url}`;
                    }
                },
                {
                    name: 'facebook',
                    href(opt) {
                        return `https://www.facebook.com/sharer/sharer.php?u=${opt.url}`;
                    }
                },
                {
                    name: 'weibo',
                    href(opt) {
                        return `http://service.weibo.com/share/share.php?url=${opt.url}&amp;title=${opt.title}`;
                    }
                },
                {
                    name: 'qq',
                    href(opt) {
                        return `http://connect.qq.com/widget/shareqq/index.html?url=${opt.url}&amp;title=${opt.title}`;
                    }
                }
            ]
        }
    }
}
</script>

<style lang="stylus" scoped>
    .share-btn
        display flex
        flex-direction column
        position fixed
        left 0
        top 50%
        transform translateY(-50%)
        z-index 300
        a
            display inline-block
            cursor pointer
            width 40px
            height 40px
            line-height 40px
            text-align center
            color white
            margin-bottom 10px
            border-top-right-radius 3px
            border-bottom-right-radius 3px
            transition all .3s
        a:hover
            padding-left 8px
            width 48px

    .share-btn-qq
        background #1E88E5
    .share-btn-qq:hover
        background #42A5F5
    .share-btn-wechat
        background #4CAF50
    .share-btn-wechat:hover
        background #81C784
    .share-btn-twitter
        background #03A9F4
    .share-btn-twitter:hover
        background #4FC3F7
    .share-btn-facebook
        background #5C6BC0
    .share-btn-facebook:hover
        background #7986CB
    .share-btn-weibo
        background: #EF5350
    .share-btn-weibo:hover
        background: #E57373
    @media screen and (max-width: 768px)
        .share-btn
            display none
</style>


