<template>
  <modal
    :width="1400"
    id="modal-scrollable"
    :scrollable="true"
    height="auto"
    :reset="true"
    :shiftY="0"
    name="purchaseModal"
    class="roster-modal"
    footer-class="hide-modal-footer d-none"
  >
    <div
      class="modal-header d-flex justify-content-between border-bottom pb-3 mb-4"
    >
      <span class="fs-5 font-weight-bolder">Choose Your Roster</span>
      <span
        class="fs-5 font-weight-bold cursor-pointer modal-close"
        @click="close"
      >
        <BIconX />
      </span>
    </div>

    <div class="modal-body p-4">
      <div class="row gx-3 align-items-start">
        <div class="col-md-7 d-flex flex-column align-items-center custom-gap">
          <div class="w-100 text-center mb-3 product-main">
            <img :src="`${storageUrl}${activeImage}`" style="max-width: 100%" class="img-fluid" />
          </div>

          <div class="d-flex gap-2 thumbnails-wrap">
            <img
              v-for="(image, index) in thumbs"
              :key="index"
              :src="`${storageUrl}${image}`"
              class="thumb"
              :class="{ active: activeImage === image }"
              @click="selectThumb(image)"
            />
          </div>
        </div>

        <div class="col-md-5">
          <h2 class="mb-4 heading">
            {{
              product?.name ||
              "FreeStyle Breakaway Sublimated Turbo Training Tee"
            }}
          </h2>
          <p class="text-muted mb-4" v-html="product?.description || ''">

          </p>

          <div class="mb-4" v-if="!uploadInBulk">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h6 class="mb-2 heading">Sizes</h6>
              <a :href="`${storageUrl}${product.style_guide}`" :download="product.style_guide" target="_blank" v-if="product?.style_guide">
              <div class="d-flex align-items-center gap-1" style="color: #555" >
                <img
                  src="@/assets/images/tape-measure.svg"
                  alt="Size Chart"
                  style="height: 24px; width: 24px; aspect-ratio: 1/1"
                />
                <h6>style guide</h6>
              </div>
            </a>
            </div>

            <div class="d-flex flex-wrap gap-1">
              <button
                v-for="size in sizes"
                :key="size.name"
                type="button"
                class="btn btn-sm size-button"
                :class="{ active: selectedSize === size.name }"
                @click="selectSize(size.name)"
              >
                {{ size.name }}
              </button>
            </div>
          </div>

          <div class="mb-4">
            <h4 class="heading">Player Details</h4>
            <div class="row g-2 align-items-center" v-if="!uploadInBulk">
              <div class="col-6 col-sm-6">
                <input type="text" v-model="singlePlayer.text" @blur="addSinglePlayer"
                       @keyup.enter="addSinglePlayer" class="form-control"  placeholder="Name" />
              </div>
              <div class="col-6 col-sm-6">
                <input type="text" class="form-control" v-model="singlePlayer.number" @blur="addSinglePlayer"
                       @keyup.enter="addSinglePlayer" placeholder="Number" />
              </div>
            </div>
            <!-- </div> -->

            <button class="btn btn-light mt-3 w-100" v-if="!uploadInBulk" @click="changeBulkStatus">
              Upload Players in Bulk
            </button>
            <button class="btn btn-light mt-3 w-100" v-if="uploadInBulk" @click="uploadInBulk = false">
              Enter Single Player
            </button>
          </div>
         <template v-if="uploadInBulk">
           <div>
             <h6 class="font-weight-bold mb-2">
               Add Roster Detail From Excel File
             </h6>

             <form name="upload_excel" ref="upload_excel">
               <div class="excel-file-uploader">
                 <div style="white-space: nowrap" class="drop-file">
                   Upload players from excel template
                 </div>
                 <div style="white-space: nowrap">
                   Upload roster excel template
                 </div>
                 <input
                   type="file"
                   ref="excelInput"
                   @input="
                    uploadExcelFile($event, false, product)
                  "
                 />
               </div>
             </form>
             <button
               :disabled="rosterDownloading"
               class="btn btn-light my-1 w-100"
               @click="downloadSampleTemplate(product ?? 144)"
             >
               Download Excel Template
             </button>
           </div>
           <div class="roster-table mt-4" >
             <div
               class="d-flex align-items-center mb-2"
               :class="{ 'justify-content-between': rosters.length }"
             >
               <h5 class="heading">Team Roster</h5>
               <button  class="btn btn-link p-0 text-dark" @click="clearRoster" v-if="rosters.length">
                 Clear All
               </button>
             </div>
             <RosterDetailsTable
               :players="rosters"
               :sizes="sizes"
               @addPlayer="() => addNewPlayer(true)"
               @updatePlayerField="updateRosterFields"
               @removePlayer="removePlayer"
               @changeQty="changeQty"
             />
           </div>
         </template>


          <div class="d-flex flex-column gap-2 cart-class">
            <button class="btn btn-dark w-100" @click="addToCart(false)">
              Add to Cart
            </button>
            <button class="btn btn-outline-dark w-100" @click="addToCart(true)">
              Save & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </modal>
