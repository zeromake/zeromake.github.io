import {
    fetchPostsByType,
    fetchPage
} from '../api'

export default {
    FETCH_LIST_DATA: ({ commit, dispatch, state }, { type }) => {
        commit('SET_ACTIVE_TYPE', { type })
        return fetchPostsByType(type)
            .then(items => commit('SET_ITEMS', { type, items }))
    },
    FETCH_POST_DATA: ({ commit, state }, { post }) => {
        commit('SET_ACTIVE_PAGE', { post })
        const now = Date.now()
        const activePage = state.post[post]
        if (!activePage || (now - activePage.__lastUpdated > 1000 * 180)) {
            return fetchPage(post)
                .then(data => commit('SET_POST', { post, data }))
        }
    },
    SET_CODE: ({ commit }, { code }) => {
        commit('SET_CODE', { code })
    },
    SET_PAGE: ({ commit }, { num, route }) => {
        commit('SET_PAGE', { num, route })
    },
    FETCH_ALONE_DATA: ({ commit, state }, { type }) => {
        commit('SET_ACTIVE_ALONE', { type })
        const now = Date.now()
        const activeAlone = state.alone[type]
        if (!activeAlone || (now - activeAlone.__lastUpdated > 1000 * 180)) {
            return fetchPostsByType(type)
                .then(data => commit('SET_ALONE', { type, data }))
        }
    }
}
