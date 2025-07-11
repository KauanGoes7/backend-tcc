import http from 'http'
import express from 'express'

const app = express()
const port = 9090

const server = http.createServer(app)

server.listen(port, () => {
    return console.log(`App listening on port ${port}`)
})