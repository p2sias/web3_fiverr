<template>
    <v-container>
        <v-row cols="12">
            <v-col md="6">

            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import {Vue, Component} from "vue-property-decorator"
import Order from "../Types/blockchain/Order"

@Component
export default class AdminPanel extends Vue {

    
    private orders: Order[] = [];

    created() {
        if(!this.$store.state.admin) this.$router.push({path: '/account/jobs'});
    }
}
</script>