import { Profil, StoreState } from "@/interfaces/StoreState";
import { Client, Room } from "colyseus.js";
import { createStore } from "vuex";

export default createStore({
    state: {
        client: null,
        room: null,
        profil: null,
        settings: {
            streamerMode: false,
        },
    },
    mutations: {
        updateClient(state: StoreState, value: Client): void {
            state.client = value;
        },
        updateRoom(state: StoreState, value: Room): void {
            state.room = value;
        },
        updateProfil(state: StoreState, value: Profil): void {
            console.log(value);
            state.profil = value
        },
        updateSettings(state: StoreState, content: { index: string, value: any }): void {
            state.settings[content.index] = content.value
        }
    },
    actions: {},
    modules: {},
});