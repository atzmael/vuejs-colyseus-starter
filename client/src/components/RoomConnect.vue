<template>
  <div class="roomConnect">
    <div v-if="$store.state.room == null" class="connection">
      <label>
        <p>Choisissez votre nom d'utilisateur</p>
        <input
          id="username"
          class="playername"
          ref="inputUsername"
          placeholder="Username"
          type="text"
          :value="username"
        />
      </label>

      <div class="sep"></div>

      <p>Créer une partie ou rejoignez vos amis !</p>
      <button class="btn create-btn" v-on:click="createRoom">Create</button>

      <label>
        <p>Entrez le code de la partie</p>
        <input ref="inputRoomID" :type="streamerMode ? 'password' : 'text'" />
      </label>

      <button class="btn join-btn" v-on:click="joinRoom">Join</button>
    </div>

    <div v-if="$store.state.room !== null">
      <button v-on:click="copyCode">Copier le code</button>

      <label>
        <p>Envoyez un message aux autres :)</p>
        <input ref="inputChat" />
      </label>

      <div class="conversations">
        <h3>Conversations</h3>
        <p v-for="conv in conversations" v-bind:key="conv">{{ conv }}</p>
      </div>

      <div class="notifications">
        <h3>Notifications</h3>
        <p v-for="notif in notifications" v-bind:key="notif">{{ notif }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";
import { Client } from "colyseus.js";
import { Store } from "vuex";
import { StoreState } from "@/interfaces/StoreState";

interface ServerPacket {
  type: string;
  content: any;
}

export default class HelloWorld extends Vue {
  $refs!: {
    inputUsername: HTMLInputElement;
    inputRoomID: HTMLInputElement;
    inputChat: HTMLInputElement;
  };
  $store!: Store<StoreState>;

  players: Array<{}> = [];

  username: string = "";
  notifications: Array<string> = [];
  conversations: Array<string> = [];

  unwatch!: any;

  created(): void {
    let item = localStorage.getItem("username");
    if (item) {
      this.username = item;
    }

    if (this.$store.state.client == null) {
      this.connectToServer();
    }
  }

  mounted(): void {
    document.addEventListener("keypress", (e) => this.sendChat(e));
  }

  async connectToServer(): Promise<void> {
    try {
      let client = await new Client("ws://localhost:2567");
      this.$store.commit("updateClient", client);
      console.log("Client initialized:", client);
    } catch (e) {
      console.log("Client couldn't be initialized:", e);
    }
  }

  bindServerListener(): void {
    // try reducing listener to avoid processus
    this.$store.state.room!.onMessage(
      "serverPacket",
      (packet: ServerPacket) => {
        switch (packet.type) {
          case "server_logs":
            console.log("Log from server:", packet.content);
            break;
          case "notifs":
            this.notifications.push(packet.content);
            // Limit the number of saved messages in array
            if (this.notifications.length > 5) {
              this.notifications.shift();
            }
            break;
          case "chat":
            this.conversations.push(packet.content);
            // Limit the number of saved messages in array
            if (this.conversations.length > 5) {
              this.conversations.shift();
            }
            break;
          case "your_infos":
            var datas = {
              player: packet.content,
              roomID: this.$store.state.room!.id,
              expiration: new Date().getTime() + 120 * 1000,
            };
            this.$store.commit("updateProfil", packet.content); // For testing $store usage in the /profil page

            localStorage.setItem(`player_infos`, JSON.stringify(datas));
            localStorage.setItem(
              `username`,
              this.$store.state.profil!.username
            );
            break;
        }
      }
    );
  }

  async createRoom(): Promise<void> {
    try {
      let room = await this.$store.state.client!.create("basic", {
        username: this.$refs.inputUsername.value,
        creator: true,
      });
      this.$store.commit("updateRoom", room);
      this.bindServerListener();
    } catch (e) {
      console.error("join error", e);
    }
  }

  async joinRoom(): Promise<void> {
    const itemStr = localStorage.getItem("player_infos");
    if (itemStr) {
      const item = JSON.parse(itemStr);
      const now = new Date();
      // compare the expiry time of the item with the current time
      if (now.getTime() > item.expiration) {
        // If the item is expired, delete the item from storage
        localStorage.removeItem("player_infos");
        this.connect();
      } else {
        if (this.$refs.inputRoomID.value != item.roomID) {
          this.connect();
        } else {
          this.reconnect(item);
        }
      }
    } else {
      this.connect();
    }
  }

  async connect(): Promise<void> {
    try {
      let room = await this.$store.state.client!.joinById(
        this.$refs.inputRoomID.value,
        {
          username: this.$refs.inputUsername.value,
        }
      );
      this.$store.commit("updateRoom", room);
      this.bindServerListener();
    } catch (e) {
      console.error("join error", e);
    }
  }

  async reconnect(item: any): Promise<void> {
    try {
      const room = await this.$store.state.client!.reconnect(
        this.$refs.inputUsername.value,
        item.data.id
      );
      this.$store.commit("updateRoom", room);
      this.bindServerListener();
    } catch (e) {
      console.error("join error", e);
    }
  }

  sendToServer(type: string, content: string): void {
    if (this.$store.state.room != null) {
      this.$store.state.room.send("clientPacket", {
        type: type,
        content: content,
      });
    }
  }

  copyCode(): void {
    console.log(this.$store.state.room!.id);
    const el = document.createElement("textarea");
    el.value = this.$store.state.room!.id;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
  }

  sendChat(e: any): void {
    if (this.$refs.inputChat !== undefined) {
      if (e.code === "Enter") {
        if (
          this.$refs.inputChat.value !== "" &&
          this.$store.state.profil !== null
        ) {
          this.sendToServer(
            "chat",
            this.$store.state.profil.username +
              ": " +
              this.$refs.inputChat.value
          );
          this.$refs.inputChat.value = "";
        }
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.btn {
  display: block;
  margin: 20px auto;
  position: relative;
  border: 1px solid black;
  border-radius: 0;
  background-color: white;
  padding: 8px 15px;
  text-transform: uppercase;
  cursor: pointer;

  &:hover {
    &:before {
      left: 4px;
      top: 4px;
    }
  }

  &:before {
    content: "";
    position: absolute;
    background-color: black;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: -1;
    transition: all 0.2s ease;
  }
}

.sep {
  height: 1px;
  background-color: black;
  display: block;
  width: 300px;
  max-width: 90%;
  margin: 20px auto;
}
</style>
