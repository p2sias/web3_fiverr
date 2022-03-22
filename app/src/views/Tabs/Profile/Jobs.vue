<template>
    <div class="jobs-main">
        <JobComponent
            v-for="job in user.jobs"
            :key="job._id"
            v-bind:job="job"
            v-bind:author="user"
        ></JobComponent>
    </div>    
</template>

<script lang="ts">
import {Component, Vue, Watch} from 'vue-property-decorator'
import User from '../../../Types/User';
import JobComponent from '../../../components/JobComponent.vue'

@Component({
    components: {
        JobComponent
    }
})
export default class Jobs extends Vue {
    @Watch('user')
    onUserChange(user: User, oldUser: User) {
        this.jobs = user.jobs;
    }

    private get user(): User {
        return this.$store.state.user;
    }

    private jobs: [] | undefined = [];

}

</script>

<style>
    .jobs-main {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
    }

    
</style>