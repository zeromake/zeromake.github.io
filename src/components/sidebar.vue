<template>
<aside class="sidebar">
    <div :class="{'sidebar-inner': true, 'affix': $store.state.showSidebar}">
        <ul v-if="$store.state.tocs" class="sidebar-nav motion-element">
            <li @click="navToggle(1)" :class="{'sidebar-nav-toc': true, 'sidebar-nav-active': nav === 1}">
                文章目录
            </li>
            <li  @click="navToggle(2)" :class="{'sidebar-nav-overview': true, 'sidebar-nav-active': nav === 2}">
                站点概览
            </li>
        </ul>
        <section v-show="nav === 2 || !$store.state.tocs" class="site-overview sidebar-panel sidebar-panel-active">
            <div class="site-author motion-element" itemprop="author" itemscope="" itemtype="http://schema.org/Person">
                <img class="site-author-image" itemprop="image" src="../../public/img/zeromake.svg" alt="zeromake">
                <p class="site-author-name" itemprop="name">ZeroMake</p>
                    <p class="site-description motion-element" itemprop="description">Keep codeing and thinking!</p>
            </div>
            <nav class="site-state motion-element">
                <div class="site-state-item site-state-posts">
                    <a href="javascript:void(0);">
                        <span class="site-state-item-count">{{$store.state.items && $store.state.items.length}}</span>
                        <span class="site-state-item-name">日志</span>
                    </a>
                </div>
                <div class="site-state-item site-state-categories">
                    <a href="javascript:void(0);">
                        <span class="site-state-item-count">{{$store.state.types && $store.state.types.length}}</span>
                        <span class="site-state-item-name">分类</span>
                    </a>
                </div>
                <div class="site-state-item site-state-tags">
                    <a href="javascript:void(0);">
                        <span class="site-state-item-count">{{$store.state.tags && $store.state.tags.length}}</span>
                        <span class="site-state-item-name">标签</span>
                    </a>
                </div>
            </nav>
            <div class="links-of-author motion-element">
                    <span class="links-of-author-item">
                    <a href="https://github.com/zeromake" target="_blank" title="GitHub">
                        <i class="fa fa-fw fa-github"></i>
                            GitHub
                    </a>
                    </span>
                    <span class="links-of-author-item">
                    <a href="https://segmentfault.com/u/zeromake" target="_blank" title="SegmentFault">
                        <i class="fa fa-fw fa-globe"></i>
                            SF
                    </a>
                    </span>
            </div>
        </section>
        <section  v-if="$store.state.tocs" v-show="nav === 1" class="post-toc-wrap motion-element sidebar-panel sidebar-panel-active">
            <div class="post-toc">
                <page-toc :tocs="$store.state.tocs"></page-toc>
            </div>
        </section>
    </div>
</aside>
</template>

<script>
import PageToc from 'components/page-toc'
export default {
    data () {
        return {
            nav: this.$store.state.tocs ? 1 : 2
        }
    },
    components: {
        PageToc
    },
    methods: {
        navToggle (nav) {
            this.nav = nav
        }
    }
}
</script>

<style lang="stylus" scoped>
.sidebar
    overflow hidden
    right auto
    bottom auto
    position static
    float left
    margin-top 300px
    width 240px
    background #f5f7f9
    box-shadow none
.sidebar-inner
    box-sizing: border-box
    width 240px
    color #555
    background #fff
    box-shadow initial
    border-radius initial
    position relative;
    padding 20px 10px
    color #999
    text-align center
.site-author-image
    display block
    margin 0 auto
    padding 2px
    max-width 120px
    height auto
    border 1px solid #eee
.site-author-name
    margin 0
    text-align center
    color #222
    font-weight 600
.site-description
    margin-top 0
    text-align center
    font-size 13px
    color #999
.site-state
    overflow hidden
    line-height 1.4
    white-space nowrap
    text-align center
.site-state-item:first-child
    border-left none
.site-state-item
    display inline-block
    padding 0 15px
    border-left 1px solid #eee
.sidebar a
    text-decoration none
    color #555
.site-state-item a
    border-bottom none
.site-state-item-count
    display block
    text-align center
    color inherit
    font-weight 600
    font-size 16px
.site-state-item-name
    font-size 13px
    color #999
.links-of-author
    margin-top 20px
    display flex
    flex-wrap wrap
    justify-content center
.links-of-author-item
    margin 5px 0 0
    width 50%
.sidebar-inner.affix
    position fixed
    top 12px
.sidebar-nav
    margin 0 0 20px
    padding-left 0
.sidebar-nav .sidebar-nav-active
    color #fc6423
    border-bottom-color #fc6423
.sidebar-nav-toc
    padding 0 5px
.sidebar-nav-overview
    margin-left 10px
.sidebar-nav li
    display inline-block
    cursor pointer
    border-bottom 1px solid transparent
    border-bottom-color transparent
    font-size 14px
    color #555

@media (max-width: 991px)
    .sidebar
        display none
</style>
