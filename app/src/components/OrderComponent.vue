<template>
    <v-container>
        <v-card
            style="padding: 0 10px 0 10px; cursor: pointer;"
        >
            <div class="d-flex justify-space-between">
                <v-card-title @click="orderDetails = true">{{order.title}}</v-card-title>

                 <v-tooltip v-if="!loading" bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <v-icon
                            :color="(statusFormat).color"
                            v-bind="attrs" 
                            v-on="on" 
                            
                        >mdi-checkbox-blank-circle</v-icon>
                    </template>
                    <span style="font-size: 20px;">{{(statusFormat).title}}</span>
                </v-tooltip>
                <v-progress-circular
                    v-else
                    indeterminate
                    color="primary"
                ></v-progress-circular>
            </div>
            
            <v-card-text class="d-flex justify-space-between">
                <v-card-text class="d-flex flex-column">
                    <span v-if="isOwner">From: {{order.ordered_by}}</span>
                </v-card-text>
            </v-card-text>

            <v-card-actions v-if="isOwner">
                <v-btn 
                    v-if="isOrderPendingAcceptBySeller" 
                    color="green" 
                    @click="acceptOrDeclineOrder('accept')"
                    :disabled="acceptAllowed"
                >Accept</v-btn>

                 <v-btn 
                    v-if="isOrderPendingAcceptBySeller" 
                    color="red" 
                    @click="declineReason = true"
                    :disabled="acceptAllowed"
                >Decline</v-btn>
            </v-card-actions>
        </v-card>

        <v-dialog
            v-model="orderDetails"
            width="70%"
        >   
            
            <v-card>
                <v-container>
                    <v-card-title class="d-flex justify-space-between">
                        <span>{{order.title}}</span>
                        <v-icon color="red" @click="orderDetails = false">mdi-close</v-icon>
                    </v-card-title>
                    <v-card-text>
                        <v-row cols="12">
                            <v-col>
                                <v-card
                                    dark
                                >
                                    <v-card-title>
                                        <span>Order details</span>  
                                        
                                    </v-card-title>

                                    <v-card-text class="d-flex flex-column justify-space-around">
                                        <span>Job description : {{order.desc}}</span>
                                        <span>Selected plan : {{order.plan_title}}</span>
                                        <span>Plan description : {{order.plan_desc}}</span>
                                        <span>Order price : {{formatPrice(order.price)}} MATIC</span>
                                        <span>Status : {{statusFormat.title}}</span>

                                        <span v-if="!isOrderDeclinedByCustomer && !isOrderAccepted">Decline reason : {{order.decline_reason}}</span>
                                    </v-card-text>
                                </v-card>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col md="6" sm="12" xs="12">
                                <v-carousel height="250">
                                    <v-carousel-item
                                        v-for="(picture, i) in pictures"
                                        :key="i"
                                    >
                                        <img class="caroussel-image" :src="picture" alt="">
                                    </v-carousel-item>
                                </v-carousel>
                            </v-col>

                            <v-col>
                                <v-card
                                    dark
                                >
                                    <v-card-title>
                                        User informations
                                    </v-card-title>

                                    <v-card-text>
                                        <span>User address {{order.ordered_by}}</span>
                                        <p>
                                            <span>Details from user</span>
                                            
                                            <span>{{order.user_infos}}</span>
                                        </p>
                                    </v-card-text>
                                </v-card>

                                <v-card v-if="isOrderDone || isOrderDeclinedByCustomer || isOrderPendingAcceptByCustomer">
                                    <v-card-title>Order result</v-card-title>
                                    <v-card-text>
                                        IPFS link: <a :href="ipfsLink" target="_blank">Download</a>

                                        <div v-if="isOrderDeclinedByCustomer">
                                            <span v-if="isOrderDone && isOwner">
                                                This order was accepted by customer !
                                            </span>

                                            <span v-if="isOrderDone && isCustomer">
                                                You accepted this order !
                                            </span>

                                            <span v-if="isOrderDeclinedByCustomer && isOwner">
                                                This order was declined by customer, please contact an admin !
                                            </span>

                                            <span v-if="isOrderDeclinedByCustomer && isCustomer">
                                                You declined this order, please contact an admin for a refund !
                                            </span>
                                        </div>
                                    </v-card-text>



                                    <v-card-action
                                        v-if="isOrderPendingAcceptByCustomer && isCustomer"
                                    >
                                        <v-container>
                                            <v-btn
                                                color="green"
                                                @click="acceptOrDeclineOrder('accept')"
                                            >
                                                Accept
                                            </v-btn>

                                            <v-btn
                                                color="red"
                                                @click="declineReason = true"
                                            >
                                                Decline
                                            </v-btn>
                                        </v-container>
                                    </v-card-action>
                                </v-card>
                            </v-col>

                            
                        </v-row>
                    </v-card-text>
                    <v-divider></v-divider>
                    <v-card-actions>
                        <v-row v-if="isOrderPendingAcceptBySeller && isOwner">
                            <v-col>
                                <v-btn 
                                     
                                    color="green" 
                                    @click="acceptOrDeclineOrder('accept')"
                                    :disabled="acceptAllowed"
                                >Accept</v-btn>

                                <v-btn 
                                    color="red" 
                                    @click="declineReason = true"
                                    :disabled="acceptAllowed"
                                >Decline</v-btn>
                            </v-col>
                        </v-row>
                    
                        <v-row v-if="isOwner && isOrderAccepted && !isOrderEnded">
                           <v-col cols="6" class="d-flex justify-space-around">
                                <v-file-input
                                    label="Please provide your work"
                                    outlined
                                    dense
                                    width="50px"
                                    loading="true"
                                    v-model="file"
                                ></v-file-input>

                                <v-btn 
                                    color="green" 
                                    @click="finishOrder"
                                >Done</v-btn>
                           </v-col>
                        </v-row>
                    </v-card-actions>
                </v-container>
            </v-card>
        </v-dialog>

        <v-dialog
            v-model="declineReason"
        >
            <v-card>
                <v-card-title>
                    <span>Decline reason</span>
                    <v-icon color="red" @click="declineReason = false">mdi-close</v-icon>
                </v-card-title>

                <v-card-text>
                    <v-textarea
                        v-model="declineReasonText"
                        label="Please provide a reason"
                    >
                    </v-textarea>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-actions>
                    <v-btn
                        @click="acceptOrDeclineOrder('decline')"
                    >Decline</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script lang='ts'>
