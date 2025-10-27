<template>
  <div class="table-container">
    <table class="table team-roster-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>No.</th>
          <th>Size</th>
          <th>Qty</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(player, index) in players" :key="`roster-${index}`">
          <td>
            <input type="text" class="cell-input" v-model="player.text"
                   @input="isCart && updatePlayerField(index, 'text', player.text)"/>
          </td>
          <td>
            <input
              type="text"
              class="cell-input"
              v-model="player.number"
              @input="onNumberInput(player, index)"
            />
          </td>
          <td>
            <select class="cell-input" v-model="player.size" @change="onRosterChange(player, index)" >
              <option v-for="size in sizes" :key="size.name" :value="size.name">
                {{ size.name }}
              </option>
            </select>
          </td>
          <td class="p-1">
            <div class="d-flex gap-1 align-items-center">
              <div class="qty-controls">
                <button class="qty-btn" @click="changeQty(index, -1)">-</button>
                <input
                  type="number"
                  class="cell-input text-center"
                  v-model.number="player.quantity"
                  min="1"
                  step="1"
                  @input="sanitizeQty(player, index)"
                />
                <button class="qty-btn" @click="changeQty(index, 1)">+</button>
              </div>

              <button v-if="players.length > 1 "
                class="btn btn-link p-0 delete-btn"
                @click="removePlayer(index)"
              >
                <img
                  src="@/assets/images/delete-icon.svg"
                  alt="Delete"
                  style="height: 20px; width: 20px"
                />
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="add-player-section">
      <button class="btn btn-light w-100 add-player-btn" @click="$emit('addPlayer')">
        <BIconPlus /> Add Player
      </button>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import {Component, Prop} from "vue-property-decorator";

interface Player {
  text: string;
  number: string;
  quantity: number;
  size: string;
  information: null;
  size_index?: number;
  code?: string;
}
@Component({})
export default class RosterDetailsTable extends Vue {
  @Prop({ type: Array, default: () => [] }) players: Player[];
  @Prop({ type: Array, default: () => [] }) sizes!: { name: string; stock: number }[];
  @Prop({ default: false }) readonly isCart!: boolean;
  private onRosterChange(player: Player, index: number): void {
    const size_index = this.sizes.findIndex(size => size.name === player.size);
    this.$emit("updatePlayerField", {
      index: index,
      fields: {
        size: player.size,
        size_index: size_index,
        code: player.size,
      },
    });
  }
  private removePlayer(index: number): void {
    this.$emit("removePlayer", index);
  }
  private onNumberInput(player, index):void{
    if (this.isCart) {
      this.$emit('updatePlayerField', {
        index,
        key: 'number',
        value: player.number,
      });
    }
  }
  private changeQty(index: number, change: number): void {
    this.$emit("changeQty", index, change);
  }
  private updatePlayerField(index: number, key:string ,value: any): void {
    this.$emit('updatePlayerField', { index, key, value });
  }
  private sanitizeQty(player: any, index: number): void {
    const cleaned = String(player.quantity).replace(/[^0-9]/g, "");
    player.quantity = cleaned ? Math.max(1, parseInt(cleaned, 10)) : 1;
    if (this.isCart) this.$emit('updatePlayerField', { index : index, key : 'quantity', value: player.quantity });
  }
}
</script>
<style scoped lang="scss">
.table-container {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  overflow: hidden;
}
.add-player-section {
  background-color: #f8f9fa;
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
.team-roster-table select:focus {
  outline: 2px solid black; /* active cell border */
  outline-offset: -2px; /* keeps border inside cell */
  transition: all 0.2s linear;
}

.team-roster-table .qty-controls input {
  min-width: 40px !important;
  width: 40px !important;
  text-align: center;
  border: none !important;
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
  border-radius: 0px 0px 6px;
}
</style>
