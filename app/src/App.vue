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
        <span class="mr-2">Profil</span>
        <v-icon>mdi-account-circle-outline</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <router-view/>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class App extends Vue {
  
}


</script>
