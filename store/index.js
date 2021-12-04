import Vue from 'vue'
import Vuex, { Store } from 'vuex'

Vue.use(Vuex)

const store = () => new Store({

  state: {
    diskSpace: '',
    files: [],
    err: '',
    stdout: '',
    stderr: '',
    durations: {},
    nbFrames: {},
    frameRate: {}
  },
  mutations: {
    updateSpace (state, { size, free }) {
      const filledSpace = Math.round((size - free) / 1073741824 * 100) / 100
      const diskSize = Math.round(size / 1073741824 * 100) / 100
      state.diskSpace = `${filledSpace}/${diskSize}`
    },
    setState (state, { name, value }) {
      state[name] = value
    }
  }
})

export default store
