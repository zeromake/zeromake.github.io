
export default {
    activeItems (state, getters) {
        return state.items
    },
    activePage (state) {
        return state.page[state.activePage]
    }
}
