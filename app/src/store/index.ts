import Vue from 'vue'
import Vuex from 'vuex'
import Wallet from "../Types/blockchain/Wallet"
import User from "../Types/User"
import axios from 'axios'
import Contract from "../Types/blockchain/Contract"
import Order from '@/Types/blockchain/Order'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    currentAccount: '0x0',
    wallet: null as Wallet | null,
    contract: null as Contract | null,
    connected: false,
    user: null as User | null,
    avatar: '',
    userLoaded: false,
    orders: [] as Order[],
    ordered: [] as Order[],
  },
  mutations: {
    setAccount(state, account: string) {
      state.currentAccount = account;
      state.connected = true;
    },

    setUser(state, user: User) {
      state.user = user
    },

    notConnected(state) {
      state.userLoaded = false;
      state.avatar = '';
      state.currentAccount = '0x0';
      state.connected = false;
      state.user = null;
    },

    setAvatar(state, avatar: string) {
      state.avatar = avatar;
      state.userLoaded = true;
    },

    setWallet(state, wallet: Wallet) {
      state.wallet = wallet;
    },

    setContract(state, contract: Contract) {
      state.contract = contract;
    }
  },
  actions: {
    async updateOrdered({state}) {
      await state.contract?.getOrdered().then((orders: Order[]) => state.ordered = orders)
    },

    async updateOrders({state}) {
      await state.contract?.getOrders().then((orders: Order[]) => state.orders = orders)
    },

    async updateUser({state}, user: User): Promise<boolean>
    {
      let userChanged = false;
      if (state.user) {
        await axios.put(`http://localhost:9696/api/users/${state.user._id}`, user, {
          headers: { 'Content-Type': 'application/json'}
        }).then((res) => {
          userChanged = true;
          state.user = res.data;
        })
      }
      
      return true;
    },

    async updateAvatar({ state }, avatar) {
      await axios.put(`http://localhost:9696/api/avatars/${state.user?.avatar}`, avatar, {
          headers: { 'Content-Type': 'application/json'}
        }).then((res) => {
          console.log(res)
        })
    },

    async setAccount({ commit, state }, account) {

      commit('setAccount', account);
      // On regarde si l'utilisateur est déjà inscrit
      await axios.get(`http://localhost:9696/api/users/wallet/${account}`)
        .then(async (res: any) => {

          // Si oui, on le stocke dans le store
          if (res.data.length > 0) {

            const user = res.data[0];
            if (user.jobs) {
              const jobs = await axios.get(`http://localhost:9696/api/users/${user._id}/jobs`)
              user.jobs = jobs.data;
            }
           commit('setUser', user)
          }
          // Sinon, on en créer un nouveau
          else {
            await axios.post(`http://localhost:9696/api/users`, { polygon_address: account }, { headers: { 'Content-Type': 'application/json' } })
              .then((res: any) => {
                commit('setUser', res.data)
              })
          }

          // Si l'utilisateur possède un avatar
          if (state.user && state.user.avatar) {
            const avatar = await axios.get('http://localhost:9696/api/avatars/' + state.user.avatar)
            // Conversion de l'avatar (BUFFER) en image (png) base64
            const avatarBuffer = avatar.data[0].avatar.data
            const base64String = 'data:image/png;base64,' + Buffer.from(avatarBuffer).toString('base64')

            commit('setAvatar', base64String);
          }
        }).catch((err: any) => { console.log(err) });
    }
  },
  modules: {

  },
  getters: {
    
  }
})
