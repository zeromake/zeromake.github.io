<template>
    <div class="comment-contanier">
        <div class="comment-thread" ref="thread">
        </div>
    </div>
</template>

<script>
export default {
    props: {
        param: {
            type: String,
            default: () => 'page',
        }
    },
    mounted() {
        const thread = this.$refs.thread;
        if(thread) {
            const page = this.param === 'path' ? this.$route.path.substr(1) : this.$route.params[this.param];
            if (this.$gitment) {
                const gitment = new this.$gitment({
                    id: page, // 可选。默认为 location.href
                    owner: 'zeromake',
                    repo: 'zeromake.github.io',
                    oauth: {
                        'client_id': '6f4e103c0af2b0629e01',
                        'client_secret': '22f0c21510acbdda03c9067ee3aa2aee0c805c9f'
                    }
                });
                gitment.render(thread);
                this.$store.commit('COMMENT_CONTANIER', { select: '.comment-contanier' });
            }
        }
    },
    destroyed() {
        this.$store.commit('COMMENT_CONTANIER', { select: null });
    }
}
</script>

<style lang="stylus">
</style>

