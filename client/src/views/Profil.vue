<template>
  <div class="about">
    <h2>Profil page</h2>
    <p>Bonjour {{ $store.state.profil.username }}</p>
    <label htmlFor="streamMode"
      >Stream mode
      <input
        id="streamMode"
        type="checkbox"
        v-on:change="() => $store.commit('updateSettings', { index: 'streamerMode', value: !$store.state.settings.streamerMode })"
        :checked="$store.state.settings.streamerMode"
    /></label>
  </div>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";
import { Store } from "vuex";
import { StoreState } from "@/interfaces/StoreState";

export default class About extends Vue {
  $store!: Store<StoreState>;
}
</script>