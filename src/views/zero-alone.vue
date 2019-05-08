<template>
    <div class="passage">
        <h1 class="passage-title">
            {{ post.title }}
        </h1>
        <article class="passage-article" v-html="post.body"/>
        <zero-comment :param="type"/>
    </div>
</template>


<script>
import ZeroComment from './zero-comment';
export default {
    components: {
        ZeroComment,
    },
    data() {
        return {
            post: this.$store.getters.activeAlone || {}
        }
    },
    // asyncData({ store, route }) {
    //     return store.dispatch('FETCH_ALONE_DATA', { type: route.path.substr(1) });
    // },
}
</script>

<style lang="stylus">
.passage-title
    font-size 36px
    line-height 42px
    margin 25px 0 40px
</style>

