<template >
    <div style="background-color: #1E1E1E; height: 100%;">
    <v-container>
        <v-row>
            <v-col md="6" sm="12" xs="12">
                <h2 style="color: white;">Orders</h2>

                <v-row v-if="orders.notDone.length > 0">
                    <v-col v-for="order in orders.notDone" :key="order.ordered_at">
                        <OrderComponent :order="order" />
                    </v-col>
                </v-row>
                <span v-else style="color: white;">
                    You don't have orders
                </span>
            </v-col> 
                
            <v-col md="6" sm="12" xs="12">
                <h2 style="color: white;">Done orders</h2>

                <v-row v-if="orders.done.length > 0">
                    <v-col v-for="order in orders.done" :key="order.ordered_at">
                        <OrderComponent :order="order" />
                    </v-col>
                </v-row>
                 <span v-else style="color: white;">
                    You don't have done orders
                </span>
            </v-col>
        </v-row>
    </v-container>
    </div>
</template>

<script lang="ts">
import {Vue, Component, Watch} from 'vue-property-decorator'
import Contract from '../Types/blockchain/Contract';
import Order from '../Types/blockchain/Order';
import OrderComponent from '../components/OrderComponent.vue'
import {ethers} from "ethers"

interface WorkerOrders {
    done: Order[],
    notDone: Order[]
}

@Component({
    components: {
        OrderComponent
    }
})
export default class Dashboard extends Vue {
    @Watch('displayedOrders')

    private get wallet_address(): string {
        return this.$store.state.currentAccount;
    }

    private get orders(): WorkerOrders {
        console.log(this.$store.state.orders)

        const done: Order[] = [];
        const notDone: Order[] = [];

        this.$store.state.orders.forEach((order: Order) => {
            if(["wait.for.seller.accept", "in.progress", "wait.for.customer.accept"].includes(order.status)) notDone.push(order);
            else done.push(order)
        });

        return {done: done, notDone: notDone};
    }
    

}
</script>