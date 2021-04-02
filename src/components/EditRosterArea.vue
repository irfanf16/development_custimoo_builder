<template>
    <div>
        <b-button v-b-modal.modal-scrollable>Edit Roster</b-button>

        <b-modal id="modal-scrollable" scrollable title="Roster" content-class="roster-modal" size="xl">
            <div class="d-flex flex-wrap justify-content-between">
                <div class="roster-section">
                    <div class="roster-row mb-2">
                        <div class="align-left">
                            <div class="hide-show"></div>
                            <div class="roster-name">Name</div>
                            <div class="shirt-no">No</div>
                            <div class="shirt-size">Size</div>
                        </div>
                        <div class="align-right">
                            <div class="qty">Qty</div>
                            <div class="remove"></div>
                        </div>
                    </div>
                    <div class="roster-row mb-2">
                        <div class="align-left">
                            <div class="hide-show">
                                <a href="#"><font-awesome-icon :icon="['fas', 'eye-slash']" /></a>
                            </div>
                            <div class="roster-name">
                                <b-form-input
                                id="inline-form-input-name"
                                placeholder="Brandon"
                                ></b-form-input>
                            </div>
                            <div class="shirt-no">
                                <b-form-input
                                id="inline-form-input-name"
                                class="text-center"
                                placeholder="12"
                                ></b-form-input>
                            </div>
                            <div class="shirt-size">
                                <b-form-select v-model="selected" :options="options"></b-form-select>
                            </div>
                        </div>
                        <div class="align-right">
                            <div class="qty">
                                <b-form-input
                                id="inline-form-input-name"
                                class="text-center"
                                placeholder="1"
                                ></b-form-input>
                            </div>
                            <div class="remove">
                                <a href="#"><font-awesome-icon :icon="['fas', 'trash-alt']" /></a>
                            </div>
                        </div>
                    </div>
                    <div class="roster-row mb-2">
                        <div class="align-left">
                            <div class="hide-show">
                                <a href="#"><font-awesome-icon :icon="['fas', 'eye-slash']" /></a>
                            </div>
                            <div class="roster-name">
                                <b-form-input
                                id="inline-form-input-name"
                                placeholder="Brandon"
                                ></b-form-input>
                            </div>
                            <div class="shirt-no">
                                <b-form-input
                                id="inline-form-input-name"
                                class="text-center"
                                placeholder="12"
                                ></b-form-input>
                            </div>
                            <div class="shirt-size">
                                <b-form-select v-model="selected" :options="options"></b-form-select>
                            </div>
                        </div>
                        <div class="align-right">
                            <div class="qty">
                                <b-form-input
                                id="inline-form-input-name"
                                class="text-center"
                                placeholder="1"
                                ></b-form-input>
                            </div>
                            <div class="remove">
                                <a href="#"><font-awesome-icon :icon="['fas', 'trash-alt']" /></a>
                            </div>
                        </div>
                    </div>
                    <div class="roster-row mb-2">
                        <div class="align-left">
                            <div class="hide-show">
                                <a href="#"><font-awesome-icon :icon="['fas', 'eye-slash']" /></a>
                            </div>
                            <div class="roster-name">
                                <b-form-input
                                id="inline-form-input-name"
                                placeholder="Brandon"
                                ></b-form-input>
                            </div>
                            <div class="shirt-no">
                                <b-form-input
                                id="inline-form-input-name"
                                class="text-center"
                                placeholder="12"
                                ></b-form-input>
                            </div>
                            <div class="shirt-size">
                                <b-form-select v-model="selected" :options="options"></b-form-select>
                            </div>
                        </div>
                        <div class="align-right">
                            <div class="qty">
                                <b-form-input
                                id="inline-form-input-name"
                                class="text-center"
                                placeholder="1"
                                ></b-form-input>
                            </div>
                            <div class="remove">
                                <a href="#"><font-awesome-icon :icon="['fas', 'trash-alt']" /></a>
                            </div>
                        </div>
                    </div>
                    <div class="roster-row mb-2">
                        <div class="align-left">
                            <div class="hide-show">
                                <a href="#"><font-awesome-icon :icon="['fas', 'eye-slash']" /></a>
                            </div>
                            <div class="roster-name">
                                <b-form-input
                                id="inline-form-input-name"
                                placeholder="Brandon"
                                ></b-form-input>
                            </div>
                            <div class="shirt-no">
                                <b-form-input
                                id="inline-form-input-name"
                                class="text-center"
                                placeholder="12"
                                ></b-form-input>
                            </div>
                            <div class="shirt-size">
                                <b-form-select v-model="selected" :options="options"></b-form-select>
                            </div>
                        </div>
                        <div class="align-right">
                            <div class="qty">
                                <b-form-input
                                id="inline-form-input-name"
                                class="text-center"
                                placeholder="1"
                                ></b-form-input>
                            </div>
                            <div class="remove">
                                <a href="#"><font-awesome-icon :icon="['fas', 'trash-alt']" /></a>
                            </div>
                        </div>
                    </div>
                    <div class="roster-row mb-2">
                        <div class="align-left">
                            <div class="hide-show">
                                <a href="#"><font-awesome-icon :icon="['fas', 'eye-slash']" /></a>
                            </div>
                            <div class="roster-name">
                                <b-form-input
                                id="inline-form-input-name"
                                placeholder="Brandon"
                                ></b-form-input>
                            </div>
                            <div class="shirt-no">
                                <b-form-input
                                id="inline-form-input-name"
                                class="text-center"
                                placeholder="12"
                                ></b-form-input>
                            </div>
                            <div class="shirt-size">
                                <b-form-select v-model="selected" :options="options"></b-form-select>
                            </div>
                        </div>
                        <div class="align-right">
                            <div class="qty">
                                <b-form-input
                                id="inline-form-input-name"
                                class="text-center"
                                placeholder="1"
                                ></b-form-input>
                            </div>
                            <div class="remove">
                                <a href="#"><font-awesome-icon :icon="['fas', 'trash-alt']" /></a>
                            </div>
                        </div>
                    </div>
                    <div class="roster-row mb-2">
                        <div class="align-left">
                            <div class="hide-show">
                                <a href="#"><font-awesome-icon :icon="['fas', 'eye-slash']" /></a>
                            </div>
                            <div class="roster-name">
                                <b-form-input
                                id="inline-form-input-name"
                                placeholder="Brandon"
                                ></b-form-input>
                            </div>
                            <div class="shirt-no">
                                <b-form-input
                                id="inline-form-input-name"
                                class="text-center"
                                placeholder="12"
                                ></b-form-input>
                            </div>
                            <div class="shirt-size">
                                <b-form-select v-model="selected" :options="options"></b-form-select>
                            </div>
                        </div>
                        <div class="align-right">
                            <div class="qty">
                                <b-form-input
                                id="inline-form-input-name"
                                class="text-center"
                                placeholder="1"
                                ></b-form-input>
                            </div>
                            <div class="remove">
                                <a href="#"><font-awesome-icon :icon="['fas', 'trash-alt']" /></a>
                            </div>
                        </div>
                    </div>
                    <div class="roster-row mb-2">
                        <div class="align-left">
                            <div class="hide-show">
                                <a href="#"><font-awesome-icon :icon="['fas', 'eye-slash']" /></a>
                            </div>
                            <div class="roster-name">
                                <b-form-input
                                id="inline-form-input-name"
                                placeholder="Brandon"
                                ></b-form-input>
                            </div>
                            <div class="shirt-no">
                                <b-form-input
                                id="inline-form-input-name"
                                class="text-center"
                                placeholder="12"
                                ></b-form-input>
                            </div>
                            <div class="shirt-size">
                                <b-form-select v-model="selected" :options="options"></b-form-select>
                            </div>
                        </div>
                        <div class="align-right">
                            <div class="qty">
                                <b-form-input
                                id="inline-form-input-name"
                                class="text-center"
                                placeholder="1"
                                ></b-form-input>
                            </div>
                            <div class="remove">
                                <a href="#"><font-awesome-icon :icon="['fas', 'trash-alt']" /></a>
                            </div>
                        </div>
                    </div>
                    <div class="roster-row mb-2">
                        <div class="align-left">
                            <div class="hide-show">
                                <a href="#"><font-awesome-icon :icon="['fas', 'eye-slash']" /></a>
                            </div>
                            <div class="roster-name">
                                <b-form-input
                                id="inline-form-input-name"
                                placeholder="Brandon"
                                ></b-form-input>
                            </div>
                            <div class="shirt-no">
                                <b-form-input
                                id="inline-form-input-name"
                                class="text-center"
                                placeholder="12"
                                ></b-form-input>
                            </div>
                            <div class="shirt-size">
                                <b-form-select v-model="selected" :options="options"></b-form-select>
                            </div>
                        </div>
                        <div class="align-right">
                            <div class="qty">
                                <b-form-input
                                id="inline-form-input-name"
                                class="text-center"
                                placeholder="1"
                                ></b-form-input>
                            </div>
                            <div class="remove">
                                <a href="#"><font-awesome-icon :icon="['fas', 'trash-alt']" /></a>
                            </div>
                        </div>
                    </div>
                    <div class="roster-row mb-2">
                        <div class="align-left">
                            <div class="hide-show">
                                <a href="#"><font-awesome-icon :icon="['fas', 'eye-slash']" /></a>
                            </div>
                            <div class="roster-name">
                                <b-form-input
                                id="inline-form-input-name"
                                placeholder="Brandon"
                                ></b-form-input>
                            </div>
                            <div class="shirt-no">
                                <b-form-input
                                id="inline-form-input-name"
                                class="text-center"
                                placeholder="12"
                                ></b-form-input>
                            </div>
                            <div class="shirt-size">
                                <b-form-select v-model="selected" :options="options"></b-form-select>
                            </div>
                        </div>
                        <div class="align-right">
                            <div class="qty">
                                <b-form-input
                                id="inline-form-input-name"
                                class="text-center"
                                placeholder="1"
                                ></b-form-input>
                            </div>
                            <div class="remove">
                                <a href="#"><font-awesome-icon :icon="['fas', 'trash-alt']" /></a>
                            </div>
                        </div>
                    </div>
                    <div class="roster-row mb-2">
                        <div class="align-left">
                            <div class="hide-show">
                                <a href="#"><font-awesome-icon :icon="['fas', 'eye-slash']" /></a>
                            </div>
                            <div class="roster-name">
                                <b-form-input
                                id="inline-form-input-name"
                                placeholder="Brandon"
                                ></b-form-input>
                            </div>
                            <div class="shirt-no">
                                <b-form-input
                                id="inline-form-input-name"
                                class="text-center"
                                placeholder="12"
                                ></b-form-input>
                            </div>
                            <div class="shirt-size">
                                <b-form-select v-model="selected" :options="options"></b-form-select>
                            </div>
                        </div>
                        <div class="align-right">
                            <div class="qty">
                                <b-form-input
                                id="inline-form-input-name"
                                class="text-center"
                                placeholder="1"
                                ></b-form-input>
                            </div>
                            <div class="remove">
                                <a href="#"><font-awesome-icon :icon="['fas', 'trash-alt']" /></a>
                            </div>
                        </div>
                    </div>
                    <div class="roster-row mb-2">
                        <div class="align-left">
                            <div class="hide-show">
                                <a href="#"><font-awesome-icon :icon="['fas', 'eye-slash']" /></a>
                            </div>
                            <div class="roster-name">
                                <b-form-input
                                id="inline-form-input-name"
                                placeholder="Brandon"
                                ></b-form-input>
                            </div>
                            <div class="shirt-no">
                                <b-form-input
                                id="inline-form-input-name"
                                class="text-center"
                                placeholder="12"
                                ></b-form-input>
                            </div>
                            <div class="shirt-size">
                                <b-form-select v-model="selected" :options="options"></b-form-select>
                            </div>
                        </div>
                        <div class="align-right">
                            <div class="qty">
                                <b-form-input
                                id="inline-form-input-name"
                                class="text-center"
                                placeholder="1"
                                ></b-form-input>
                            </div>
                            <div class="remove">
                                <a href="#"><font-awesome-icon :icon="['fas', 'trash-alt']" /></a>
                            </div>
                        </div>
                    </div>
                    <div class="roster-row mb-2">
                        <div class="align-left">
                            <div class="hide-show">
                                <a href="#"><font-awesome-icon :icon="['fas', 'eye-slash']" /></a>
                            </div>
                            <div class="roster-name">
                                <b-form-input
                                id="inline-form-input-name"
                                placeholder="Brandon"
                                ></b-form-input>
                            </div>
                            <div class="shirt-no">
                                <b-form-input
                                id="inline-form-input-name"
                                class="text-center"
                                placeholder="12"
                                ></b-form-input>
                            </div>
                            <div class="shirt-size">
                                <b-form-select v-model="selected" :options="options"></b-form-select>
                            </div>
                        </div>
                        <div class="align-right">
                            <div class="qty">
                                <b-form-input
                                id="inline-form-input-name"
                                class="text-center"
                                placeholder="1"
                                ></b-form-input>
                            </div>
                            <div class="remove">
                                <a href="#"><font-awesome-icon :icon="['fas', 'trash-alt']" /></a>
                            </div>
                        </div>
                    </div>
                    <div class="roster-row mb-2">
                        <div class="align-left">
                            <div class="hide-show">
                                <a href="#"><font-awesome-icon :icon="['fas', 'eye-slash']" /></a>
                            </div>
                            <div class="roster-name">
                                <b-form-input
                                id="inline-form-input-name"
                                placeholder="Brandon"
                                ></b-form-input>
                            </div>
                            <div class="shirt-no">
                                <b-form-input
                                id="inline-form-input-name"
                                class="text-center"
                                placeholder="12"
                                ></b-form-input>
                            </div>
                            <div class="shirt-size">
                                <b-form-select v-model="selected" :options="options"></b-form-select>
                            </div>
                        </div>
                        <div class="align-right">
                            <div class="qty">
                                <b-form-input
                                id="inline-form-input-name"
                                class="text-center"
                                placeholder="1"
                                ></b-form-input>
                            </div>
                            <div class="remove">
                                <a href="#"><font-awesome-icon :icon="['fas', 'trash-alt']" /></a>
                            </div>
                        </div>
                    </div>
                    <div class="roster-row mb-2 button-holder">
                        <button class="btn btn-secondary fw-bold pl-5 pr-5">Add Player</button>
                    </div>
                </div>
                <div class="roster-preview-area">
                    <div class="roster-template-area">
                        <button class="btn btn-secondary fw-bold pl-5 pr-5">Download Roster Template</button>
                        <button class="btn btn-secondary fw-bold pl-5 pr-5">Upload Roster Template</button>
                    </div>
                    <CustomizationPreview :designs="products[designsIndex]" />
                </div>
            </div>
        </b-modal>
    </div>
</template>

<script lang="ts">
    
    import { Component, Vue } from 'vue-property-decorator'
    import CustomizationPreview from '@/components/CustomizationPreview.vue'
    import ApiDataService from "@/services/ApiDataService";

    @Component<EditRosterArea>({
        components: {
            CustomizationPreview
        },
        mounted() {
            this.retrieveProducts()
        }
    })

    export default class EditRosterArea extends Vue {
        public selected= null
        public options= [
          { value: 'a', text: 'SM' },
          { value: 'a', text: 'MD' },
          { value: 'a', text: 'LG' },
          { value: 'a', text: 'XL' },
          { value: 'a', text: '2XL' },
          { value: null, text: '3XL' }
        ]

        private products : any[] = []
        private company_id !: string
        private product_id !: string

        public designsIndex = 0

        retrieveProducts(): void {
            this.product_id = '1'
            this.company_id = '1'
            let param = '?product_id='+this.product_id+'&company_id='+this.company_id
            ApiDataService.getAll(param)
            .then((response: any) => {
                this.products = response.data.products.data;
            })
            .catch((e: any) => {
                console.log(e)
            });
        }

        public changeProduct(designsIndex :number){
            this.designsIndex = designsIndex
        }
    }

</script>
