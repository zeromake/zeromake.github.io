<template>
<div>
    <slot :show="show"></slot>
</div>
</template>


<script>
export default {
    props: {
        delay: {
            type: Number,
            default: 70,
        },
        duration: {
            type: Number,
            default: 0.2
        },
        hideOffset: {
            type: Number,
            default: 0,
        }
    },
    data() {
        return {
            previousScrollTop: 0,
            show: true,
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
        /**
         * @param {Event} e
         */
        scroll(e) {
            if(this.isRunning) {
                return;
            }
            this.isRunning = true;
            requestAnimationFrame((ts) => {
                const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
                const scrollDelta = scrollTop - this.previousScrollTop;
                this.previousScrollTop = scrollTop;
                if (scrollDelta < 0) {
                    if (!this.show) {
                        this.show = true;
                    }
                } else if (scrollDelta > 0) {
                    if (this.show && scrollTop >= this.hideOffset) {
                        this.show = false;
                    }
                }
                this.isRunning = false;
            });
        }
    }
}
</script>

