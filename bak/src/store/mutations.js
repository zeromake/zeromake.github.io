import Vue from 'vue'
export default {
    SET_ACTIVE_TYPE: (state, { type }) => {
        state.activeType = type
    },
    SET_ITEMS: (state, { items }) => {
        state.tags = items.tags
        state.types = items.types
        state.items = items.posts
    },
    SET_POST: (state, { post, data }) => {
        Vue.set(state.post, post, data)
        state.tocs = data.toc
    },
    SET_ACTIVE_PAGE: (state, { post }) => {
        state.activePage = post
    },
    SET_CODE: (state, { code }) => {
        state.code = code
    },
    TOGGLE_SIDEBAR: (state, toggle) => {
        if (state.showSidebar !== toggle) {
            state.showSidebar = toggle
        }
    },
    SET_TOCS: (state, tocs) => {
        state.tocs = tocs
    },
    SET_PAGE: (state, { route, num, total }) => {
        state.route = route
        state.num = num
        state.total = total
    },
    COMMENT_CONTANIER: (state, { select }) => {
        state.comment = select
    },
    SET_ACTIVE_ALONE: (state, { type }) => {
        state.activeAlone = type
    },
    SET_ALONE: (state, { type, data }) => {
        Vue.set(state.alone, type, data)
        state.tocs = data.toc
    }
}
