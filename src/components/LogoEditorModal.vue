<template>
    <b-modal ref="logo-modal" hide-footer id="modal-center-savecolormodal" centered scrollable size="xl" title="Logo Editor" content-class="lockerroom-modal">

        <div class="loader" v-if="showLoader"><img src="../../src/assets/images/loading.gif" /></div>
        <div>
          <b-form-checkbox :checked="this.$store.getters.getBackgroundCheck"  @change="toggleLogoCheck('background',$event)">
            Remove background
          </b-form-checkbox>

          <div  class="child-check" v-if="this.$store.getters.getBackgroundCheck">
            <b-form-group label="Individual radios" v-slot="{ ariaDescribedby }">
              <b-form-radio v-model="removeBackgroundRadio"  :aria-describedby="ariaDescribedby" name="logo-background" value="transparent" @change="toggleRadio" >Remove Logo Background</b-form-radio>
              <b-form-radio v-model="removeBackgroundRadio"  :aria-describedby="ariaDescribedby" name="logo-background" value="smart_transparent" @change="toggleRadio" >Remove Smart Logo Background</b-form-radio>
            </b-form-group>
          </div>

        </div>


        <div>
          <b-form-checkbox :checked="this.$store.getters.getColorCheck"  @change="toggleLogoCheck('color',$event)">
            Recolor Logo
          </b-form-checkbox>

          <div style="width: 50%"  class="child-check" v-if="this.$store.getters.getColorCheck">
            <div>
              <div  class="color-circle"  @click="toggleColorTabs()"
                    :style="{background: '#000000'}" >
              </div>
              <ColorTabs v-if="this.colorTabClick" :productColors="productColors" onlyColorsTabs="true" @setColorOfLogo="setColorOfLogo"/>
            </div>

          </div>



        </div>

        <div style="width: 350px;background: #3E5C9A;float: right">
          <img :src="logoEditorObj.base64"/>
        </div>

        <div>
          <b-button @click="cancelEditing" class="use-btn flex-shrink-1" style="white-space: nowrap; max-width: 200px">
            <template>Cancel</template>
          </b-button>
          <b-button @click="useLogo()" class="use-btn flex-shrink-1" style="white-space: nowrap; max-width: 200px">
            <template> Save and use this Logo</template>
          </b-button>
        </div>



    </b-modal>
</template>

<script lang="ts">

import {Component, Mixins, Prop, Vue, Watch} from 'vue-property-decorator'
    import LockerRoomProducts from '@/components/LockerRoomProducts.vue'
    import CreateLockerRoomModal from '@/components/LogoEditorModal.vue'

