<template>
<div class="news-view">
    <transition :name="transition">
        <div class="news-list">
            <transition-group tag="ul" name="item">
                <item v-for="item in displayedItems" :key="item.date" :item="item"></item>
            </transition-group>
        </div>
    </transition>
    <sidebar></sidebar>
</div>
</template>

<script>
import Item from './Item.vue'
import Sidebar from './sidebar'

export default {
    beforeCreate () {
        this.$store.commit('SET_TOCS', null)
    },
    name: 'item-list',
    components: {
        Item,
        Sidebar
    },
    props: {
        type: String
    },
    data () {
        const data = {
            transition: 'slide-right',
            displayedItems: this.$store.getters.activeItems
        }
        return data
    },
    computed: {
    },
    /* beforeMount () {
        if (this.$root._isMounted) {
            this.loadItems()
        }
    }, */
    beforeDestroy () {
    },
    watch: {
    },
    methods: {
        loadItems () {
            this.$bar.start()
            this.$store.dispatch('FETCH_LIST_DATA', {
                type: this.type
            }).then(() => {
                this.transition = 'slide-left'
                this.displayedItems = this.$store.getters.activeItems
                this.$bar.finish()
            })
        }
        /* test () {
            this.loading = !this.loading
        }*/
    }
}
</script>

<style lang="stylus">
.news-list-nav, .news-list
    background-color: #fff
    border-radius 2px
.news-list-nav
    padding 15px 30px
    text-align center
    box-shadow 0 1px 2px rgba(0,0,0,.1)
    a
        margin 0 1em
    .disabled
        color #ccc

.news-list
    float right
    box-sizing: border-box
    padding 20px
    width 700px
    background #fff
    box-shadow initial
    border-radius: initial
    transition all .5s cubic-bezier(.55,0,.1,1)
    ul
        list-style-type none
        padding 0
        margin 0
.slide-left-enter, .slide-right-leave-active
    opacity 0
    transform translate(30px, 0)

.slide-left-leave-active, .slide-right-enter
    opacity 0
    transform translate(-30px, 0)

.item-move, .item-enter-active, .item-leave-active
    transition all .5s cubic-bezier(.55,0,.1,1)

.item-enter
    opacity 0
    transform translate(30px, 0)
.item-leave-active
    position absolute
    opacity 0
    transform translate(30px, 0)


@media (max-width: 991px)
    .news-list
        width 100%
@media (max-width 600px)
    .news-list
        margin 10px 0
</style>
