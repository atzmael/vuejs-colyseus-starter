import { Client, Room } from 'colyseus.js'

export interface StoreState {
    client: Client | null,
    room: Room | null,
    profil: Profil | null,
    settings: {
        [key: string]: any
        streamerMode: boolean,
    },
}

export interface Profil {
    id: string,
    username: string,
    creator: boolean,
    connected: boolean
}