import ColorTabs from "@/components/ColorTabs.vue";
import {http} from "@/httpCommon";
import rgbHex from "rgb-hex";
import {getClosestColor} from "@/pantoneColor";
import ErrorMessages from "@/mixins/ErrorMessages";
    @Component<LogoEditorModal>({
        components: {
          ColorTabs,
            LockerRoomProducts,
            CreateLockerRoomModal
        },
      mounted() {
        this.getColors()
      }
    })
    export default class LogoEditorModal extends Mixins(ErrorMessages) {

      public locker_selected = true;
      public colorTabClick = false;
      public room_id = 0;
      public folder_name = '';
      public ref = this.$refs as Record<any, any>
      public imageColors: any[] = []
      public colors: any = [];
      public productColors: any[] = []
      public showLoader = false;
      @Prop({ required: true }) logo_id!: number
      @Prop({ required: true }) customLogoIndex!: number


      public showButton(id:number){
        this.locker_selected = false;
        this.room_id = id;

      }

      public toggleLogoCheck(type:string,val:boolean) {
        let payload = {type,val}
        this.$store.dispatch('toggleLogoCheck', payload)
      }

      public async setColorOfLogo(color:string) {
        let res = await this.getLogoFromServer(this.logo_id,'floodfill',this.$store.getters.getLogoEditor.base64,color)
        await this.$store.dispatch('editLogo',{key:'base64',value:res.data.logo})
      }
      public  cancelEditing() {
        this.$store.dispatch('unsetLogoEditor')
        this.ref['logo-modal'].hide();
      }
      public  useLogo() {
        this.showLoader = true
        let custom_logo = JSON.parse(JSON.stringify(this.customLogos[this.customLogoIndex]));
        let data = new FormData();
        data.append("logo" , this.$store.getters.getLogoEditor.base64);
        data.append("product_id" , this.$store.getters.getSelectedProduct.id);
        http.post('/customer/update/logo', data)
          .then(resp => {
            this.colors = resp.data.colors;
            custom_logo.original_logo = resp.data.file.logo_url;
            custom_logo.transparent_logo = resp.data.file.transparent_logo_url;
            custom_logo.smart_transparent_logo = resp.data.file.smart_transparent_logo_url;
            custom_logo.is_smart_transparent = false;
            custom_logo.url = resp.data.file.logo_url;
            custom_logo.id = resp.data.file.id;
            let getLogos = []
            if (this.customLogos.length > 1){
              getLogos = this.customLogos.slice(0, -1)
            }else{
              getLogos = this.customLogos
            }
            this.$store.commit('UPDATE_UNDO', { data: JSON.parse(JSON.stringify(this.$store.getters.getCustomLogoObject)), action: 'customLogos' })
            this.$store.commit('SET_COLORS_FROM_RECENT',false)
            this.$store.commit('customLogos', custom_logo)
            this.getLogoColors()
            this.$store.commit('SET_RECENT_LOGOS');


            if(this.customLogoIndex == 0) {
              //update team logo url in all product logos
              this.$store.dispatch('setTeamLogoUrl',custom_logo)
            }
            this.showToast('Logo Applied','SUCCESS')
            this.showLoader = false
            this.ref['logo-modal'].hide();
          }).catch((e) => {
          this.showLoader = false
          this.showError('Something went wrong')
            console.log('exception',e)
        })
      }
      public getLogoColors() {
        if (this.customLogos.length) {
          if (this.customLogos[0] && this.customLogos[0].url) {
            this.$store.dispatch("SET_LOGO_URL", {logoUrl: this.customLogos[0].url})
            if (this.colors.length){
              this.processColors(this.colors)
            }
          }
        }
      }

      async processColors(colors: []) {
        this.imageColors = []
        let uniqueColors: string[] = []
        colors.forEach((color: number[]) => {
          const hex = rgbHex(color[0], color[1], color[2])
          if ((!uniqueColors.includes(hex))) {
            uniqueColors.push(hex)
          }
        })
        let deletedCount = uniqueColors.length - 4
        uniqueColors.splice(4, deletedCount)

        uniqueColors.forEach((color: string) => {
          // console.log(color)
          let pantoneColor = getClosestColor(color)
          //console.log(JSON.parse(JSON.stringify(pantoneColor)))
          this.imageColors.push({hex: pantoneColor.hex, pantone: pantoneColor.pantone, name: pantoneColor.name})
        })
        let add_extra_colors = 4 - uniqueColors.length;
        if(uniqueColors.length < 4) {
          while(add_extra_colors > 0 ) {
            this.imageColors.push({hex: null, pantone: null, name: null})
            --add_extra_colors;
          }
        }
        //only set logo colors if index is 0
        if(this.customLogoIndex == 0) {
          await this.$store.dispatch("SET_LOGO_COLORS", this.imageColors);
          await this.$store.dispatch("initialLogoColors", JSON.stringify(this.imageColors));
        }
      }

      public showLogoModal() {
        this.ref['logo-modal'].show();
      }

      public hideLogoModal() {
        this.ref['logo-modal'].hide();
      }

      get getShowColorsLogoEditor() {
        return this.$store.getters.getShowColorsLogoEditor
      }
      get lockerColors(){
        return this.$store.getters.getLockerColors
      }
      get selectedProduct(): Record<any, any> {
        return this.$store.getters.getSelectedProduct
      }
      get removeBackgroundRadio() {
        return this.$store.getters.getRemoveBackgroundRadio
      }
      set removeBackgroundRadio(val:any){
        console.log('setter called',val)
      }

      get logoEditorObj() {
        return this.$store.getters.getLogoEditor
      }
      get customLogos(): Record<any, any>[] {
        return this.$store.getters.getCustomLogos()
      }


      public async toggleRadio(type:string) {

        console.log('type',type)

        let res = await this.getLogoFromServer(this.logo_id,type,this.$store.getters.getLogoEditor.originalBase64)
        await this.$store.dispatch('editLogo',{key:'base64',value:res.data.logo})

      }

      public getLogoFromServer(logo_id:number,type:string,base64 = '',color='') {
        return http.post('edit-logo', {logo_id,type,base64,color})
      }

      public getColors() {
        this.productColors = []
        this.selectedProduct.colors.forEach((colors: any, key: number) => {
          let finalColor = {color_text: [], selectedColor: "", name: colors.file_name.substr(0, colors.file_name.indexOf('.'))}
          finalColor.color_text = JSON.parse(colors.color_text)
          this.productColors = this.productColors.concat(finalColor)
        })
        let locker_colors = this.lockerColors
        locker_colors = locker_colors.map((locker_color) => {
          locker_color.color_text = JSON.parse(locker_color.color_text)
          return locker_color
        })
        this.productColors = this.productColors.concat(locker_colors)

      }

      public toggleColorTabs() {
        this.colorTabClick = !this.colorTabClick
      }


      public async saveFolder(){
        if (this.room_id == 0){
          alert('select room first');
          return false;
        }
        let productColors = []
        this.logoColors.forEach((item:Record<any, any>) => {
          let obj = {
            name: item.pantone, value: item.hex
          }
          productColors.push(obj)
        })

       let saved = await this.$store.dispatch('storeFolder', {folder_name: this.folder_name, room_id: this.room_id, colors: this.logoColors});
        if (saved == true){
          await this.$store.dispatch('getLockerRoomColors')
          this.folder_name = ''
          this.ref['my-modal'].hide();
        }
      }
    }
