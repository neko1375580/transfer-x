import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import multer from 'multer'

const process = globalThis.process

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

  storage,

  limits:{
    fileSize:1024 * 1024 * 500
  }

})

let devices = []

let uploadedFiles = []

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

  io.emit(
    'devices',
    devices
  )

  socket.emit(
    'all-files',
    uploadedFiles
  )

  socket.on('disconnect',()=>{

    console.log(
      'Устройство отключено'
    )

    devices = devices.filter(
      item=>item.id !== socket.id
    )

    io.emit(
      'devices',
      devices
    )

  })

})

app.post(
  '/upload',

  upload.single('file'),

  (req,res)=>{

    if(!req.file){

      return res.status(400).json({
        success:false
      })

    }

    const fileData = {

      id:Date.now(),

      name:req.file.originalname,

      size:req.file.size,

      type:req.file.mimetype,

      file:req.file.buffer.toString(
        'base64'
      )

    }

    uploadedFiles.push(fileData)

    console.log(
      'Файл получен:',
      req.file.originalname
    )


    io.emit(
      'new-file',
      fileData
    )

    res.json({
      success:true
    })

  }

)

app.get('/files',(req,res)=>{

  res.json(uploadedFiles)

})

app.get('/download/:name',(req,res)=>{

  const file = uploadedFiles.find(
    item=>item.name === req.params.name
  )

  if(!file){

    return res.status(404).json({
      error:'FILE NOT FOUND'
    })

  }

  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${file.name}"`
  )

  res.send(file.buffer)

})

app.delete('/clear-files',(req,res)=>{

  uploadedFiles = []

  io.emit('files-cleared')

  res.json({
    success:true
  })

})

const PORT =
  process.env.PORT || 3000

server.listen(PORT,()=>{

  console.log(
    'SERVER STARTED ON',
    PORT
  )

})