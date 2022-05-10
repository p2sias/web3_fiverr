<template>
    <div class="main-container">
        <div class="profile-container" v-if="connected && userLoaded">
            <div :class="banner ? 'profile-images-container' : 'profile-images-container no-banner'">
                <img v-if="!otherAccount" class="profile-image" :src="avatar" alt="profilePicture">
                <img v-else class="profile-image" :src="userObject.avatar" alt="profilePicture">
            </div>

            <div class="profile-infos-box">
                <v-row cols="12" justify="end">
                    <v-col md="4" sm="8" xs="4">
                        <div class="profile-actions-container d-flex justify-end" >
                            <v-tooltip bottom v-if="!otherAccount">
                                <template v-slot:activator="{ on, attrs }">
                                    <div class="action" @click="$router.push({path: '/account/settings/profile'})" v-bind="attrs" v-on="on">
                                        <v-icon size="50px" style="color: #8A8C75;">mdi-cog</v-icon>
                                    </div>
                                </template>
                                <span style="font-size: 20px;">Settings</span>
                            </v-tooltip>

                            <v-tooltip bottom v-else>
                                <template v-slot:activator="{ on, attrs }">
                                    <div class="action" v-bind="attrs" v-on="on">
                                        <v-icon size="50px" style="color: #8A8C75;">mdi-share-variant</v-icon>
                                    </div>
                                </template>
                                <span style="font-size: 20px;">Share</span>
                            </v-tooltip>
                        </div>
                    </v-col>
                </v-row>

                <v-row cols="12" justify="center">
                    <v-col md="4" sm="8" xs="4">
                        <div class="profile-infos-container">
                            <span v-if="!otherAccount" class="profile-pseudo profile-element" >{{this.user.pseudo ? this.user.pseudo : "Unnamed"}}</span>
                            <span v-else class="profile-pseudo profile-element" >{{userObject.pseudo ? userObject.pseudo : "Unnamed"}}</span>

                            <span @click="copyAddress" class="profile-address profile-element" >{{otherAccount ? shortAddress(userObject.polygon_address) : shortAddress(this.user.polygon_address)}}</span>

                            <span class="profile-joined profile-element">Joined at {{ otherAccount ? formatDate(userObject.createdAt) : formatDate(this.user.createdAt)}}</span>
                            <div class="profile-element d-flex flex-column align-center bio-container">
                                <span>{{otherAccount ? userObject.bio : user.bio}}</span>
                            </div>
                        </div>
                    </v-col>
                </v-row>
            </div>

            <div :class="`account-content-container ` + checkBioLength(bio)">
                <div v-if="longBio" class="arrow-container d-flex justify-center">
                    <div @click="develop" class="arrow-box d-flex justify-center">
                        <v-icon class="arrow" color="#8A8C75">mdi-chevron-down</v-icon>
                    </div>
                </div>

                <v-row v-if="!otherAccount" justify="center">
                    <v-col cols="6">
                        <v-row justify="center">
                            <v-col 
                                cols="2"
                                v-for="item in navItems" 
                                :key="item.path"
                            >
                                <div 
                                    :class="$route.name == item.path ? 'currentRoute profile-nav-button' : 'profile-nav-button'"
                                    @click="$router.push({name: item.path})"
                                >
                                    <v-icon color="white" size="25px">{{item.icon}}</v-icon>
                                    <span>{{item.title}}</span>
                                </div>
                            </v-col>
                        </v-row>
                    </v-col>
                </v-row>

                <div v-if="otherAccount" class="jobs-main">
                    <JobComponent
                        v-for="job in userObject.jobs"
                        :key="job._id"
                        v-bind:job="job"
                        v-bind:author="userObject"
                    ></JobComponent>
                </div>

                <div class="route-container">
                    <router-view></router-view>
                </div>
            </div>
        </div>
        
        <v-container>
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
            </v-row>
        </v-container>

         <v-snackbar
            v-model="snackbar"
            color="green"
            timeout="2000"
            >
            <span style="color: black;">{{ snackbarText }}</span>

            <template v-slot:action="{ attrs }">
                <v-btn
                color="black"
                text
                v-bind="attrs"
                @click="snackbar = false"
                >
                Close
                </v-btn>
            </template>
        </v-snackbar>
    </div> 
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { ethers } from 'ethers';
import axios from 'axios'
import User from '../Types/User';
import JobComponent from '../components/JobComponent.vue'

@Component({
    name: "Profile",
    components: {
        JobComponent
    }
})
export default class Home extends Vue {
    private otherAccount = false;

    private developed = false;
    private longBio = false;

    private navItems = [
        {path: 'Jobs', icon: 'mdi-format-list-bulleted', title: 'Services'},
        {path: 'Orders', icon: 'mdi-currency-usd', title: 'Orders'}
    ]
    

    private bioButtonText = 'See more'

    private snackbar = false;
    private snackbarText = "";

    private get connected() { 
        return this.$store.state.connected;
    }

    private get userLoaded() {
        return this.$store.state.userLoaded;
    }

    private get avatar() {
        return this.$store.state.avatar;
    }

    private get user(): User { 
        return this.$store.state.user;
    }

