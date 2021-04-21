<template>
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
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator'
    @Component<RosterDetails>({})
    export default class RosterDetails extends Vue {}
</script>
