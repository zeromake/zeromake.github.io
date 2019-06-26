<template>
    <div id="app" class="container">
        <zero-header :navigations="navigations" :showNav="showNav"/>
        <zero-process/>
        <zero-navigation :navigations="navigations" ref="navigation"/>
        <main class="main">
            <transition name="fade" mode="out-in">
                <router-view class="view"></router-view>
            </transition>
        </main>
        <zero-share/>
        <zero-bottom/>
        <zero-footer/>
    </div>
</template>


<script>
import ZeroProcess from 'components/zero-process'
import ZeroHeader from './views/zero-header'
import ZeroNavigation from './views/zero-navigation'
import ZeroShare from './views/zero-share'
import ZeroBottom from './views/zero-bottom'
import ZeroFooter from './views/zero-footer'
export default {
    components: {
        ZeroHeader,
        ZeroNavigation,
        ZeroShare,
        ZeroBottom,
        ZeroProcess,
        ZeroFooter,
    },
    data() {
        return {
            navigations: [
                {
                    title: "Archives",
                    href: "/archives",
                    target: "_self",
                    route: true,
                },
                {
                    title: "Resume",
                    href: "/resume",
                    target: "_self",
                    route: true,
                },
                {
                    title: "About",
                    href: "/about",
                    target: "_self",
                    route: true,
                },
                {
                    title: "Rss",
                    href: "/api/atom.xml",
                    target: "_blank"
                }
            ],
        };
    },
    methods: {
        showNav() {
            if(this.$refs.navigation) {
                this.$refs.navigation.show();
            }
        }
    }
}
</script>
