import { Room, Client } from "colyseus";
import { Schema, MapSchema, type } from "@colyseus/schema";

class Player extends Schema {
    @type("string")
    id: string;

    @type("string")
    username: string;

    @type("boolean")
    creator: boolean = false;

    @type("boolean")
    connected: boolean = true;
}

class RoomState extends Schema {
    @type({ map: Player })
    players = new MapSchema<Player>();
}

export default class BasicRoom extends Room<RoomState> {
    // When room is initialized
    onCreate(options: any): void {
        console.log("Room created:", this.roomId);
        this.setState(new RoomState);

        this.onMessage("clientPacket", (client, datas) => {
            console.log("Room received packet of type (", datas.type, ") from:", client.sessionId, " =>", datas.content);

            switch (datas.type) {
                case "chat":
                    this.ownBroadcast(datas);
                    break;
            }
        });
    }

    // When client successfully join the room
    onJoin(client: Client, options: any): void {
        let newPlayer = new Player({
            id: client.sessionId,
            username: options ? options.username : "Utilisateur",
            creator: options.creator
        })
        this.state.players.set(client.sessionId, newPlayer);

        // Send to the client who joined
        client.send("serverPacket", { type: "your_infos", content: newPlayer });

        this.ownBroadcast({ type: "notifs", content: `${newPlayer.username} a rejoint la partie !` });
    }

    // When a client leaves the room
    async onLeave(client: Client, consented: boolean): Promise<void> {
        // flag client as inactive for other users
        this.state.players.get(client.sessionId).connected = false;

        try {
            if (consented) {
                throw new Error("consented leave");
            }

            // allow disconnected client to reconnect into this room until 20 seconds
            await this.allowReconnection(client, 20);

            // client returned! let's re-activate it.
            this.state.players.get(client.sessionId).connected = true;

        } catch (e) {
            this.state.players.delete(client.sessionId);
        }
    }

    // Cleanup callback, called after there are no more clients in the room. (see `autoDispose`)
    onDispose(): void { }

    ownBroadcast(datas: { type: string, content: any }): void {
        this.broadcast("serverPacket", datas)
    }
}