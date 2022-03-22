<template>
    <v-container>
        <v-row>
            <v-col cols="6">
                <v-form
                    ref="form"
                    v-model="valid"
                    lazy-validation
                >
                    <v-row>
                        <v-col cols="2" class="d-flex align-center">
                            <span style="font-size: 20px;">I will</span>
                        </v-col>

                        <v-col cols="10">
                            <v-text-field
                                v-model="newJobObject.title"
                                :counter="30"
                                :rules="titleRules"
                                label="Title"
                                required
                            ></v-text-field>
                        </v-col>
                    </v-row>

                    <v-row>
                        <v-col>
                            <v-textarea
                                outlined
                                label="Job desc"
                                v-model="newJobObject.about"
                                no-resize
                            >
                            </v-textarea>

                            <v-select
                                v-model="newJobObject.category"
                                :items="categories"
                                :rules="[v => !!v || 'Item is required']"
                                label="Category"
                                item-text="name"
                                required
                            ></v-select>
                        </v-col>
                    </v-row>
                </v-form>
            </v-col>

            <v-col>

            </v-col>
        </v-row>

        <v-row>
            <v-col cols="12" class="d-flex justify-space-between flex-wrap">
                    <v-card
                        v-for="plan in newJobObject.plans"
                        :key="plan.type"
                        dark

                        width="500px"
                    >   
                        <v-card-title class="d-flex justify-space-between">
                            <span>{{plan.type}}</span>
                            <v-switch
                                v-model="plan.activated"
                            ></v-switch>
                        </v-card-title>
                        <v-card-text>
                            <v-text-field
                                :disabled="!plan.activated"
                                v-model="plan.plan_desc"
                                :counter="100"
                                label="Description"
                                required
                            ></v-text-field>

                            

                            <v-row>
                                <v-col>
                                    <v-text-field
                                        :disabled="!plan.activated"
                                        v-model="plan.price"
                                        type="number"
                                        label="Price"
                                        required
                                    ></v-text-field>
                                </v-col>
                                <v-col class="d-flex align-center">
                                    <span style="font-size: 20px;">MATIC</span>
                                </v-col>
                            </v-row>
                        </v-card-text>
                    </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import {Vue, Component, Prop} from 'vue-property-decorator'
import User from '../Types/User';
import axios from 'axios'

@Component
export default class JobCreate extends Vue {
    @Prop() readonly user: User | undefined;

    private valid = true;

    private newJobObject = {
        title: '',
        about: '',
        user: '',
        plans: [
            {type: "Basic", price: 0, plan_desc: '', max_delivery_day: 0, activated: false},
            {type: "Standard", price: 0, plan_desc: '', max_delivery_day: 0, activated: false},
            {type: "Premium", price: 0, plan_desc: '', max_delivery_day: 0, activated: false}
        ],
        category: null
    }

    private categories: any = []

    private titleRules = [
        (v: any) => !!v || 'Title is required',
        (v: any) => v.length <= 30 || 'Title must be less than 30 characters',
    ]

    private reset() {
        this.newJobObject = {
            title: '',
            about: '',
            user: '',
            plans: [
                {type: "Basic", price: 0, plan_desc: '', max_delivery_day: 0, activated: false},
                {type: "Standard", price: 0, plan_desc: '', max_delivery_day: 0, activated: false},
                {type: "Premium", price: 0, plan_desc: '', max_delivery_day: 0, activated: false}
            ],
            category: null
        }
    }


    private mounted() {
        axios.get(`http://localhost:9696/api/categories`)
        .then((res: any) => {
            for(const category of res.data) {
                this.categories.push(category);
            } 
        });
    }
}
</script>