<template>
    <header :class="{header: true, 'hide-header': !show}">
        <div class="header-left">
            <span class="header-left-title">
                <a href="/">{{title}}</a>
            </span>
            <span v-if="motto" class="header-left-motto"> | {{motto}}</span>
        </div>
        <div class="header-right">
            <nav class="header-navigation">
                <template
                    v-for="nav in navigations"
                >
                    <a
                        v-if="!nav.route"
                        :key="nav.href"
                        :href="nav.href"
                        :target="nav.target"
                    >
                        {{nav.title}}
                    </a>
                    <router-link
                        v-else
                        :key="nav.href"
                        :to="nav.href"
                        :target="nav.target"
                    >
                        {{ nav.title }}
                    </router-link>
                </template>
            </nav>
            <div class="header-btn">
                <a href="https://github.com/zeromake" target="_blank" class="header-btn-github">
                    <i class="fa fa-github-alt"></i>
                </a>
                <a href="javascript:void(0);" class="header-btn-search">
                    <i class="fa fa-search"></i>
                </a>
                <a href="javascript:void(0);" class="header-btn-more" @click="showNav">
                    <i class="fa fa-ellipsis-v"></i>
                </a>
            </div>
        </div>
    </header>
</template>

<script>
export default {
    props: {
        navigations: {
            type: Array,
            default() {
                return [];
            }
        },
        showNav: {
            type: Function,
            default: () => {
                return () => {};
            }
        },
        show: {
            type: Boolean,
            default: true,
        }
    },
    name: "ZeroHeader",
    data() {
        return {
            title: "ZEROMAKE",
            motto: "keep codeing and thinking!",
            navTitle: "导航",
            navShow: false
        };
    },
    methods: {

    }
}
</script>
