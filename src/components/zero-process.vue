<template>
    <div class="process" :style="{width: `${process}%`, top: `${top}px`}">
    </div>
</template>

<script>
// import debounce from 'lodash.throttle'
export default {
    props: {
        top: {
            type: Number,
            default: 58,
        }
    },
    data() {
        return {
            process: 0
        };
    },
    mounted() {
        this.isRunning = false;
        document.addEventListener('scroll', this.scroll);
    },
    destroyed() {
        document.removeEventListener('scroll', this.scroll);
    },
    methods: {
        scroll(e) {
            if(this.isRunning) {
                return;
            }
            this.isRunning = true;
            requestAnimationFrame((ts) => {
                const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
                const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
                const clientHeight = document.documentElement.clientHeight || document.body.clientHeight;

                this.isRunning = false;
                let process = 100 * scrollTop / (scrollHeight - clientHeight);
                if(process > 99) {
                    process = 100;
                } else if (process < 1) {
                    process = 0;
                }
                this.process = process;
            });
        }
    }
}
</script>

<style lang="stylus" scoped>
    .process
        position fixed
        left 0
        height 2px
        background #42A5F5
        z-index 300
</style>
