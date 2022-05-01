<template>
    <div class="job-container">
        <v-card
        :loading="loading"
        class="mx-auto my-12 job-card"
        max-width="374"
        >
            <template slot="progress">
                <v-progress-linear
                    color="deep-purple"
                    height="10"
                    indeterminate
                ></v-progress-linear>
            </template>

            <v-img
                height="200"
                :src="pictures[0]"
            ></v-img>

            <v-card-title>{{job.title}}</v-card-title>

            <v-card-text class="d-flex flex-column align-start">
                <div class="address-container">{{author.pseudo ? author.pseudo : shortAddress(author.polygon_address)}}</div>
                <div class="my-4 text-subtitle-1">
                    À partir de {{getLowestPrice(job)}} MATIC
                </div>
                <div>{{shortAbout(job.about)}}</div>
            </v-card-text>

            <v-divider class="mx-4"></v-divider>

            <v-card-actions>
                <v-btn
                    color="deep-purple lighten-2"
                    text
                    @click="show"
                >
                    Show
                </v-btn>
            </v-card-actions>
        </v-card>

        <v-dialog
            v-model="dialog"
            width="1200"
            dark
        >
            <v-card>
                <v-card-title  class="text-h5 darkw lighten-2 d-flex justify-space-between">
                    <span>{{job.title}}</span>
                    <v-icon color="red" @click="dialog = false">mdi-close</v-icon>
                </v-card-title>

                <v-card-text>
                    <v-container>
                        <v-row class="justify-center">
                        <v-col cols="6" class=" xs-12">
                                <v-carousel height="250">
                                    <v-carousel-item
                                        v-for="(picture, i) in pictures"
                                        :key="i"
                                    >
                                        <img class="caroussel-image" :src="picture" alt="">
                                    </v-carousel-item>
                                </v-carousel>
                        </v-col>
                        </v-row>

                        <v-row>
                            <v-col cols="12">
                                <div class="job-desc">
                                    <p>
                                        {{job.about}}
                                    </p>
                                </div>
                            </v-col>
                        </v-row>
                        
                        <v-row>
                            <v-container>
                                
                                <span class="plan-section-title">Plans</span>
                                <v-col cols="12" class="d-flex justify-center flex-wrap">
                                    <v-card
                                        color="#3b3c3f"
                                        v-for="plan in job.plans"
                                        :key="plan._id"
                                        min-width="350px"
                                        max-width="350px"
                                        class="ma-5 d-flex flex-column justify-space-between"
                                    >
                                        <v-card-title>{{plan.type}}</v-card-title>
                                        <v-divider light></v-divider>
                                        <v-card-text>
                                            {{plan.plan_desc}}
                                        </v-card-text>
                                        
                                        <v-container>
                                            <v-card-actions class="d-flex justify-space-between">
                                                <v-btn @click="placeOrder(plan)">
                                                    <v-icon>mdi-cash</v-icon>
                                                    <span>{{plan.price}} MATIC</span>
                                                </v-btn>
                                                <span>Livraison dans {{plan.max_delivery_day}} jours</span>
                                            </v-card-actions>
                                        </v-container>
                                    </v-card>
                                </v-col>
                            </v-container>
                        </v-row>
                    </v-container>
                </v-card-text>
            </v-card>
        </v-dialog>

        <v-container v-if="payment_process">
            <PaymentComponent :job="job" :plan="plan_to_order" />
        </v-container>
    </div>
</template>

<script lang="ts">
import {Vue, Component, Prop} from "vue-property-decorator";
import {Job, JobPlan} from '../Types/Job'
import axios from 'axios'
import User from "../Types/User";
import PaymentComponent from '../components/PaymentComponent.vue'
import Contract from "../Types/blockchain/Contract";

@Component({
    components: {
        PaymentComponent
    }
})
export default class JobComponent extends Vue {

    @Prop() readonly job: Job | undefined
    @Prop() readonly author: User | undefined

    private dialog = false;
    private loading = false;
    private pictures: any[] = [];

    private shortAddress(address: string): string {
        return address.substring(0, 6) + "..." + address.substring(35, address.length-1)
    }

    private getLowestPrice(job: any): number {
        if(job) {
            let price = 0;

            for(const plan of job.plans) {
                if(price == 0) price = plan.price
                if(plan.price < price) price = plan.price
            }

            return price
        } return 0
        
    }

    private shortAbout(about: string) {
        if(about && about.length > 130) {
            return about.substring(0, 130) + '...'
        }
    }

    private async mounted() {
        if(this.job) {
            await axios.get(`http://localhost:9696/api/jobs/${this.job._id}/pictures`)
            .then((res) => {
                for(const photo of res.data) {
                    const pictureBuffer = photo.image.data;
                    const base64String = Buffer.from(pictureBuffer).toString();
                    this.pictures.push(base64String);
                }
            })
        } 
    }

    private show() {
        this.dialog = true;
    }

    private plan_to_order: JobPlan | null = null
    private payment_process = false; 

    private async placeOrder(plan: JobPlan) {
        this.plan_to_order = plan;
        this.payment_process = true;
    }
}

</script>

<style scoped>
    .job-container {
        margin: 0 20px 0 20px;
    }

    .caroussel-image {
        width: 100%;
        height: 100%;
    }

    .plan {
        background-color: #3b3c3f;
    }

    .plan-section-title {
        font-weight: bold;
        color: white;
        font-size: 35px;
    }

    .address-container {
        border: solid black 1px;
        font-size: 18px;
        color: white;
        background-color: #3b3c3f;
        border-radius: 20px;
        padding: 2px 8px 4px 8px;
        
    }
</style>