</template>

<script lang="ts">
import { http } from "@/httpCommon";
import ErrorMessages from "@/mixins/ErrorMessages";
import RosterTabMixin from "@/mixins/RosterTabMixin";
import { Component, Mixins, Prop } from "vue-property-decorator";
import RosterDetailsTable from "./RosterDetailsTable.vue";
import { createDefaultPlayer } from '@/helpers/Helpers';



interface Player {
  text: string;
  number: string;
  quantity: number;
  size: string;
  information: null;
  size_index?: number;
  code?: string;
}
@Component({
  components: {
    RosterDetailsTable,
  },
  watch: {
    product: {
      handler(newVal) {
        if (newVal) {
          this.sizes = newVal.sizes ?? [];
          if(this.sizes.length) this.singlePlayer.size = this.sizes[0]?.name
          this.selectedSize = this.sizes.length ? this.sizes[0]?.name : null;
          this.addNewPlayer()
          this.activeImage = newVal.front_image ?? "";
          this.thumbs = [newVal.front_image, newVal.back_image].filter(Boolean);
        }
      },
      deep: true,
    },
  },
})
export default class PurchaseModal extends Mixins(
  ErrorMessages,
  RosterTabMixin
) {
  @Prop({ required: true }) readonly product!: Record<string, any>;
  public storageUrl = process.env.VUE_APP_STORAGE_URL;
  private sizes: { name: string; stock: number }[] = [];
  private selectedSize: string | null = null;
  private activeImage = "";
  private thumbs: string[] = [];
  private rosterDownloading = false;
  private uploadInBulk = false
  public singlePlayer: Player = { text: "", number: "", size: "", quantity: 1, size_index:0, code: "", information: null };


  created() {
    if (this.product) {
      this.sizes = this.product.sizes ?? [];
      this.selectedSize = this.sizes.length ? this.sizes[0].name : null;
      this.activeImage = this.product.front_image ?? "";
      this.thumbs = [this.product.front_image, this.product.back_image].filter(
        Boolean
      );
    }
  }
  get rosters(): Player[] {
    if (this.product) {
      const storeRosters = this.$store.getters.getShopProductRosters(
        this.product.id
      );
      return [...storeRosters];
    }
    return [];
  }

  private resetSinglePlayer():void{
    this.singlePlayer = { text: "", number: "", size: "", quantity: 1, code: "", size_index:0, information: null }
  }
  get isCustomerAuthenticated(): boolean {
    return this.$store.getters.isCustomerAuthenticated
  }
  public show(): void {
    if(this.sizes.length) this.singlePlayer.size = this.sizes[0].name
    this.$modal.show("purchaseModal");
  }
  public hide(): void {
    this.clearRoster()
    if (this.sizes.length > 0){
      this.selectedSize = this.sizes[0]?.name
    }
    this.uploadInBulk = false
    this.resetSinglePlayer()
    this.$modal.hide("purchaseModal");
    this.$emit('resetProduct');
  }
  public changeBulkStatus():void{
    this.uploadInBulk = true
    this.resetSinglePlayer()
  }
  public close(): void {
    this.$emit('hide');
    this.hide();
  }
  private addSinglePlayer(): void {
    const player = createDefaultPlayer(this.sizes, this.selectedSize);
    player.text = this.singlePlayer.text
    player.number = this.singlePlayer.number
    this.$store.commit("SET_SHOP_PRODUCTS_ROSTERS_UPDATE", {
      productId: this.product.id,
      roster: [player],
    });
  }
  private selectSize(size: string) {
    this.selectedSize = size;
    if (!this.uploadInBulk) {
      this.singlePlayer.size = size
    }
  }
  private selectThumb(src: string) {
    this.activeImage = src;
  }

  // public onRosterChange(player : Player, index:number){
  //   const existingRoster = this.$store.getters.getShopProductRosters(this.product.id);
  //   const updatedRoster = [...existingRoster];
  //   updatedRoster[index] = { ...player };
  //   const validatedRoster = this.validateRosterStock(this.product, updatedRoster);
  //   this.$store.commit("SET_SHOP_PRODUCTS_ROSTERS_UPDATE", {
  //     productId: this.product.id,
  //     roster: validatedRoster,
  //   });
  // }
  private validateRosterStock(product, roster: Player[]) {
    if (!product.manage_inventory && product.product_locker_room_id) return roster;

    const groupedBySize: Record<string, Player> = {};
    roster.forEach(player => {
      if (!groupedBySize[player.size]) {
        groupedBySize[player.size] = { ...player };
      } else {
        groupedBySize[player.size].quantity += player.quantity;
      }
    });
    return Object.values(groupedBySize).map(player => {
      const sizeObj = product.sizes.find(s => s.name === player.size);
      if (!sizeObj || sizeObj.stock < 0) return player;

      if (player.quantity > sizeObj.stock) {
        alert(
          `Only ${sizeObj.stock} items available for size ${player.size}. Adjusted your quantity.`
        );
        return { ...player, quantity: sizeObj.stock };
      }
      return player;
    });
  }
  public changeQty(index:number, change:number) : void{
    let updatedRoster = [
      ...this.$store.getters.getShopProductRosters(this.product.id),
    ];
    const rosterItem = updatedRoster[index];
    const newQty = rosterItem.quantity + change;
    if (newQty < 1) return;
    updatedRoster[index] = { ...rosterItem, quantity: newQty };
    // if (rosterItem.size){
    //   updatedRoster = this.validateRosterStock(this.product, updatedRoster);
    // }
    this.$store.commit("SET_SHOP_PRODUCTS_ROSTERS_UPDATE", {
      productId: this.product.id,
      roster: updatedRoster,
    });
  }
  public removePlayer(index: number): void {
    const updatedRoster = [
      ...this.$store.getters.getShopProductRosters(this.product.id),
    ];
    updatedRoster.splice(index, 1);
    this.$store.commit("SET_SHOP_PRODUCTS_ROSTERS_UPDATE", {
      productId: this.product.id,
      roster: updatedRoster,
    });
  }
  public updateRosterFields({index, fields,}: {
    index: number;
    fields: Record<string, any>;
  }): void {
    const updatedRoster = [
      ...this.$store.getters.getShopProductRosters(this.product.id),
    ];
    const rosterItem = updatedRoster[index];
    if (!rosterItem) return;
    updatedRoster[index] = { ...rosterItem, ...fields };
    this.$store.commit("SET_SHOP_PRODUCTS_ROSTERS_UPDATE", {
      productId: this.product.id,
      roster: updatedRoster,
    });
  }
  public clearRoster():void{
    this.$store.commit("SET_SHOP_PRODUCTS_ROSTERS_UPDATE", {
      productId: this.product.id,
      roster: [],
    });
    const input = this.$refs.excelInput as HTMLInputElement;
    if (input) {
      input.value = '';
    }
  }
  public addNewPlayer(useFirstSize = false): void {
    const sizeToUse = useFirstSize ? this.sizes[0]?.name ?? null : this.selectedSize ?? null;
    const newPlayer = createDefaultPlayer(this.sizes, sizeToUse);
    const updatedRoster = [
      ...this.$store.getters.getShopProductRosters(this.product.id),
      newPlayer,
    ];
    this.$store.commit("SET_SHOP_PRODUCTS_ROSTERS_UPDATE", {
      productId: this.product.id,
      roster: updatedRoster,
    });
  }
  // Add to cart
  public async addToCart(saveAndClose = false) {
    const hasShirtInfo = this.singlePlayer.text || this.singlePlayer.number;
    if (saveAndClose && !hasShirtInfo && !this.uploadInBulk) {
      this.close();
      return;
    }
      const cart_product = {
        ...this.product,
        sizes: this.sizes,
        selected_size: this.selectedSize,
        roster_detail: this.rosters,
        cart_uid: Date.now() + Math.random()
      };
      let cartData = {shop_product_id: this.product.id, roster_details: this.rosters, selected_size: this.selectedSize}
      let existingCart = JSON.parse(localStorage.getItem("cartData") || "[]");
      existingCart.push(cartData);
      this.$store.commit("SET_CART_DATA", existingCart);
      this.$store.commit("SET_SHOP_PRODUCTS_CART", cart_product);
      this.showToast("Product added to cart", 'success')
    if(saveAndClose){
      this.close()
    }else{
      this.$emit("addToCart");
    }
  }
  //
  public async downloadSampleTemplate(prod: any) {
    try {
      this.rosterDownloading = true;
      let param = ``
      if (prod.product_locker_room_id){
        param = `${prod.product_locker_room_id}?is_product_locker_room=true`;
      }

      if(prod.product_id) {
        param = `${prod.product_id}`;
      }

      if(!prod.product_locker_room_id && !prod.product_id) {
        param = `${prod.id}?is_custom=true`
      }

      await http
        .get(`template/download/${param}`, {
          responseType: "blob",
        })
        .then((res) => {
          const blob = new Blob([res.data], {
            type: res.headers["content-type"],
          });
          const link = document.createElement("a");
          const title = encodeURIComponent(this.product.name);
          link.href = window.URL.createObjectURL(blob);
          link.download = "product_" + title + "_template.xlsx";
          link.click();
        });
    } catch (err) {
      this.showError(`Error downloading template ${err.message}`);
    } finally {
      this.rosterDownloading = false;
    }
  }
  private saveClose() {
    this.close();
  }
}
</script>

