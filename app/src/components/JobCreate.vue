<template>
    <v-card dark>
          <v-toolbar
            dark
            color="primary"
          >
            <v-btn
              icon
              dark
              @click="$emit('done')"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
            <v-toolbar-title>New Job</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-toolbar-items>
              <v-btn
                dark
                text
                @click="save"
              >
                <div v-if="!jobLoading">
                    <v-icon>mdi-content-save</v-icon>  
                    <span>Save</span>
                </div>
                <v-progress-circular
                    v-else
                    indeterminate
                    color="red"
                ></v-progress-circular>
               
              </v-btn>
            </v-toolbar-items>
          </v-toolbar>

        <v-container>
            <v-row>
                <v-col md="4" sm="12">
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

                <v-col md="8" sm="12">
                    <v-card min-width="400px">
                        <v-card-title class="d-flex justify-space-between">
                            <span>Pictures</span>
                            <v-btn @click="$refs.file.click()" :disabled="pictures.length == 5">
                                <v-icon color="green">mdi-plus</v-icon>
                                <input type="file" v-on:change="addPicture" ref="file" style="display: none">
                            </v-btn>
                        </v-card-title>

                        <v-card-text class="d-flex flex-wrap justify-center">
                                <div 
                                    v-for="picture in pictures"
                                    :key="picture.id"
                                    class="picture-preview-container d-flex justify-center align-center"
                                    :style="`background: url(${picture.image}) no-repeat center center;`"
                                    @click="deletePicture(picture.id)"
                                >
                                    <v-icon color="white" class="delete-icon" size="50">mdi-close</v-icon>
                                </div>
                        </v-card-text>
                    </v-card>
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

                                <v-text-field
                                            :disabled="!plan.activated"
                                            v-model="plan.max_delivery_day"
                                            type="number"
                                            label="Delivery days"
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
    </v-card>
</template>

<script lang="ts">
import {Vue, Component, Prop} from 'vue-property-decorator'
import User from '../Types/User';
import axios from 'axios'
import {Job , JobPlan} from '../Types/Job';

@Component
export default class JobCreate extends Vue {
    @Prop() readonly user: User | undefined;

    private valid = true;

    private jobLoading = false;

    private newJobObject = {
        title: '',
        about: '',
        user: '',
        plans: [
            {type: "Basic", price: 0, plan_desc: '', max_delivery_day: 0, activated: false},
            {type: "Standard", price: 0, plan_desc: '', max_delivery_day: 0, activated: false},
            {type: "Premium", price: 0, plan_desc: '', max_delivery_day: 0, activated: false}
        ],
        category: ''
    }

    private pictures: {id: string, image: string}[] = []

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
            category: ''
        }

        this.pictures = []
    }

    private deletePicture(id: string)
    {
        let item = this.pictures.find(x => x.id == id);
        if(item) {
            this.pictures.splice(this.pictures.indexOf(item), 1);
        }
    }

    private async addPicture(event: any) {
        let reader = new FileReader();

        reader.onloadend = async (evt: any) => {
            if(evt.target.readyState == FileReader.DONE) {

                let image = new Image();
                image.src = reader.result as string;
                
                image.onload = () => {
                    this.pictures.push({
                        id: (Math.random() + 1).toString(36).substring(7),
                        image: reader.result as string,
                    });
                }
            }
        }
        await reader.readAsDataURL(event.target.files[0])
    }

    private async save() {
        if(this.user && this.newJobObject.category) {
            this.jobLoading = true;
            let job = {
                title: '',
                about: '',
                user: '',
                plans: [] as JobPlan[],
                category: '',
                photos: [] as Buffer[]
            }

            job.title = "I will " + this.newJobObject.title;
            job.about = this.newJobObject.about;

            if(this.user._id){
                job.user = this.user._id;
            }
            
            for(const plan of this.newJobObject.plans) {
                if(plan.activated)
                {
                    job.plans.push({
                        type: plan.type,
                        price: plan.price as number,
                        plan_desc: plan.plan_desc,
                        max_delivery_day: plan.max_delivery_day
                    });
                }
            }
        
            job.category = this.categories.find((x :any) => x.name = this.newJobObject.category)._id

            for(const picture of this.pictures) {
                job.photos.push(Buffer.from(picture.image, "utf-8"))
            }

            await axios.post(`http://localhost:9696/api/jobs`, job, {
                headers: {
                    "Content-Type": "application/json"
                },
                maxContentLength: 100000000,
                maxBodyLength: 100000000

            })
            .then((res: any) => {
                this.jobLoading = false;

                this.$emit("done") 
                this.reset()
            }).catch((err: any) => {
                console.log(err);
                this.jobLoading = false;
            });
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

<style scoped>
    .picture-delete-btn-container {

        width: 100%;
        height: 100%;

        display: flex;
        justify-content: center;
        align-items: center;
    }

    .picture-preview-container {
        cursor: pointer;
        width: 300px;
        height: 150px;

        margin: 10px 10px 10px 10px;
    }

    .picture-preview-container .delete-icon  {
        display: none;
    }


    .picture-preview-container:hover .delete-icon {
        display: block;
    }

</style>