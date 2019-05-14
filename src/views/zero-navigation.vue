<template>
    <nav :class="['nav-content', open ? 'nav-content-show' : '']">
        <div class="nav-content-title">
            <span>
                {{ navTitle }}
            </span>
        </div>
        <div class="nav-content-main">
            <ol class="nav-content-toc" @click="hide">
                <li
                    v-for="nav in navigations"
                    :key="nav.href"
                    class="nav-content-toc-item"
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
                </li>
            </ol>
        </div>
    </nav>
</template>
<script>
export default {
    props: {
        navigations: {
            type: Array,
            default() {
                return [];
            }
        }
    },
    data() {
        return {
            navTitle: "导航",
            open: false,
        };
    },
    methods: {
        show() {
            this.open = true;
            this.$layer.show(null, () => {
                this.open = false;
            });
        },
        hide() {
            return this.$layer.hide();
        }
    }
}
</script>
