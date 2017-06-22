import Vue from 'vue'
import Vuex from 'vuex'
import actions from './actions'
import mutations from './mutations'
import getters from './getters'

Vue.use(Vuex)

export function createStore () {
    const store = new Vuex.Store({
        state: {
            activeType: null,
            itemsPerPage: 20,
            items: [],
            page: {},
            code: null,
            activePage: null
        },
        actions,
        mutations,
        getters
    })
    return store
}
