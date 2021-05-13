<template>
  <div class="main">
    <header>
      <ul>
        <li>
          <router-link :to="{ path: '/' }">Home</router-link>
        </li>
        <li>
          <router-link :to="{ path: '/about' }">About</router-link>
        </li>
        <li v-if="$store.state.profil != null">
          <router-link :to="{ path: '/profil' }">Profil</router-link>
        </li>
      </ul>
    </header>
    <router-view />
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { Store } from "vuex";
import { StoreState } from "@/interfaces/StoreState";
import RoomConnect from "./components/RoomConnect.vue";

@Options({
  components: {
    RoomConnect,
  },
})
export default class App extends Vue {
  $store!: Store<StoreState>;
}
</script>

<style lang="scss">
.main {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;

  header {
    ul {
      list-style-type: none;
      padding: 0;
    }
  }
}
</style>
