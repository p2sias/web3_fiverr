<template>
    <v-dialog
      v-model="displayed"
      width="1000"
      persistent
    >
      <v-card dark>
        <v-card-title>
          Place new order
        </v-card-title>

        <v-card-text>
            <v-row>
              <v-col>
                <v-card light>
                  <v-card-title>
                    {{job.title}}
                  </v-card-title>

                  <v-card-text class="d-flex flex-column">
                    <span>Selected plan : {{plan.type}}</span>
                    <span>Deliver in {{plan.max_delivery_day}} day(s)</span>
                    <span>From : {{job.user_address}}</span>
                    <span class="align-self-end">Total price (without gas) : {{plan.price}} MATIC</span>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="8" v-for="action in actions" :key="action.action">
                <v-icon v-if="action.status != 'loading'" :color="getIconAction(action.status).color">
                  {{getIconAction(action.status).icon}}
                </v-icon>
                <v-progress-circular
                  v-else
                  indeterminate
                  color="primary"
                  size="25"
                ></v-progress-circular>

                <span>{{action.action}}</span>

              </v-col>
            </v-row>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-btn @click="start()">Submit</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>

<script lang="ts">
import {Vue, Component, Prop} from 'vue-property-decorator'
import Contract from '../Types/blockchain/Contract';
import Order from '../Types/blockchain/Order';
import Wallet from '../Types/blockchain/Wallet';
import { Job, JobPlan } from '../Types/Job'

@Component
export default class PaymentComponent extends Vue {
    @Prop() readonly job: Job | undefined;
    @Prop() readonly plan: JobPlan | undefined;
    
    private orders: Order[] = [];

    private displayed = true;

    private contract: Contract = this.$store.state.contract;
    private wallet: Wallet = this.$store.state.wallet;

    private actions = [
      {action: "Please accept the terms of services by signing in your browser", status: "waiting"},
      {action: "Placing order", status: "waiting"},
      {action: "Please pay order", status: "waiting"},
      {action: "Order done ! Waiting for worker accept", status: "waiting"}
    ]

    private getIconAction(status: string): any {
      if(status == "waiting") return {icon: "mdi-circle", color: "primary"};
      else if(status == "error") return {icon: "mdi-alert-circle", color: "red"};
      else return {icon: "mdi-checkbox-marked-circle", color: "green"};
    }


    private async start(step = "start") {
        const orders = await this.contract.getOrdered()
        if(this.job) {
          const exist = orders.find((x: any) => x.api_id == this.job?._id)

          if (exist && exist.payed == false) {
            this.payOrder(this.job._id as string)
            return
          }
        }

        if(step == "start") {
          
          await this.signTOS();
        }

        if(step == "place" && this.orders && this.job) {
          const job = this.job
          this.actions[0].status = "done";
          
          const job_exist = this.orders.find((x: Order) => x.api_id == job._id);

          if(job_exist) {
            this.actions[1].status = "done";
            this.payOrder(job_exist.api_id as string);
          }
          else await this.placeOrder();
        }

        
    }

    private async signTOS() {
      this.actions[0].status = "loading";
      await this.wallet.signTOS().then(async (res: boolean) => {
          if(res) {

            this.actions[0].status = "done";
            this.actions[1].status = "loading";

            await this.placeOrder()
            
          } else {
            this.actions[0].status = "error"
          }
        })
    }

    private async placeOrder() {
      this.actions[1].status = "loading";
      if(this.plan && this.job) {
          await this.contract.postOrder(
              this.job._id as string,
              this.plan.max_delivery_day,
              this.job.title,
              this.job.about,
              this.plan.type,
              this.plan.plan_desc
          ).then(async (res: boolean) => {
            if(res && this.job) {

              this.actions[1].status = "done";
              await this.payOrder(this.job._id as string);

              
            } else {
                this.actions[1].status = "error";
              }
          });
      }
    }

    private async payOrder(job_id: string) {
      this.actions[0].status = "done";
      this.actions[1].status = "done";
      this.actions[2].status = "loading";


      await this.contract.payOrder(job_id, this.plan?.price.toString() as string)
        .then((res: boolean) => {
          if (res) {
            this.actions[2].status = "done";
            this.actions[3].status = "done";
          } else {
            this.actions[2].status = "error";
          }
        })
    }

    async mounted() {
      await this.contract.getOrdered().then((orders: Order[]) => {
            orders.forEach((order: any) => {
                const newOrder: Order = {
                    api_id: order.api_id,
                    delivery_day: this.contract.formatHex(order.delivery_day._hex),
                    worker_address: order.worker_address,
                    title: order.order_title,
                    plan_title: order.plan_title,
                    price: this.contract.formatHex(order.price._hex),
                    plan_desc: order.plan_desc,
                    status: order.status,
                    desc: order.order_desc,
                    accepted: order.accepted,
                    payed: order.payed,
                    customer_accepted: order.customer_accepted,
                    accepted_at: this.contract.formatHex(order.accepted_at._hex),
                    ordered_at: this.contract.formatHex(order.ordered_at._hex)
                }

                this.orders.push(newOrder)
            })
        })
    }
}
</script>