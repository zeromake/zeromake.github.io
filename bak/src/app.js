import Vue from 'vue'
import App from './main.vue'
import { createStore } from './store'
import { createRouter } from './router'
// import { sync } from 'vuex-router-sync'
import titleMixin from './util/title'
import * as filters from './util/filters'
import 'font-awesome/css/font-awesome.min.css'
// import 'highlight.js/styles/solarized-dark.css'
import 'prismjs/themes/prism-solarizedlight.css'
import './css/common.styl'
import './css/vue.styl'

Vue.mixin(titleMixin)

Object.keys(filters).forEach(key => {
    Vue.filter(key, filters[key])
})

export function createApp (ssrContext) {
    const store = createStore()
    const router = createRouter()
    // sync(store, router)
    const app = new Vue({
        router,
        store,
        ssrContext,
        render: h => h(App)
    })
    return { app, router, store }
}
