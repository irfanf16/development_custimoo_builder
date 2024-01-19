<template>
    <div id="image_upload_container">
        <h1>Image Upload</h1>

        <div class="dropzone" @dragover.prevent @dragenter.prevent @dragstart.prevent
            @drop.prevent="handleFileChange($event.dataTransfer)">
            <input id="file-input" type="file" accept="image/png, image/jpeg" @change="handleFileChange($event.target)"
                required />
            <h2 for="file-input">Click or Drag N Drop Image</h2>
            <!-- <img class="preview-img" v-bind:src="preview" /> -->
            <h3 v-if="preview">File name: {{ fileName }}</h3>
        </div>
        <ul>
            Added images: 
            <li v-for="image in this.added_images" :key="image.id">
            {{image.src }}
            <button @click="removeImage(image)">X</button>
        </li>
        </ul>
    </div>
</template>
  
<script>
export default {
    name: "image_uploader",
    emits: ["image_uploaded", "image_deleted"],

    props: {
        added_images: Array,
    },
    data() {
        return {
            fileName: "",
            preview: null,
            formData: null,
            success: "",
        };
    },
    mounted(){
        console.log("images", this.added_images)
    },

    methods: {
        handleFileChange: function (event) {
            this.file = event.files[0];
            this.fileName = this.file.name;

            this.formData = new FormData();
            //this.formData.append("upload_preset", this.preset);

            let reader = new FileReader();
            reader.readAsDataURL(this.file);

            reader.onload = (e) => {
                this.preview = e.target.result;
                this.formData.append("file", this.preview);
                this.$emit('image_uploaded', this.preview, this.fileName);
            };
        },

        removeImage(image) {
            this.$emit('image_deleted', image);
        },

    },
};
</script>

<style>
.dropzone {
    height: fit-content;
    min-height: 200px;
    max-height: 400px;
    width: 100%;
    background: #fdfdfd;
    border-radius: 5px;
    border: 2px dashed #000;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: 0 auto;
    margin-bottom: 5px;
}

input[type="file"] {
    position: absolute;
    opacity: 0;
    width: inherit;
    min-height: 200px;
    max-height: 400px;
    cursor: pointer;
}

.preview-img {
    width: 50%;
    height: 50%;
}

#image_upload_container {
    display: inline-block;
    vertical-align: top;
    width: calc(100% - 750px);
    border: 1px solid grey;
    height: 512px;
    min-width: 400px;
    padding: 10px;
    overflow-y: scroll;

}
</style>