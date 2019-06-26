import Vue from 'vue'
import Router from 'vue-router'
import Alone from '../views/zero-alone'

Vue.use(Router)

// const createListView = id => () => import('../views/CreateListView').then(m => m.default(id))
// import { createListView } from '../views/CreateListView'
const list = () => import('../views/zero-list')
const camelize = str => str.charAt(0).toUpperCase() + str.slice(1)
function createAlone (alone) {
    return {
        name: `${alone}-view`,
        asyncData ({ store }) {
            return store.dispatch('FETCH_ALONE_DATA', { type: alone })
        },
        title: camelize(alone),
        render (h) {
            return h(
                Alone,
                {
                    props: { type: alone }
                }
            )
        }
    }
}

export function createRouter () {
    const router = new Router({
        mode: 'history',
        // mode: 'hash',
        fallback: false,
        scrollBehavior: (to, from) => {
            if (from.path.startsWith('/pages/') && to.path.startsWith('/pages/')) {
                return
            }
            return {
                y: 0
            }
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
                component: createAlone('resume')
            },
            {
                path: '/about',
                component: createAlone('about')
            }
        ]
    })

    return router
}
