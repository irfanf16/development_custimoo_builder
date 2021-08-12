<template>
  <span>
  <b-modal ref="collection-modal" id="modal-center-collection" size="xl" content-class="collection-modal">
    <template #modal-title>
      <div class="d-flex align-items-center justify-content-between w-100">
        <div>
          <b-form-input placeholder="Collection Name"></b-form-input>
        </div>

        <div>
          <b-button>Save</b-button>
        </div>
      </div>
    </template>

    <AddDesignCollection></AddDesignCollection>
      <!--<DesignCollection @hideCollectionModal="hideCollectionModal"></DesignCollection>-->

    <template #modal-footer>
      <div class="d-flex align-items-center justify-content-end w-100 gap-1">
        <b-button @click="hideCollectionModal" variant="secondary" class="light">Cancel</b-button>
        <b-button variant="secondary">Save</b-button>
        <b-button variant="secondary" @click="generateCollectionPdf">Download PDF</b-button>
      </div>
    </template>
  </b-modal>
    <DesignCollectionPdfView/>
  </span>

</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator'
import DesignCollection from "@/components/DesignCollection.vue";
import DesignCollectionPdfView from "@/components/DesignCollectionPdfView.vue";
import AddDesignCollection from "@/components/AddDesignCollection.vue";
import html2pdf from "html2pdf.js"


@Component({
  components: {
    // eslint-disable-next-line no-undef
    AddDesignCollection,
    DesignCollection,
    DesignCollectionPdfView
  }
})
export default class LockerRoomModal extends Vue {


  public ref = this.$refs as Record<any, any>

  public hideCollectionModal () {
    this.ref['collection-modal'].hide()
  }

  public showCollectionModal () {
    this.ref['collection-modal'].show()
  }

  public generateCollectionPdf() {
    let self = this;
    const element = document.getElementById("collectionPdfContainer")
    const opt = {
      margin: [15, 10, 15, 10],
      filename: 'production.pdf',
      image: {type: "jpeg", quality: 1},
      html2canvas: {
        dpi: 192,
        scale: 4,
        useCORS: true,
        letterRendering: true,
      },
      jsPDF: {
        unit: "mm",
        format: "letter",
        orientation: 'landscape'
      }
    };
    html2pdf().set(opt).from(element).save();
    console.log("hey pdf downloaded")
  }
}
</script>
