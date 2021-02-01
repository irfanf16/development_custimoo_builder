<template>
    <v-list>
        <template v-for="(link, i) in items">
            <v-list-group v-if="link.subLinks" @click="setActive(-1)" no-action :prepend-icon="link.icon" :key="i">
                <template v-slot:activator>
                    <v-list-item-title>{{ link.title }}</v-list-item-title>
                </template>
                <v-list v-if="link.color" class="pl-3 group-color-all">
                    <v-list-item @click="showChangeColorControl(i); setActive(i)" :class="{'v-list-item--active' : store.state.activeMenu[depth] == i? true: false}" class="v-list-item" :key="i">
                        <v-list-item-content>
                            <v-list-item-title>
                                <span :style="{'background-color': link.color}" class="color-display"></span>
                                All {{ link.title }}
                            </v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                </v-list>

                <ColorList class='py-0 pl-3' v-if="link.subLinks" :items="link.subLinks" :main-self="mainSelf" :depth="depth+1"></ColorList>
            </v-list-group>

            <v-list-item v-else-if="link.color" @click="showChangeColorControl(i); setActive(i)" :class="{'v-list-item--active' : store.state.activeMenu[depth] == i? true: false}" class="v-list-item" :key="i">
                <v-list-item-content>
                    <v-list-item-title>
                        <span :style="{'background-color': link.color}" class="color-display"></span>
                        {{ link.title }}
                    </v-list-item-title>
                </v-list-item-content>
            </v-list-item>

            <v-list-item v-else @click="setActive(i); hideChangeColorControl()" :class="{'v-list-item--active' : store.state.activeMenu[depth] == i? true: false}"  class="v-list-item" :link="true" :key="i">
                <v-list-item-icon v-if="link.icon">
                    <v-icon>{{ link.icon }}</v-icon>
                </v-list-item-icon>

                <v-list-item-content>
                    <v-list-item-title>
                        {{ link.title }}
                    </v-list-item-title>
                </v-list-item-content>
            </v-list-item>
        </template>
    </v-list>
</template>

<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator'
    import store from '../store/index'

    @Component<ColorList>({name: 'ColorList'})

    export default class ColorList extends Vue {
        @Prop({required: true}) readonly mainSelf!: any;
        @Prop({required: true, default: [{color: '', subLinks: {}}]}) readonly items!: any[];
        @Prop({required: true}) readonly depth!: any;

        private activeIndex = -1

        store = store;

        private showChangeColorControl(key: number){
            this.mainSelf.showChangeColorControl(key, this.items);
            this.setActive(key)
        }

        private hideChangeColorControl(){
            this.mainSelf.hideChangeColorControl();
        }

        private setActive(activeIndex: number){
            this.activeIndex = activeIndex;
            const activeMenu = [];
            activeMenu[this.depth] = activeIndex
            store.dispatch('SetMenu', activeMenu)
        }
    }
</script>

<style scoped>
    .group-color-all{
        margin-bottom: -8px;
        margin-top: -8px;
    }
    .v-list-item--active{
        color: #1976d2 !important;
    }
    span.color-display {
        display: inline-block;
        width: 15px;
        height: 15px;
        border-radius: 50%;
        flex: auto;
        top: 50%;
        margin-right: 10px;
        margin-bottom: -1px;
    }
</style>