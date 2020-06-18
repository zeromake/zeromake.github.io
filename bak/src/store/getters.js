
export default {
    activeItems (state, getters) {
        return state.items
    },
    activePage (state) {
        return state.post[state.activePage]
    },
    activeAlone (state) {
        return state.alone[state.activeAlone]
    }
}