<style scoped lang="scss">
.cart-class{
  margin-bottom: 3rem;
}

#modal-scrollable.vm--container {
  z-index: 9999;
}

// Mobile responsive styles for MerchantPurchaseModal
@media (max-width: 768px) {
  :global(.roster-modal.vm--container .vm--modal) {
    height: 90vh !important;
    max-height: 90vh !important;
    width: calc(100vw - 20px) !important;
    max-width: calc(100vw - 20px) !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    position: fixed !important;
  }
}
.product-main {
  height: 420px;
  max-width: 55%;
  background-color: #e9e9e9;
  border: 1px solid #e4e4e4;
  border-radius: 6px;
  display: flex; /* make it flexbox */
  justify-content: center; /* center horizontally */
  align-items: center;
  @media screen and (max-width: 768px) {
    max-width: 100%;
  }
  img {
    height: 80%;
    width: 100%;
    object-fit: contain;
    position: relative; /* keep it above the shadow */
    z-index: 1;
  }

  &::after {
    content: "";
    position: absolute;
    bottom: 137px;
    right: 300px;
    width: 30%;
    height: 25%;
    border-radius: 50%;
    background: radial-gradient(
      ellipse at center,
      rgba(0, 0, 0, 0.25) 0%,
      rgba(0, 0, 0, 0) 70%
    );
    z-index: 0;
    pointer-events: none;

  @media screen and (max-width: 768px) {
    right: 230px;

  }
  }
}