</script>

<style lang="scss" scoped>
    .lockerroom-header{
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        .locker-opener{
            max-width: 90%;
            padding: 15px;
            font-size: 18px;
            position: relative;
            overflow-x: auto;
            white-space: nowrap;
            @media only screen and (min-width: 992px){
                padding: 14px 0;
                max-width: 80%;
                overflow: hidden;
                white-space: inherit;
            }
            .btn{
                padding: 5px 10px;
                margin: 0 5px 10px;
                position: relative;
                background: none;
                border-color: rgba(3,20,46,0.13);
                color: #03142E;
                font-size: 0.8rem;
                @media only screen and (min-width: 992px){
                    padding: 10px 30px;
                    margin: 0 10px 10px;
                    font-size: 1rem;
                }
                &.active,
                &:hover{
                    background: #219f84;
                    color: #fff;
                    border-color: #219f84;
                }
                .remove{
                    position: absolute;
                    right: -10px;
                    top: -14px;
                    width: 20px;
                    height: 20px;
                    font-size: 9px;
                    color: #D53943;
                    background: #F8E1E2;
                    border-radius: 50%;
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    justify-content: center;
                    @media only screen and (min-width: 992px){
                        width: 30px;
                        height: 30px;
                        font-size: 12px;
                    }
                }
            }
            .arrow{
                position: absolute;
                left: 0;
                top: 50%;
                transform: translateY(-50%);
                z-index: 1;
                color: #219f84;
                font-size: 15px;
                display: none;
                @media only screen and (min-width: 992px){
                    display: inline-block;
                }
                &.arrow-right{
                    left: auto;
                    right: 0;
                }
            }
        }
        .create-lockerroom{
            .btn{
                padding: 0;
                font-size: 24px;
                line-height: 1;
                font-weight: 700px;
                color: #fff;
                background: #219f84;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                align-items: center;
                border: none;
                @media only screen and (min-width: 992px){
                    padding: 10px 30px;
                    color: #219f84;
                    background: #E7F4F1;
                    border: 1px solid #E7F4F1;
                    border-radius: 0.25rem;
                    width: auto;
                    height: auto;
                    font-size: 14px;
                    font-weight: 400;
                }
                span{
                    @media only screen and (max-width: 991px){display: none;}
                }
            }
        }

    }
    .save-btn-holder{
          padding: 15px 40px;
          text-align: center;
        }
.design-name-form{
        label{font-size: 16px;}
        .input-group{
            flex: 0 0 55%;
            max-width: 55%;
          @media only screen and (min-width: 992px){
            flex: 0 0 78%;
            max-width: 78%;
          }
        }
        .btn{
            flex: 0 0 40%;
            max-width: 40%;
            background: #219f84;
            border-color: #219f84;
          @media only screen and (min-width: 992px){
            flex: 0 0 20%;
            max-width: 20%;
          }
        }
    }

    .folder-wrapper{
      h3{
        font-weight: 600;
        @media only screen and (min-width: 992px){
          font-size: 20px;
        }
      }
      a{
        margin: 0 10px 12px;
        font-size: 10px;
        flex: 0 0 18%;
        max-width: 18%;
        @media only screen and (min-width: 768px){
          font-size: 14px;
          flex: 0 0 9%;
          max-width: 9%;
        }
        svg{
          font-size: 32px;
          display: block;
          margin: 0 auto 10px;
          fill: #219f84;
          color: #219f84;
          @media only screen and (min-width: 768px){
            font-size: 46px;
          }
        }
      }
    }



</style>
