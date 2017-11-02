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
    SET_PAGE: (state, { page, pageData }) => {
        Vue.set(state.page, page, pageData)
        state.tocs = pageData.toc
    },
    SET_ACTIVE_PAGE: (state, { page }) => {
        state.activePage = page
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
    }
}
