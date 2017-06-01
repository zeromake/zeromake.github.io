import {
  fetchIdsByType,
  fetchItem
} from '../api'

export default {
    FETCH_LIST_DATA: ({ commit, dispatch, state }, { type }) => {
        commit('SET_ACTIVE_TYPE', { type })
        return fetchIdsByType(type)
            .then(items => commit('SET_ITEMS', { type, items }))
    },
    FETCH_PAGE_DATA: ({ commit, state }, { page }) => {
        commit('SET_ACTIVE_PAGE', { page })
        const now = Date.now()
        const activePage = state.page[page]
        if (!activePage || (now - activePage.__lastUpdated > 1000 * 180)) {
            return fetchItem(page)
                .then(pageData => commit('SET_PAGE', { page, pageData }))
        }
    }
}
