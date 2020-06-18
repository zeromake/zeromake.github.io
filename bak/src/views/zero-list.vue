<template>
    <div class="home">
        <div class="home-article-wrapper" v-for="item in displayedItems" :key="item.date">
            <div :class="{'home-article': true, 'home-article-has-cover': !!item.cover}">
                <div :class="{'home-article-inner': true, 'home-article-inner-has-cover': !!item.cover}">
                    <passage-meta :data="item"/>
                    <h1 class="home-article-title">
                        <router-link
                            :to="'/pages/' + item.filename"
                        >
                            {{item.title}}
                        </router-link>
                    </h1>
                    <div class="home-article-content passage-article markdown-section" v-html="item.content">

                    </div>

                    <router-link
                        :to="'/pages/' + item.filename"
                        class="home-article-read"
                    >
                        {{ more }} >>>
                    </router-link>
                    <div class="passage-tags">
                        <router-link
                            v-for="tag in item.tags"
                            :key="tag"
                            :to="`/tags/${tag}`"
                        >
                            <i class="fa fa-tags"/>
                            {{ tag }}
                        </router-link>
                    </div>
                </div>
            </div>
            <div class="home-article-cover" v-if="!!item.cover">
                <img src="item.cover"/>
            </div>
        </div>
    </div>
</template>

<script>
import PassageMeta from 'components/passage-meta.vue';
export default {
    components: {
        PassageMeta
    },
    data() {
        return {
            displayedItems: this.$store.getters.activeItems,
            more: '阅读更多',
        };
    },

    asyncData ({ store }) {
        return store.dispatch('FETCH_LIST_DATA', { type: 'posts' }).then(() => {
            store.commit('SET_PAGE', {
                route: "/page/:num",
                total: 1,
            })
        })
    },
}
</script>
