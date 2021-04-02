<template>
    <div>
        <b-button v-b-modal.modal-scrollable>Edit Roster</b-button>

        <b-modal id="modal-scrollable" scrollable title="Roster" content-class="roster-modal">
            <p class="my-4" v-for="i in 20" :key="i">
            Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis
            in, egestas eget quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
            </p>
        </b-modal>
    </div>
</template>

<script lang="ts">
    
    import { Component, Vue } from 'vue-property-decorator'

    @Component<EditRosterArea>({})

    export default class EditRosterArea extends Vue {}

</script>
