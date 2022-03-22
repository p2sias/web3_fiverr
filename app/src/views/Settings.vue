<template>
    <div class="settings-main">
                <div class="nav-container">
                    <v-navigation-drawer color="#202225" permanent>
                        <v-list-item>
                            <v-list-item-content>
                                <v-list-item-title class="text-h6 list-item-title">
                                    Settings
                                </v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>

                        <v-list
                            dense
                            nav
                        >
                            <v-list-item
                                v-for="item in navItems"
                                :key="item.path"
                                link
                                @click="$router.push({name: item.path})"
                                :class="$route.name == item.path ? 'currentRoute' : ''"
                            >
                                    
                                <v-list-item-icon>
                                    <v-icon size="30px" color="white">{{item.icon}}</v-icon>
                                </v-list-item-icon>

                                <v-list-item-content>
                                    <v-list-item-title style="height: 20px">
                                        <span class="list-item-content">{{item.title}}</span>
                                    </v-list-item-title>
                                </v-list-item-content>
                            </v-list-item>
                        </v-list>
                    </v-navigation-drawer>
                </div>


            <div class="setting-page">
                <router-view></router-view>
            </div>
    </div>
</template>

<script lang="ts">
import {Vue, Component} from 'vue-property-decorator'

@Component
export default class Settings extends Vue {
    private navItems = [
        {icon: "mdi-account", title: "Profile settings", path: 'ProfileSettings'}
    ]

    private mounted() {
        console.log(this.$route.name)
    }
}

</script>

<style scoped>
    .settings-main, .nav-container {
        background-color: #202225;
    }

    .list-item-title {
        color: white;
    }

    .list-item-content {
        color: white;
        font-size: 20px;
    }

    .currentRoute {
        background-color: #1976D2;
    }

    .settings-main {
        height: 100%;
        display: flex;
        align-items: stretch;
    }

    .setting-page  {
        width: 100%;
    }


</style>