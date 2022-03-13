<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
      dark
    >
      

      <v-spacer></v-spacer>

      <v-btn
        text
      >
        <span class="mr-2">Accueil</span>
        <v-icon>mdi-home-circle-outline</v-icon>
      </v-btn>

      <v-btn
        text
      >
        <span class="mr-2">Support</span>
        <v-icon>mdi-face-agent</v-icon>
      </v-btn>

      <v-btn
        text
      >
        <span class="mr-2" @click="goToProfile">Profil</span>
        <v-icon v-if="!avatarLoaded">mdi-account-circle-outline</v-icon>
        <img class="avatar" v-else :src="avatar" alt="profile pic">
      </v-btn>
    </v-app-bar>

    <v-snackbar
      v-model="snackbar"
      color="red"
      timeout="-1"
    >
      {{ snackbarText }}
    </v-snackbar>

    <v-main id="main-vue">
      <router-view/>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Wallet from './Types/Wallet'
import axios from 'axios'
import User from './Types/User';


@Component
export default class App extends Vue {

  private snackbar = false;
  private snackbarText = "";
  private currentNetwork = "";

  private get walletConnected() {
    return this.$store.state.connected;
  }

  private get avatarLoaded() {
    return this.$store.state.avatarLoaded;
  }

  private get avatar() {
    return this.$store.state.avatar;
  }


  async mounted() {
    this.$store.commit('setWallet', new Wallet())
    
    await this.$store.state.wallet.connected()
    .then(async (connected: boolean) => {
      if(connected) {

        let network = await this.$store.state.wallet.getNetwork()
        
        if(network != 'homestead')
        {
          this.snackbarText = `You are currently on ${network} network, please switch to a mainnet !`
          this.snackbar = true;
        } else this.snackbar = false;

        await axios.get(`http://localhost:9696/api/users/wallet/${this.$store.state.currentAccount}`)
        .then(async (res: any) => {

          if(res.data.length > 0) {
            this.$store.commit('setUser', res.data[0]);
          }

          else {
            await axios.post(`http://localhost:9696/api/users`, {polygon_address: this.$store.state.currentAccount}, {headers: {'Content-Type': 'application/json'}})
            .then((res: any) => {
              this.$store.commit('setUser', res.data);
            })
          }

          

        }).catch((err: any) => {console.log(err)})
      }
    })
    .catch((err: any) => {
      console.log(err)
    })
  }

  private goToProfile()
  {
    this.$router.push({path: '/profile'})
  }
}


</script>

<style>
  .avatar {
    width: 30px;
    height: 30px;

    border-radius: 20px;
  }
</style>