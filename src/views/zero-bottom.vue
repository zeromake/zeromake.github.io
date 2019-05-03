<template>
    <div class="bottom">
        <div class="bottom-left" v-if="pagination">
            <router-link v-if="!disablePrevious" :class="{disable: disablePrevious}" :to="previous">
                <i class="fa fa-arrow-left"/>
            </router-link>
            <a v-else :class="{disable: disablePrevious}">
                <i class="fa fa-arrow-left"/>
            </a>
            <router-link v-if="!disableNext" :class="{disable: disableNext}" :to="next">
                <i class="fa fa-arrow-right"/>
            </router-link>
            <a v-else :class="{disable: disableNext}">
                <i class="fa fa-arrow-right"/>
            </a>
        </div>
        <div class="bottom-right">
            <a href="javascript:void(0);" class="toc-show-btn disable">
                <i class="fa fa-bars"></i>
            </a>
            <a href="javascript:void(0);" :class="{disable: disableComment}" @click="scrollComment">
                <i class="fa fa-commenting"></i>
            </a>
            <a href="javascript:void(0);" class="toggle-share-btn disable">
                <i class="fa fa-share-alt"></i>
            </a>
            <a href="javascript:void(0);" class="reward disable">
                <i class="fa fa-thumbs-up"></i>
            </a>
            <a href="javascript:void(0);" class="back-top-btn" @click="backTop">
                <i class="fa fa-chevron-up"></i>
            </a>
        </div>
    </div>
</template>

<script>
let running = false;
function scroll(top, time=200, delay=10) {
    if(running) {
        return;
    }
    running = true;

    let scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    let offset = top - scrollTop;
    const down = offset > 0;
    if(!down) {
        offset = -offset;
    }

    if(~~(offset) <= 10) {
        document.documentElement.scrollTop = top;
        document.body.scrollTop = top;
        running = false;
        return;
    }

    let step = Math.ceil(offset * delay / time);
    const target = down ? top - step : step;

    let timer = setInterval(() => {
        scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const offset = down ? step + scrollTop : scrollTop - step;
        const flag = (!down && scrollTop <= target) || (down && scrollTop >= target);
        if(flag) {
            document.documentElement.scrollTop = top;
            document.body.scrollTop = top;
            running = false;
            clearInterval(timer);
        } else {
            document.documentElement.scrollTop = offset;
            document.body.scrollTop = offset;
        }
    }, delay);
}

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
        num() {
            return +this.$route.params.num || 1;
        },
        disablePrevious() {
            return this.num <= 1;
        },
        disableNext() {
            return this.num >= this.$store.state.total;
        },
        next() {
            if(this.$store.state.route) {
                const route = this.$store.state.route;
                return route.replace(':num', this.num + 1)
            }
            return '/';
        },
        previous() {
            if(this.$store.state.route) {
                const route = this.$store.state.route;
                return route.replace(':num', this.num - 1);
            }
            return '/';
        },
        disableComment() {
            return !this.$store.state.comment;
        }
    },
    mounted() {
        this.running = false;
    },
    methods: {
        scroll(top=0) {
            return scroll(top, this.time, this.delay);
        },
        backTop() {
            return this.scroll(0);
            // if(this.running) {
            //     return;
            // }
            // this.running = true;
            // let scrollTop = document.documentElement.scrollTop || document.body.scrollTop;

            // if(scrollTop <= 10) {
            //     document.documentElement.scrollTop = 0;
            //     document.body.scrollTop = 0;
            //     this.running = false;
            //     return;
            // }

            // let step = Math.ceil(scrollTop * this.delay / this.time);

            // let timer = setInterval(() => {
            //     scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            //     if(scrollTop <= step) {
            //         document.documentElement.scrollTop = 0;
            //         document.body.scrollTop = 0;
            //         this.running = false;
            //         clearInterval(timer);
            //     } else {
            //         document.documentElement.scrollTop = scrollTop - step;
            //         document.body.scrollTop = scrollTop - step;
            //     }
            // }, this.delay);
        },
        scrollComment() {
            if(this.disableComment) {
                return;
            }
            const select = document.querySelector(this.$store.state.comment);
            if(select) {
                this.scroll(select.offsetTop - 60);
            }
        }
    }
}
</script>

<style lang="stylus">
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

