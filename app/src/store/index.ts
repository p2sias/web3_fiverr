import Vue from 'vue'
import Vuex from 'vuex'
import Wallet from "../Types/Wallet"
import User from "../Types/User"
import axios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    currentAccount: '0x0',
    wallet: null as Wallet | null,
    connected: false,
    user: null as User | null,
    avatar: '',
    avatarLoaded: false
  },
  mutations: {
    setAccount(state, account: string) {
      state.currentAccount = account;
      state.connected = true
    },

    setWallet(state, wallet: Wallet) {
      state.wallet = wallet;
    },

    async setUser(state, user: User) {
      state.user = user

      if (user.avatar) {
        const avatar = await axios.get('http://localhost:9696/api/avatars/' + user.avatar)
        const avatarBuffer = avatar.data[0].avatar.data

        const base64String = 'data:image/png;base64,' + Buffer.from(avatarBuffer).toString('base64')
        state.avatar = base64String;
        state.avatarLoaded = true;
      }
    }
  },
  actions: {
  },
  modules: {
  }
})
