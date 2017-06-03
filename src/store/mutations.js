import Vue from 'vue'
export default {
    SET_ACTIVE_TYPE: (state, { type }) => {
        state.activeType = type
    },
    SET_ITEMS: (state, { items }) => {
        state.items = items
    },
    SET_PAGE: (state, { page, pageData }) => {
        Vue.set(state.page, page, pageData)
    },
    SET_ACTIVE_PAGE: (state, { page }) => {
        state.activePage = page
    }
}
