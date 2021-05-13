<template>
  <div class="home">
    <RoomConnect />
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import RoomConnect from "@/components/RoomConnect.vue";

@Options({
  components: {
    RoomConnect,
  },
})
export default class Home extends Vue {}
</script>