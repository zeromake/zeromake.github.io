<template>
    <div class="passage">
        <h1 class="passage-title">
            {{ post.title }}
        </h1>
        <article class="passage-article markdown-section" v-html="post.body"/>
        <zero-comment :param="type"/>
    </div>
</template>


<script>
import ZeroComment from './zero-comment';
export default {
    props: {
        type: String,
        required: true
    },
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
