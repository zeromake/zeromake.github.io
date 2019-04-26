import Vue from 'vue'
import 'es6-promise/auto'
import 'unfetch/polyfill'
// import 'font-awesome/css/font-awesome.min.css'
import { createApp } from './app'
import ProgressBar from 'components/ProgressBar.vue'
import ZeroLayer from 'components/zero-layer'
import Gitment from 'gitment'
// import 'prismjs/themes/prism-tomorrow.css'
import 'prismjs/themes/prism-solarizedlight.css'
import 'gitment/style/default.css'
import 'primer-markdown/build/build.css'
// import flowchart from 'flowchart.js/release/flowchart.js'

const bar = new Vue(ProgressBar).$mount()
const layer = new Vue(ZeroLayer).$mount()
document.body.appendChild(bar.$el)
document.body.appendChild(layer.$el)
if (Object.defineProperty) {
    Object.defineProperty(Vue.prototype, '$bar', {
        value: bar,
        enumerable: true
    })
    Object.defineProperty(Vue.prototype, '$gitment', {
        value: Gitment,
        enumerable: true
    })
    Object.defineProperty(Vue.prototype, '$layer', {
        value: layer,
        enumerable: true
    })
    // Object.defineProperty(Vue.prototype, '$flowchart', {
    //     value: flowchart,
    //     enumerable: true
    // })
} else {
    Vue.prototype.$gitment = Gitment
    Vue.prototype.$bar = bar
    Vue.prototype.$layer = layer
    // Vue.prototype.$flowchart = flowchart
}

/* Vue.mixin({
    beforeRouteUpdate (to, from, next) {
        const { asyncData } = this.$options
        if (asyncData) {
            asyncData({
                store: this.$store,
                route: to
            }).then(next).catch(next)
        } else {
            next()
        }
    }
}) */

const { app, router, store } = createApp()

if (window.__INITIAL_STATE__) {
    /* let url = location.pathname
    if (location.search) url += location.search
    if (location.hash) url += location.hash
    const nowRoute = router.match(url)
    window.__INITIAL_STATE__.route.query = nowRoute.query
    window.__INITIAL_STATE__.route.hash = nowRoute.hash */
    store.replaceState(window.__INITIAL_STATE__)
}
router.onReady(() => {
    router.beforeResolve((to, from, next) => {
        const matched = router.getMatchedComponents(to)
        const prevMatched = router.getMatchedComponents(from)
        let diffed = false
        const activated = matched.filter((c, i) => {
            return diffed || (diffed = (prevMatched[i] !== c))
        })
        const asyncDataHooks = activated.map(c => c.asyncData).filter(_ => _)
        if (!asyncDataHooks.length) {
            return next()
        }
        bar.start()
        Promise.all(asyncDataHooks.map(hook => hook({ store, route: to }))).then(() => {
            bar.finish()
            next()
        }).catch(next)
    })
    app.$mount('#app')
})

if (location.protocol === 'https:' && navigator.serviceWorker) {
    navigator.serviceWorker.register('/service-worker.js')
}
