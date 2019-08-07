<template>
    <div class="passage">
        <passage-meta :data="post"/>
        <h1 class="passage-title">
            {{ post.title }}
        </h1>
        <div class="passage-cover" v-if="post.cover">
            <figure :style="`background-image:url(${post.cover});`"/>
        </div>
        <article class="passage-article markdown-section" v-html="post.body">
        </article>
        <aside class="passage-copyright">
            <div>本文作者: zeromake</div>
                <div>
                    原文链接:
                    <a :href="href" target="_blank">
                        {{href}}
                    </a>
                </div>
                <div>
                    最后更新时间: {{post.last_date | formatTime}}
                </div>
            <div>
                版权声明: 本博客所有文章除特别声明外, 均采用 <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/">CC BY-NC-SA 4.0</a> 许可协议. 转载请注明出处!
            </div>
        </aside>
        <zero-comment :param="page"/>
    </div>
</template>

<script>
import PassageMeta from 'components/passage-meta.vue';
import ZeroComment from './zero-comment';
export default {
    components: {
        PassageMeta,
        ZeroComment,
    },
    asyncData({ store, route }) {
        return store.dispatch('FETCH_POST_DATA', { post: route.params.page });
    },
    title() {
        return this.post.title || '';
    },
    data() {
        return {
            href: 'https://blog.zeromake.com' + this.$route.path,
            post: this.$store.getters.activePage || {},
            page: this.$store.state.activePage,
        }
    },
}
</script>
