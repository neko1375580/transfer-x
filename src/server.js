import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import multer from 'multer'

const app = express()

app.use(cors())

const server = http.createServer(app)

const io = new Server(server,{
    cors:{
        origin:'*'
    }
})

const storage = multer.memoryStorage()

const upload = multer({
    storage
})

let devices = []

io.on('connection',(socket)=>{

  console.log(
    'Устройство подключено:',
    socket.id
  )

  const device = {

    id:socket.id,

    name:'Device-' + socket.id.slice(0,5),

    status:'ONLINE'

  }

  devices.push(device)

  io.emit('devices',devices)

  socket.on('disconnect',()=>{

    console.log(
      'Устройство отключено'
    )

    devices = devices.filter(
      item=>item.id !== socket.id
    )

    io.emit('devices',devices)

  })

})

app.post(
  '/upload',
  upload.single('file'),
  (req,res)=>{

    console.log(
      'Файл получен:',
      req.file.originalname
    )

    io.emit('new-file',{

        name:req.file.originalname,
        size:req.file.size

    })

    res.json({
        success:true
    })

})

const PORT = process.env.PORT || 3000

server.listen(PORT,()=>{

    console.log(
      'SERVER STARTED ON',
      PORT
    )

})