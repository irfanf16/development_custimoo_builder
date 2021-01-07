<template>
    <v-list>
        <template v-for="(link, i) in items">
            <v-list-group v-if="link.subLinks" no-action :prepend-icon="link.icon" :key="i">
                <template v-slot:activator>
                    <v-list-item-title>{{ link.title }}</v-list-item-title>
                </template>
                <v-list>
                    <v-list-item v-if="link.color" :active-class="'color'" class="v-list-item" :key="i">
                        <v-list-item-icon v-if="link.icon">
                            <v-icon>{{ link.icon }}</v-icon>
                        </v-list-item-icon>

                        <v-list-item-content>
                            <v-list-item-title>
                                <input @change="changeColor(i)" type="color" v-model="link.color">
                                All {{ link.title }}
                            </v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                </v-list>
                <ColorList class='py-0 pl-3' v-if="link.subLinks" :items="link.subLinks" :main-self="mainSelf"></ColorList>
            </v-list-group>

            <v-list-item v-else :active-class="'color'" class="v-list-item" :key="i">
                <v-list-item-icon v-if="link.icon">
                    <v-icon>{{ link.icon }}</v-icon>
                </v-list-item-icon>

                <v-list-item-content>
                    <v-list-item-title>
                        <input v-if="link.color" @change="changeColor(i)" type="color" v-model="link.color">
                        {{ link.title }}
                    </v-list-item-title>
                </v-list-item-content>
            </v-list-item>
        </template>
    </v-list>
</template>

<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator'

    @Component<ColorList>({name: 'ColorList'})

    export default class ColorList extends Vue {
        @Prop({required: true}) readonly mainSelf!: any;
        @Prop({required: true, default: [{color: '', subLinks: {}}]}) readonly items!: any[];

        private changeColor(key: number){
            this.mainSelf.changeColor(key, this.items);
            if(this.items[key].subLinks && this.items[key].subLinks.length){
                this.changeItemsColor(this.items[key].subLinks, this.items[key].color);
            }
        }

        private changeItemsColor(items: [], color: string){
            const self = this;
            items.forEach((item: any) => {
                item.color = color;
                if(item.subLinks && item.subLinks.length){
                    self.changeItemsColor(item.subLinks, color);
                }
            })
        }
    }
</script>

<style scoped>

</style>