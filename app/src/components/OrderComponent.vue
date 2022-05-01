<template>
    <v-container>
        <v-card
            style="padding: 0 10px 0 10px; cursor: pointer;"
        >
            <div class="d-flex justify-space-between">
                <v-card-title>{{order.title}}</v-card-title>

                 <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <v-icon
                            :color="(statusFormat).color"
                            v-bind="attrs" 
                            v-on="on" 
                            
                        >mdi-checkbox-blank-circle</v-icon>
                    </template>
                    <span style="font-size: 20px;">{{(statusFormat).title}}</span>
                    
                </v-tooltip>
            </div>
            
            <v-card-text class="d-flex justify-space-between">
                <span>{{order.desc}}</span>
                <span>Ordered at {{formatDate}}</span>
            </v-card-text>
        </v-card>
    </v-container>
</template>

<script lang='ts'>
import {Vue, Component, Prop} from 'vue-property-decorator'
import Order from '../Types/blockchain/Order'

interface Status {
    title: string,
    color: string
}

@Component
export default class OrderComponent extends Vue {

    @Prop() readonly order: Order | undefined

    private get statusFormat(): Status | undefined {
        if (this.order) {
            switch (this.order.status) {
                case "wait.for.pay":
                    return {title: "Waiting payment", color: "orange"}
                case "wait.for.accept":
                    return {title: "Pending", color: "orange"}
                case "declined":
                    return {title: "Declined", color: "red"}
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

    mounted() {
        console.log(this.order)
    }

}

</script>

<style>

</style>