.thumbnails-wrap .thumb {
  width: 5rem;
  height: 5rem;
  object-fit: contain;
  background-color: #ffff;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  &.active {
    border: 1px solid black;
  }
}

.custom-gap {
  margin-right: -10%;
}

.roster-modal .modal-body {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}
.table-container {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 8px;
}

.team-roster-table {
  width: 100%;
  margin-bottom: 0;
  border-collapse: separate;
  border-spacing: 0;
}

.team-roster-table thead {
  background-color: #f8f9fa;
  text-align: center;
}

.team-roster-table td {
  border: 1px solid #dee2e6;
  padding: 0; /* make field fill cell */
  vertical-align: middle;
  text-align: left;
  height: 48px; /* consistent row height */
}

.team-roster-table input[type="text"],
.team-roster-table select,
.team-roster-table input[type="number"] {
  min-width: 100%;
  width: 100%;
  height: 100%; /* fill full cell height */
  border: none;
  background-color: transparent;
  outline: none;
  text-align: center;
  padding: 0;
  box-sizing: border-box;
}

.team-roster-table input[type="text"]:focus,
.team-roster-table select:focus,
.team-roster-table input[type="number"]:focus {
  outline: 2px solid black; /* active cell border */
  outline-offset: -2px; /* keeps border inside cell */
  transition: all 0.2s linear;
}

