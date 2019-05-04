import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

// const createListView = id => () => import('../views/CreateListView').then(m => m.default(id))
// import { createListView } from '../views/CreateListView'
const list = () => import('../views/zero-list')

export function createRouter () {
    const router = new Router({
        mode: 'history',
        // mode: 'hash',
        fallback: false,
        scrollBehavior: (to, from) => {
            if (from.path.startsWith('/pages/') && to.path.startsWith('/pages/')) {
                return
            }
            return { y: 0 }
        },
        routes: [
            {
                path: '/',
                component: list
            },
            {
                path: '/page/:num',
                component: list
            },
            {
                path: '/pages/:page',
                component: () => import('../views/zero-page')
            },
            {
                path: '/categories/:category',
                component: () => import('../views/zero-categories-list')
            },
            {
                path: '/tags/:tag',
                component: () => import('../views/zero-tags-list')
            },
            {
                path: '/archives',
                component: () => import('../views/zero-archives-list')
            },
            {
                path: '/resume',
                component: () => import('../views/zero-alone')
            },
            {
                path: '/about',
                component: () => import('../views/zero-alone')
            }
        ]
    })

    return router
}
