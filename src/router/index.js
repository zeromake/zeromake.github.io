import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const createListView = id => () => import('../views/CreateListView').then(m => m.default(id))
// import { createListView } from '../views/CreateListView'

export function createRouter () {
    const router = new Router({
        mode: 'history',
        scrollBehavior: (to, from) => {
            if (to.path.indexOf('/pages/') === 0) {
                return
            }
            return { y: 0 }
        },
        routes: [
            { path: '/', component: createListView('posts') },
            { path: '/pages/:page', component: () => import('../views/Page') }
        ]
    })

    return router
}
