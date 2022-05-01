<template>
    <div class="orders-main d-flex flex-wrap">
        <v-row cols="12">
            <v-col
                cols="12"
                md="4"
                v-for="order in orders"
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

    private orders: Order[] = []

    async mounted() {
        const contract: Contract = this.$store
        .state.contract;

        await contract.getOrdered().then((orders: Order[]) => {
            orders.forEach((order: any) => {
                const newOrder: Order = {
                    api_id: order.api_id,
                    delivery_day: contract.formatHex(order.delivery_day._hex),
                    worker_address: order.worker_address,
                    title: order.order_title,
                    plan_title: order.plan_title,
                    price: contract.formatHex(order.price._hex),
                    plan_desc: order.plan_desc,
                    status: order.status,
                    desc: order.order_desc,
                    accepted: order.accepted,
                    payed: order.payed,
                    customer_accepted: order.customer_accepted,
                    accepted_at: contract.formatHex(order.accepted_at._hex),
                    ordered_at: contract.formatHex(order.ordered_at._hex)
                }

                this.orders.push(newOrder)
            })
        })
    }
}


</script>