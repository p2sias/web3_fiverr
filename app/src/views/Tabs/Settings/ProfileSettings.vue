<template>
    <v-container>
        <v-row>
            <v-col
                cols="4"
            >
                <div class="form-container">
                    <span class="page-title">Profile settings</span>

                    <v-form 
                        v-model="valid"
                        v-on:submit.prevent="save"
                        ref="form"
                    >
                        <v-container>
                        <v-row v-if="connected && userLoaded">
                            <v-col
                                cols="12"
                            >
                            <v-text-field
                                v-model="formField.pseudo"
                                :counter="50"
                                label="Username"
                                dark                               
                                color="white"
                            ></v-text-field>
                            </v-col>

                            <v-col
                                cols="12"

                            >
                                <v-textarea
                                    outlined
                                    
                                    label="Bio"
                                    v-model="formField.bio"
                                    dark

                                    color="white"
                                    no-resize
                                >
                                </v-textarea>
                            </v-col>

                            <v-col
                                cols="12"
                            >
                                <v-text-field
                                    v-model="formField.mail"
                                    :rules="emailRules"
                                    label="Email address"
                                    dark
                                    color="white"
                                ></v-text-field>
                            </v-col>
                        </v-row>
                        </v-container>

                        <v-btn
                            class="mr-4 submit-btn"
                            type="submit"
                            color="#1976D2"
                        >
                            <span style="color: white;">save</span>
                        </v-btn>
                    </v-form>
                </div>
            </v-col>

            <v-col cols="6">
                <div class="profile-images-container">
                    <div class="profile-avatar-container" :style="`background: url(${avatarString}) no-repeat center center; background-size: 150px;`">
                        <div @click="$refs.file.click()">
                            <input type="file" v-on:change="changeAvatar" ref="file" style="display: none">
                            <v-icon color="white" size="40px">mdi-pencil</v-icon>
                        </div>
                    </div>
                </div>
            </v-col>
        </v-row>

        <v-snackbar
            v-model="snackbar"
            :color="snackbarContent.color"
            timeout="2000"
            >
            <span style="color: black;">{{ snackbarContent.text }}</span>

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
    </v-container>
</template>

<script lang="ts">
import {Vue, Component, Watch} from 'vue-property-decorator'
import User from '../../../Types/User';
import axios from 'axios'

@Component
export default class ProfileSettings extends Vue {
    @Watch('user')
    onUserChange(user: User, oldUser: User) {
        this.formField.mail = user.mail;
        this.formField.pseudo = user.pseudo;
        this.formField.bio = user.bio;
    }

    @Watch('avatar')
    onAvatarChange(avatar: string, oldAvatar: string) {
        this.avatarString = avatar;
    }

    private valid = false;

    private get user()
    {
        return this.$store.state.user;
    }

    private get avatar() {
        return this.$store.state.avatar;
    }

    private get connected() {
        return this.$store.state.connected;
    }

    private get userLoaded() {
        return this.$store.state.userLoaded;
    }

    private snackbar = false;

    private snackbarContent = {
        color: '',
        text: ''
    };

    private avatarString = this.avatar ? this.avatar : '';

    private formField = {
        mail:  this.user ? this.user.mail : '', 
        pseudo: this.user ? this.user.pseudo : '',
        bio: this.user ? this.user.bio : ''
    }


    private emailRules = [
        (v: any) => {
            if(v != '' && !/.+@.+/.test(v)) {
             return 'E-mail must be valid';
            } else return true
        }
    ]

    private validate (): void {
        (this.$refs.form as any).validate()
    }
    
    private async changeAvatar(event: any) {
        let reader = new FileReader();

        reader.onloadend = async (evt: any) => {
            if(evt.target.readyState == FileReader.DONE) await this.$store.dispatch('updateAvatar', {avatar: reader.result as string})
        }

        await reader.readAsDataURL(event.target.files[0])
    }

    private async save() {
        this.validate()
        if (this.valid)
        {
            await this.$store.dispatch('updateUser', this.formField).then((res: boolean) => {
                res ? this.snackbarContent = {color: 'green', text: 'Updates succefully saved !'} : this.snackbarContent = {color: 'red', text: 'Updates not saved !'}
            });

            this.snackbar = true;
        }
    }
}
</script>

<style>
    .page-title {
        color: white;
        font-size: 40px;
        font-weight: bold;
    }

    .v-textarea.v-label {
        font-size: 30px;
    }

    .submit-btn {
        border-radius: 15px;
    }

    .profile-avatar-container {
        width: 150px;
        height: 150px;

        border-radius: 100px;

        transition: 0.5s;
    }

    .profile-avatar-container > div {
        width: 100%;
        height: 100%;

        border-radius: 100px;

        cursor: pointer;

        display: none;

        transition: 0.5s;
    }

    .profile-avatar-container:hover > div {
        background-color: rgba(0, 0, 0, 0.3);

        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>