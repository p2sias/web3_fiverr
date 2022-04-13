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
        @click="newJob"
      >
        <span class="mr-2">New job</span>
        <v-icon>mdi-tag-plus</v-icon>
      </v-btn>

      <v-btn
        text
      >
        <span class="mr-2">Support</span>
        <v-icon>mdi-face-agent</v-icon>
      </v-btn>

      <v-btn
        text
        @click="goToProfile"
      >
        <span class="mr-2">Profil</span>
        <v-icon v-if="!userLoaded">mdi-account-circle-outline</v-icon>
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

      <v-dialog
        v-model="jobDialog"
        fullscreen
        hide-overlay
        transition="dialog-bottom-transition"
      >
       
          <JobCreate :user="user" @done="jobDialog = false" />
         
      </v-dialog>
      <v-main id="main-vue">
        <router-view/>
      </v-main>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Wallet from './Types/blockchain/Wallet'
import Contract from './Types/blockchain/Contract'
import axios from 'axios'
import User from './Types/User';
import JobCreate from './components/JobCreate.vue'


@Component({
  components: {
    JobCreate
  }
})
export default class App extends Vue {

  private snackbar = false;
  private snackbarText = "";
  private currentNetwork = "";

  private jobDialog = false;

  private plans = [
    
  ]

  private newJobPictures: string[] = []

  private newJob() {
    this.jobDialog = true;
  }

  private get walletConnected() {
    return this.$store.state.connected;
  }

  private get userLoaded() {
    return this.$store.state.userLoaded;
  }

  private get avatar() {
    return this.$store.state.avatar;
  }

  private get user() {
    return this.$store.state.user;
  }

  private goToProfile() {
    this.$router.push({path: '/account/jobs'})
    window.location.reload();
  }


  async created() {
    this.$store.commit('setWallet', new Wallet())
    this.$store.commit('setContract', new Contract("0x45EFE4EFD2FADE8f8A4F78ACE8e1f73e807AbDc5", this.$store.state.wallet))
    
    await this.$store.state.wallet.connected()
    .then(async (connected: boolean) => {
      if(connected) {

        let network = await this.$store.state.wallet.getNetwork()
        console.log(network)
        
        if(network != 'matic' && network != "maticmum")
        {
          this.snackbarText = `You are currently on ${network} network, please switch to polygon mainnet network !`
          this.snackbar = true;
        } else this.snackbar = false;
      }
    })
    .catch((err: any) => {
      console.log(err)
    })
  }
}


</script>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@300;400;500;600&display=swap');

  * {
    font-family: 'Fredoka', sans-serif;
  }

  .avatar {
    width: 30px;
    height: 30px;

    border-radius: 20px;
  }
</style>