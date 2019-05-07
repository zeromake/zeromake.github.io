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
                    <div class="home-article-content passage-article" v-html="item.content">

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


<style lang="stylus">
.home-article
    position relative
    height 100%
    width 100%
    z-index 1
    padding-right 0
.home-article-has-cover
    padding-right 50%
.home-article-inner
    transition all .3s ease
    background white
    width 100%
    padding 60px 60px 40px
    border-radius 10px
.home-article-inner-has-cover
    border-top-right-radius 0
    border-bottom-right-radius 0
.home-article-inner-has-cover:hover
    z-index 100
    padding-left 80px
    width calc(100% + 20px)
.home-article-content
    margin-top 10px
    font-size 16px
.passage-article
    font-size 16px
    font-family -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
    line-height 2
    letter-spacing 0.2px
    word-break break-word
.home-article-title
    font-size 26px
    line-height 42px
    margin 20px 0 25px
.home-article-read
    display inline-block
    margin-top 15px
    margin-left 0
    color #9E9E9E
    font-weight 600
    font-size 18px
    font-style italic
    transition all .1s linear
.passage-tags
    display flex
    flex-wrap wrap
    align-items center
    margin-top 20px
    padding-top 20px
    font-size 15px
    border-top 1px solid #EEEEEE
    a
        display inline-flex
        margin 0 15px 15px 0
        align-items center
        height 30px
        padding 5px 10px
        background #EEEEEE
        border 1px solid #EEEEEE
        border-radius 3px
        transition all .15s linear
.home-article-cover
    position absolute
    top 0
    right 0
    width 50%
    height 100%
    transition all .3s ease
    z-index -1
.home-article-cover:hover
    z-index 100
    width calc(50% + 30px)
.home-article-read
    display inline-block
    margin-top 15px
    margin-left 0
    color #9E9E9E
    font-weight 600
    font-size 18px
    font-style italic
    transition all .1s linear
.home-article-read:hover
    color #616161
    margin-left 10px
.home-article-wrapper
    display block
    min-height 330px
    margin 30px 0
    border-radius 10px
    transition all .25s ease
    box-shadow 0 1px 2px 0 rgba(0,0,0,.1),0 2px 4px 0 rgba(0,0,0,.1)
    &:hover
        box-shadow 0 2px 4px 0 rgba(0,0,0,.1),0 4px 8px 0 rgba(0,0,0,.1),0 8px 16px 0 rgba(0,0,0,.1),0 16px 32px 0 rgba(0,0,0,.1)

@media screen and (max-width: 768px)
    .home-article-inner-has-cover
        border-radius 10px

    .home-article-inner
        padding 20px 15px

    .home-article-wrapper
        margin 16px 0
@media screen and (min-width: 1025px)
    .home-article-inner-has-cover
        z-index 100
        padding-left 80px
        width calc(100% + 20px)

@media screen and (max-width: 1024px)
    .home-article-has-cover
        padding 0
    .home-article-cover
        display none
</style>
