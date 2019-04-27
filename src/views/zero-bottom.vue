<template>
    <div class="bottom">
        <div class="bottom-left" v-if="pagination">
            <a href="javascript:void(0);" :class="{disable: hasPrevious}">
                <i class="fa fa-arrow-left"/>
            </a>
            <a href="javascript:void(0);" :class="{disable: hasNext}">
                <i class="fa fa-arrow-right"/>
            </a>
        </div>
        <div class="bottom-right">
            <a href="javascript:void(0);" class="toc-show-btn">
                <i class="fa fa-bars"></i>
            </a>
            <a href="javascript:void(0);">
                <i class="fa fa-commenting"></i>
            </a>
            <a href="javascript:void(0);" class="toggle-share-btn">
                <i class="fa fa-share-alt"></i>
            </a>
            <a href="javascript:void(0);" class="reward">
                <i class="fa fa-thumbs-up"></i>
            </a>
            <a href="javascript:void(0);" class="back-top-btn" @click="backTop">
                <i class="fa fa-chevron-up"></i>
            </a>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        pagination: {
            type: Boolean,
            default: true,
        },
        delay: {
            type: Number,
            default: 10,
        },
        time: {
            type: Number,
            default: 200,
        }
    },
    data() {
        return {
        };
    },
    computed: {
        hasPrevious() {
            return true;
        },
        hasNext() {
            return true;
        }
    },
    mounted() {
        this.running = false;
    },
    methods: {
        backTop() {
            if(this.running) {
                return;
            }
            this.running = true;
            let scrollTop = document.documentElement.scrollTop || document.body.scrollTop;

            if(scrollTop <= 10) {
                document.documentElement.scrollTop = 0;
                document.body.scrollTop = 0;
                this.running = false;
                return;
            }

            let step = Math.ceil(scrollTop * this.delay / this.time);

            let timer = setInterval(() => {
                scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
                if(scrollTop <= step) {
                    document.documentElement.scrollTop = 0;
                    document.body.scrollTop = 0;
                    this.running = false;
                    clearInterval(timer);
                } else {
                    document.documentElement.scrollTop = scrollTop - step;
                    document.body.scrollTop = scrollTop - step;
                }
            }, this.delay);
        }
    }
}
</script>

<style lang="stylus" scoped>
    .bottom
        display flex
        justify-content space-between
        position fixed
        bottom 0
        left 0
        width 100%
        height 50px
        background #F5F5F5
        overflow auto
        z-index 300
        a.disable
            color #90CAF9
            cursor not-allowed
        a
            display inline-block
            width 40px
            height 40px
            line-height 40px
            text-align center
            transition all .15s linear
            color #42A5F5
        a:hover
            border-radius 50%
            color white
            background #42A5F5
        a.disable:hover
            background #90CAF9
    .bottom-left, .bottom-right
        display inline-flex
        align-items center

</style>