.team-roster-table .qty-controls input {
  width: 40px !important;
  text-align: center;
  border-left: 5px solid #dee2e6 !important;
  border-right: 5px solid #dee2e6 !important;
  height: 100%; /* align with row height */
}

.team-roster-table .btn-outline-secondary {
  border: 1px solid #dee2e6;
  color: #6c757d;
  padding: 0.25rem 0.5rem;
  height: 100%; /* match cell height */
  aspect-ratio: 1 / 1; /* keep square shape */
}
.team-roster-table .qty-controls {
  display: inline-flex;
  align-items: center;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  overflow: hidden;
}

.team-roster-table .qty-controls button {
  background-color: #d1d1d1; /* gray buttons like in screenshot */
  border: none;
  padding: 0.25rem 0.6rem;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
}

.team-roster-table .qty-controls input {
  width: 40px;
  text-align: center;
  border: none;
  outline: none;
  font-size: 1rem;
}

.team-roster-table .delete-btn {
  background-color: transparent;
  border: none;
  cursor: pointer;
}

.add-player-btn {
  border-radius: 6px;
}
.size-button {
  border-radius: 6px;
  border: 1px solid #ececec;
  background-color: white;
  color: #000;
  &.active {
    background-color: #000 !important;
    color: #fff !important;
    border-color: #000 !important;
  }
}
.heading {
  font-size: 20px;
  margin-bottom: 8px;
  font-weight: 400;
}

.excel-file-uploader {
  position: relative;
  background: #f8f9fa;
  border: 1px solid #f8f9fa;
  border-radius: 4px;
  padding: 10px 20px;
  color: #000;
  cursor: pointer;
  text-align: center;
  overflow: hidden;
  flex-shrink: 0;
  min-width: 190px;
  &:hover {
    background-color: #e2e6ea;
  }

  .drop-file {
    display: none;
  }

  &:hover {
    border-style: dashed;

    div:not(.drop-file) {
      display: none;
    }
    .drop-file {
      display: block;
    }
  }

  input {
    position: absolute;
    z-index: 100;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    appearance: none;
    display: block;
    height: 1000px;
    width: 1000px;
    opacity: 0;
    cursor: pointer;
  }
}
</style>
