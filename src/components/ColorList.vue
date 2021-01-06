<template>
    <v-list>
        <template v-for="(link, i) in items">
            <v-list-group v-if="link.subLinks" no-action :prepend-icon="link.icon" :key="i">
                <template v-slot:activator>
                    <v-list-item-title>{{ link.title }}</v-list-item-title>
                </template>
                <ColorList class='py-0 pl-3' v-if="link.subLinks" :items="link.subLinks" :main-self="mainSelf"></ColorList>

            </v-list-group>

            <v-list-item v-else :active-class="'color'" class="v-list-item" :key="i">
                <v-list-item-icon v-if="link.icon">
                    <v-icon>{{ link.icon }}</v-icon>
                </v-list-item-icon>

                <v-list-item-content>
                    <v-list-item-title>
                        <input v-if="link.color" @change="changeColor(i)" type="color" id="favcolor" name="favcolor" v-model="link.color">
                        {{ link.title }}
                    </v-list-item-title>
                </v-list-item-content>
            </v-list-item>
        </template>
    </v-list>
</template>

<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator'

    @Component<ColorList>({})

    export default class ColorList extends Vue {
        @Prop({required: true}) readonly mainSelf!: any;
        @Prop({required: true}) readonly items!: [];

        private changeColor(key: number){
            this.mainSelf.changeColor(key, this.items);
        }
    }
</script>

<style scoped>

</style>