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
            <table>
                <tr>
                    <td>本文作者: </td>
                    <td>zeromake</td>
                </tr>
                <tr>
                    <td>原文链接: </td>
                    <td>
                        <a :href="href" target="_blank">
                            {{href}}
                        </a>
                    </td>
                </tr>
                <tr>
                    <td>最后更新时间: </td>
                    <td>{{post.last_date | formatTime}}</td>
                </tr>
                <tr>
                    <td>版权声明: </td>
                    <td>本博客所有文章除特别声明外, 均采用 <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/">CC BY-NC-SA 4.0</a> 许可协议. 转载请注明出处!</td>
                </tr>
            </table>
            <!-- <div>本文作者: zeromake</div>
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
            </div> -->
        </aside>
        <zero-comment :param="page"/>
    </div>
</template>

<script>
import PassageMeta from 'components/passage-meta.vue';
import ZeroComment from './zero-comment';
import scroll from '../util/scroll';

function scrollHash(hash) {
    if(hash) {
        let h = document.querySelector(hash);
        if(h) {
            let top = h.offsetTop;
            while(top == 0) {
                h = h.parentElement
                top = h.offsetTop;
            }
            scroll(top, 1, 1);
        }
    }
}

export default {
    beforeRouteEnter(to, from, next) {
        next(scrollHash.bind(null, to.hash));
    },
    beforeRouteUpdate(to, from, next) {
        next();
        if(from.hash !== to.hash) {
            scrollHash(to.hash);
        }
    },
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
        const path = this.$route.path;
        return {
            href: 'https://blog.zeromake.com' + (path.endsWith('/') ? path.substr(0, path.length - 1): path),
            post: this.$store.getters.activePage || {},
            page: this.$store.state.activePage,
        }
    },
}
</script>
