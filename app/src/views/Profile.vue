<template>
    <v-row v-if="!connected" align="center" cols="12">
        <v-spacer></v-spacer>
        <v-col md="4" sm="8" xs="4">
            <v-card 
                @click="connect()"
                outlined
                tile
                class="connect metamask d-flex justify-space-between align-center"
            >
                <span>Connect with metamask</span>
                <div class="designs d-flex align-center flex-row justify-space-between">
                     <v-progress-circular
                        indeterminate
                        color="primary"
                        v-if="connectLoading"
                        size="25"
                    ></v-progress-circular>

                    <img class="metamaskLogo" src="https://img.icons8.com/color/48/000000/metamask-logo.png"/>
                </div>
               
            </v-card>
        </v-col>
        <v-spacer></v-spacer>
        
    </v-row>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { ethers } from 'ethers';
import Wallet from '../Types/Wallet'
import axios from 'axios'
import User from '../Types/User';

@Component({
    name: "Profile"
})
export default class Home extends Vue {

    private get connected() { 
        return this.$store.state.connected
    }

    private connectLoading = false;

    private async connect() {
        this.connectLoading = true
        await this.$store.state.wallet.connect()
        .then(async () => {
            if(this.connected) {
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
        this.connectLoading = false
    }
  
}
</script>

<style scoped>

    .connect {
        padding: 10px 5px 10px 5px;
    }

    .metamaskLogo {
        width: 30px;
        height: 30px;

        margin-left: 15px;
    }

</style>