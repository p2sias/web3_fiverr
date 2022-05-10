<template>
    <div class="orders-main d-flex flex-wrap">
        <v-row cols="12">
            <v-col
                cols="12"
                md="4"
                v-for="order in ordered"
                :key='order.ordered_at'
            >
                <OrderComponent :order="order" />
            </v-col>
        </v-row>
        

    </div>
</template>

<script lang="ts">

import {Component, Vue} from 'vue-property-decorator'
import OrderComponent from '../../../components/OrderComponent.vue'
import Contract from '../../../Types/blockchain/Contract'
import Order from '../../../Types/blockchain/Order';

@Component({
    components: {
        OrderComponent
    }
})
export default class Orders extends Vue {

    private get ordered(): Order[] {
        return this.$store.state.ordered;
    }
}


</script>