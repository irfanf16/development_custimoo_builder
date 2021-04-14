<template>
    <div class="upload-logo-opener">
        <b-button v-b-modal.modal-center>
        <div class="upload-box">
            <div v-if="logoUrl">
            <img :src="logoUrl" width="100%"/>
            </div>
            <div v-else>
            <div class="icon-holder">
                <font-awesome-icon :icon="['fas', 'image']"/>
            </div>
            Upload Logo
            </div>
        </div>
        <div class="upload-logo-content">
            <h3>Upload Logo Image</h3>
            <h4>Image Requirements</h4>
            <p>Need High Res Image</p>
        </div>
        </b-button>
        <b-modal ref="myModal" content-class="upload-logo-disclaimer" id="modal-center" centered title="Upload Logo">
            <p>By uploading an image, you guarantee that your use of the image does not infringe any rights or laws. You may review Customizer’s design rejection reasons <a href="#">HERE</a>.</p>
            <div class="upload-logo-buttons">
            <b-button class="btn-cancel" @click="hideModal">Cancel</b-button>
            <input type="file" name="logos" ref="fileInput" @change="uploadLogoImage" class="fileLoader" accept="image/x-png,image/jpeg">
            <b-button class="btn-upload" @click="uploadLogo">Confirm and Upload logo</b-button>
            </div>
        </b-modal>
    </div>
</template>

<script lang="ts">

    import { Component, Vue } from 'vue-property-decorator'
    import { http } from "@/httpCommon"
    @Component<UploadLogo>({
        mounted() {
            
            
            this.mobileScreen = this.$store.state.is_mobile
            this.$store.dispatch('setCategories')
            this.$store.dispatch('setJwtToken')
            this.$store.dispatch('setBrowserToken')
        }
    })
    export default class UploadLogo extends Vue {

        public mobileScreen = this.$store.state.mobileScreen
        private jwtToken !: string
        private apiBaseUrl: string =  process.env.VUE_APP_API_BASE_URL
        public logoUrl = ''
        public ref = this.$refs as Record<any, any>
        public uploadLogo() {
            this.ref.fileInput.click()
        }

        public hideModal() {
            this.ref.myModal.hide()
        }

        public uploadLogoImage(e: any) {
        let img = e.target.files[0]
        console.log(img)
        let fd = new FormData()
        let header = {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
        }
        fd.append('file', img)
        http.post('/customer/upload/logo', fd, header)
        .then(resp => {
            this.logoUrl = this.apiBaseUrl+'/'+resp.data.file.logo_url
            let logo = {url: resp.data.file.logo_url, width: 100, height: 100, x_axis: 150, y_axis: 190, haveControls: true, side: 'front'}
            this.$store.dispatch('setCustomLogos', logo)
            if(!this.jwtToken) {
            localStorage.setItem('isAssociation', 'true')
            }
            this.hideModal()
        })
        .catch((e: any) => {
            console.log(e)
        })
    }

    
}

</script>

<style lang="scss" scoped>
    .upload-logo-opener{
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        padding: 20px;
        text-align: center;
        color: #808895;
        border-radius: 20px 20px 0 0;
        background: #fff;
        box-shadow: 0 0 10px rgba(0,0,0,0.2);
        z-index: 9;
        @media only screen and (min-width: 1200px){
            position: absolute;
            border-radius: 0;
            background: none;
            border-top: 1px solid #dee2e6;
            box-shadow: none;
        }
        @media only screen and (min-width: 1200px){
            padding: 30px;
        }
        .btn{
            background: none;
            color: #808895;
            border: none;
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            padding: 0;
            font-size: 10px;
            max-width: 100%;
            margin: 0 auto;
            @media only screen and (min-width: 1200px){
                max-width: 300px;
            }
            &.btn-secondary{
                &:active{
                background-color: transparent;
                border-color: transparent;
                color: #808895;
                }
                &:focus{box-shadow: none;}
            }
        }
        .upload-box{
            text-align: center;
            width: 68px;
            height: 68px;
            border: 1px dashed #dee2e6;
            border-radius: 5px;
            padding: 10px 5px;
            font-size: 9px;
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: center;
            @media only screen and (min-width: 1200px){
                width: 74px;
                height: 74px;
                font-size: 10px;
            }
            @media only screen and (min-width: 1366px){
                width: 84px;
                height: 84px;
                font-size: 12px;
            }
            .icon-holder{
                font-size: 24px;
                @media only screen and (min-width: 1366px){
                font-size: 32px;
                }
            }
        }
        .upload-logo-content{
            padding: 5px 0 5px 8px;
            text-align: left;
            @media only screen and (min-width: 1200px){
                padding: 10px;
            }
            h3{
                font-size: 13px;
                color: #03142E;
                font-weight: 600;
                @media only screen and (min-width: 1200px){
                font-size: 14px;
                }
                @media only screen and (min-width: 1366px){
                font-size: 16px;
                }
            }
            h4{
                font-size: 12px;
                color: #03142E;
                font-weight: 400;
                @media only screen and (min-width: 1200px){
                font-size: 14px;
                }
            }
        }
    }
  .fileLoader
  {
    display:none;
  }
</style>