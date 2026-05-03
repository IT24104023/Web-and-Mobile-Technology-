const http = require('node:http')
const connectDB = require('./config/db')
const router = require('./routes/router')
require('dotenv').config()

connectDB()

const server = http.createServer(router)
server.listen(process.env.PORT, () => {
  console.log(`Server running at http://localhost:${process.env.PORT}`)
})
