import http from 'http'
import express from 'express'
import cors from 'cors'
import { Server } from 'colyseus'
import { monitor } from '@colyseus/monitor'
import BasicRoom from './rooms/basic'

const port = Number(process.env.PORT) || 2567
const app = express()

app.use(cors())
app.use(express.json())

const server = http.createServer(app)
const gameServer = new Server({
    server,
})

app.use('/colyseus', monitor())

gameServer.define("basic", BasicRoom)

gameServer.listen(port)
console.log(`Listening on ws://localhost:${port}`)