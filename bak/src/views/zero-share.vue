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