import {Vue, Component, Prop} from 'vue-property-decorator'
import Contract from '../Types/blockchain/Contract';
import Order from '../Types/blockchain/Order'
import axios from 'axios'
import  { create } from 'ipfs-http-client'

interface Status {
    title: string,
    color: string
}

@Component
export default class OrderComponent extends Vue {

    @Prop() readonly order: Order | undefined

    private loading = false;

    private acceptAllowed = false;

    private orderDetails = false;

    private declineReason = false;

    private file: File | null = null;

    private declineReasonText = "";

    private pictures: any[] = [];

    private formatPrice(price: number): number {
        return price * Math.pow(10, -18);
    }

    private get statusFormat(): Status | undefined {
        if (this.order) {
            switch (this.order.status) {
                case "wait.for.seller.accept":
                    return {title: "Wait for seller accept", color: "orange"}
                case "wait.for.customer.accept":
                    return {title: "Seller posted result", color: "orange"}
                case "seller.declined":
                    return {title: "Declined", color: "red"}
                case "customer.declined":
                    return {title: "Declined by customer", color: "red"}
                case "in.progress":
                    return {title: "In progress", color: "orange"}
                case "done":
                    return {title: "Done", color: "green"}
                default:
                    return {title: "Pending", color: "orange"}
            } 
        } return {title: "Undefined", color: "black"}
    }

    private get formatDate(): string {
        if(this.order)
        {
            const joined = new Date(this.order.ordered_at * 1000);
            const day = joined.getDate()
            const month = joined.getMonth()
            const year = joined.getFullYear()

            return `${day}/${month}/${year}`;
        } return ""
    }

    private get isOrderAccepted(): boolean {
        if(this.order && this.order.status == "in.progress") return true;
        return false;
    }

    private get isOrderDone(): boolean {
        if(this.order && this.order.status == "done") return true;
        return false;
    }

    private get isCustomer(): boolean {
        if(this.order) {
            return this.$store.state.currentAccount == this.order.ordered_by.toLowerCase();
        }return false;
    }

    private get isOrderAcceptedByCustomer(): boolean {
        if(this.order && this.order.customer_accepted) return true;
        return false;
    }

    private get isOrderDeclinedByCustomer(): boolean {
        if(this.order) {
            return this.order.status == "customer.declined";
        } return false
    }

    private get isOwner(): boolean {        
        if(this.order && this.order.worker_address.toLowerCase() == this.$store.state.currentAccount) return true;
        else return false;
    }

    private get isOrderPendingAcceptBySeller(): boolean {
        if(this.order && this.order.status == "wait.for.seller.accept") return true;
        return false;
    }

    private get isOrderPendingAcceptByCustomer(): boolean {
        if(this.order && this.order.status == "wait.for.customer.accept") return true;
        return false;
    }

    private get isOrderEnded(): boolean {
        if(this.order && (this.isOrderAcceptedByCustomer || this.order.status == "declined" || this.order.status == "done")) return true;
        return false;
    }

    private async acceptOrDeclineOrder(action: string): Promise<void> {
        console.log(this.declineReasonText)
        if(this.order) {
            this.loading = true;
            this.acceptAllowed = true;
            const _contract: Contract = this.$store.state.contract;
            await _contract.acceptOrDeclineWork(this.order, action, this.declineReasonText);
            this.loading = false;
            this.acceptAllowed = false;
        }
    }

    private async finishOrder() {
        this.loading = true;
        const auth = "Basic MjhrcmpoU2ZrcXRXTUt6aWRUT3RndE5yTktFOjAxZWUxNjU3YjVmM2RkZmE5NmMyMWMwNDI2MjdhZjM3"
        
        const ipfs_client = create({
            host: "ipfs.infura.io",
            port: 5001,
            protocol: 'https',
            headers: {
                authorization: auth
            },
        });

        if(this.file) {
            await ipfs_client.add(this.file as File).then(async (res: any) => {
                let contract: Contract = this.$store.state.contract;
                
                if(this.order) {
                    await contract.finishOrder(this.order.api_id, this.order.ordered_by, this.order.ordered_at, res.path)
                }
            })        
        }

        this.loading = false;
    }

    private get ipfsLink(): string {
        if(this.order) return `https://ipfs.infura-ipfs.io/ipfs/${this.order.ipfs_hash}`;
        return ""
    }

    async mounted() {
        if(this.order) {
            await axios.get(`http://localhost:9696/api/jobs/${this.order.api_id}/pictures`)
            .then((res) => {
                for(const photo of res.data) {
                    const pictureBuffer = photo.image.data;
                    const base64String = Buffer.from(pictureBuffer).toString();
                    this.pictures.push(base64String);
                }
            })
        } 
    }
}

</script>

<style>

</style>