    private get bio(): string | null | undefined {
        if(this.otherAccount) return this.userObject.bio;
        return this.user.bio
    }

    private userObject = {
        bio: null,
        pseudo: null,
        avatar: '',
        polygon_address: '',
        createdAt: '',
        jobs: []
    }

    private shortAddress(address: string): string {
        return address.substring(0, 6) + "..." + address.substring(35, address.length-1)
    }

    private formatDate(date: any): string {
        const joined = new Date(date);
        const month = new Intl.DateTimeFormat('en-US', {month: 'long'}).format(joined);
        const year = joined.getFullYear();

        return `${month} ${year}`;
    }

    private develop()
    {
        const contentBox = document.querySelector(".account-content-container") as HTMLBaseElement
        if (!this.developed) {
            contentBox.classList.add('no-developped')
            this.developed = true;
        } else {
            contentBox.classList.remove('no-developped')
            this.developed = false;
        }
    }


    private copyAddress() {
        navigator.clipboard.writeText(this.user.polygon_address);
        this.snackbarText = "Address copied to clipboard !";
        this.snackbar = true;
    }

    private get banner() { return false;}

    private connectLoading = false;

    private async connect() {
        this.connectLoading = true
        await this.$store.state.wallet.connect()
        window.location.reload()
        this.connectLoading = false
    }

    private checkBioLength(bio: string): string {
        if(bio) {
            if (bio.length < 400) {
                return ''
            } else {
                this.longBio = true;
                return 'no-developped'
            }
        } else {
            this.longBio = false;
            return ''
        }
    }

    private async mounted() {

        if(this.$route.params.id)
        {
            await axios.get(`http://localhost:9696/api/users/${this.$route.params.id}`)
            .then(async (res: any) => {
                const user = res.data[0];

                if (user) {
                    this.otherAccount = true;

                    if (user.jobs) {
                        const jobs = await axios.get(`http://localhost:9696/api/users/${user._id}/jobs`)
                        this.userObject.jobs = jobs.data;
                    }
                    
                    user.bio ? this.userObject.bio = user.bio : null
                    user.pseudo ? this.userObject.pseudo = user.pseudo : null
                    this.userObject.polygon_address = user.polygon_address
                    this.userObject.createdAt = this.formatDate(user.createdAt)

                    const avatar = await axios.get('http://localhost:9696/api/avatars/' + user.avatar)
                    // Conversion de l'avatar (BUFFER) en image (png) base64
                    const avatarBuffer = avatar.data[0].avatar.data
                    const base64String = 'data:image/png;base64,' + Buffer.from(avatarBuffer).toString('base64')

                    this.userObject.avatar = base64String;
                } 

            }).catch((err: any) => {
                this.$router.push({name: 'Profile'})
            });

        }

        this.$store.state.wallet.connected() 
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

    .profile-images-container {
        width: 100%;
        height: 200px;
        margin: 0;
        padding: 0;
    }

    .main-container {
        margin: 0;
        background-color: #202225;
        height: 100%;
    }

    .profile-image {
        width: 150px;
        height: 150px;
        position: absolute;
        left: 50%;
        right: 50%;
        transform: translate(-50%);

        top: 125px;

        border: solid gray 3px;
        border-radius: 100px;
    }

    .no-banner {
        background-color: gray;
    }

    .profile-infos-container {
        background-color: #202225;

        display: flex;
        flex-direction: column;

        align-items: center;
    }

    .profile-nav-button {
        color: white;
        font-size: 20px;

        display: flex;
        justify-content: center;
        align-items: center;
        padding: 5px 5px 5px 5px;

        cursor: pointer;
    }

    .profile-nav-button span {
        margin-left: 5px;
    }
    

    .profile-element {
        margin: 10px 0 10px 0;
        color: #8A8C75;
    }

    .profile-pseudo {
        font-size: 35px;
        font-weight: bold;
        color: white;
    }

    .profile-address {
        border: solid black 1px;
        padding: 5px 10px 5px 10px;
        border-radius: 20px;
        cursor: pointer;
        font-size: 20px;

        transition: 0.5s;
    }

    .profile-joined {
        font-size: 20px;
    }

    .profile-address:hover {
        color: white;
    }

    .profile-actions-container .action {
        border: solid gray 1px;
        padding: 5px;
        border-radius: 10px;
        cursor: pointer;
    }

   

    .see-more:hover {
        color: white;
    }

    .account-content-container {
        position: relative;
        width: 100%;
        background-color: #202225;
        min-height: 350px;
        
        box-shadow: none;
        -webkit-box-shadow: none;
        
    }

    .arrow-box {
        width: 200px;
        cursor: pointer;

        border-radius: 20px;

        transition: 0.5s;
    }

    .arrow-box:hover {
        background: rgba(128, 128, 128, 0.10);
    }

    .arrow-container {
        padding: 5px 0 5px 0;
    }

    .no-developped {
        -webkit-box-shadow: 0px -12px 43px 16px #202225; 
        box-shadow: 0px -12px 43px 16px #202225;
        top: -350px;
    }



   

    .currentRoute {
        border-bottom: solid white 1px;
    }


</style>