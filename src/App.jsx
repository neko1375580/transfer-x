import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { QRCodeCanvas } from 'qrcode.react'
import './App.css'

const socket = io(
  'https://transfer-x.onrender.com'
)

function App(){

  const [files,setFiles] = useState([])
  const [sharedFiles,setSharedFiles] = useState([])
  const [devices,setDevices] = useState([])
  const [notification,setNotification] = useState('')
  const [tab,setTab] = useState('transfer')
  const [mobileMenu,setMobileMenu] = useState(false)
  const [loading,setLoading] = useState(true)
  
  useEffect(()=>{

  socket.on('devices',(data)=>{

    setDevices(data)

  })

  socket.on('new-file',(file)=>{

    setFiles(prev=>[
      ...prev,
      {
        name:file.name,
        size:(file.size / 1024 / 1024).toFixed(2),
        progress:100
      }
    ])

  })

  return ()=>{

    socket.off('devices')
    socket.off('new-file')

  }

},[])


 useEffect(()=>{

  async function loadFiles(){

    const res = await fetch(
      'https://transfer-x.onrender.com/files'
    )

    const data = await res.json()

    setSharedFiles(data.reverse())

  }

  loadFiles()

},[])

  const totalSize = files
    .reduce((acc,file)=>acc + Number(file.size),0)
    .toFixed(2)

  async function handleFiles(selectedFiles){

    const selected = Array.from(selectedFiles)

    for(const file of selected){

      const formData = new FormData()

      formData.append('file',file)

      await fetch(
        'https://transfer-x.onrender.com/upload',
        {
          method:'POST',
          body:formData
        }
      )

    }

    const newFiles = selected.map(file=>({

  name:file.name,

  size:(file.size / 1024 / 1024).toFixed(2),

  progress:100,

  url:
    'https://transfer-x.onrender.com/files/' +
    file.name

}))

    setFiles(prev=>[
      ...prev,
      ...newFiles
    ])

    if(newFiles.length > 0){

      setNotification(
        `${newFiles[0].name} отправлен`
      )

      setTimeout(()=>{

        setNotification('')

      },3000)

    }

  }

  function drop(e){

    e.preventDefault()

    handleFiles(
      e.dataTransfer.files
    )

  }

  return(

    <>

      <button
        className="menuBtn"
        onClick={()=>{
          setMobileMenu(!mobileMenu)
        }}
      >
        ☰
      </button>

      <div className="app">

        <div className="bg"></div>

        {

          notification && (

            <div className="notification">
              ✅ {notification}
            </div>

          )

        }

        <div className="topPanel">

          <div className="logo">
            ⚡ TRANSFER X
          </div>

          <div className="status">

            <div className="online"></div>

            <span>
              Подключено
            </span>

          </div>

          <div className="time">

            {
              new Date()
              .toLocaleTimeString()
            }

          </div>

        </div>

        <div
          className={`sidebar ${
            mobileMenu
            ? 'mobileOpen'
            : ''
          }`}
        >

          <button
            className={
              tab === 'transfer'
              ? 'active'
              : ''
            }

            onClick={()=>{

              setTab('transfer')
              setMobileMenu(false)

            }}
          >
            📤 Передача
          </button>

          <button
            className={
              tab === 'history'
              ? 'active'
              : ''
            }

            onClick={()=>{

              setTab('history')
              setMobileMenu(false)

            }}
          >
            🕘 История
          </button>

          <button
            className={
              tab === 'about'
              ? 'active'
              : ''
            }

            onClick={()=>{

              setTab('about')
              setMobileMenu(false)

            }}
          >
            💻 О приложении
          </button>

        </div>

        <div className="devices">

          <h2>
            Устройства
          </h2>

          {

            devices.map(device=>(

              <div
                className="deviceCard"
                key={device.id}
              >

                <div className="deviceIcon">
                  📱
                </div>

                <div>

                  <h3>
                    {device.name}
                  </h3>

                  <p>
                    {device.status}
                  </p>

                </div>

              </div>

            ))

          }

        </div>

        <div
          className="card"

          onDragOver={(e)=>{

            e.preventDefault()

          }}

          onDrop={drop}
        >

          <h1>

            TRANSFER X

            <span className="count">
              {files.length}
            </span>

          </h1>

          <p className="subtitle">
            Быстрая передача файлов
            между телефоном и ПК
          </p>

          {

            tab === 'transfer' && (

              <>

                <div className="qrWrapper">

                  <div className="qrBox">

                    <QRCodeCanvas
                      value="https://transfer-x-lyart.vercel.app"
                      size={220}
                      bgColor="#0f172a"
                      fgColor="#ffffff"
                    />

                  </div>

                  <div className="scanText">
                    Сканируйте QR код
                  </div>

                </div>

                <label className="upload">

                  <input
                    type="file"
                    multiple

                    onChange={(e)=>{

                      handleFiles(
                        e.target.files
                      )

                    }}
                  />

                  📁 Выбрать файлы

                </label>

                <div className="dropText">
                  Перетащите файлы сюда
                </div>

                <div className="stats">

                  <div className="stat">

                    <h2>
                      {files.length}
                    </h2>

                    <p>
                      Файлов
                    </p>

                  </div>

                  <div className="stat">

                    <h2>
                      {totalSize} MB
                    </h2>

                    <p>
                      Общий размер
                    </p>

                  </div>

                </div>

                <div className="files">

                  {

  sharedFiles.map((file,index)=>(

    <div
  className="file"
  key={index}
>

  <div className="left">

    <div className="icon">
      📄
    </div>

    <div>

      <h3>
        {file.name}
      </h3>

      <p>
        {file.size} MB
      </p>

    </div>

  </div>

  <div className="right">

    <a
      href={`https://transfer-x.onrender.com/download/${file.name}`}
      target="_blank"
      className="upload"
    >
      ⬇ Скачать
    </a>

  </div>

</div>

  ))

}

                </div>

                {

                  files.length > 0 && (

                    <button
  className="clearBtn"
  onClick={async ()=>{

    await fetch(
      'https://transfer-x.onrender.com/clear-files',
      {
        method:'DELETE'
      }
    )

    setFiles([])
    setSharedFiles([])

  }}
>
  Очистить список
</button>
                  )

                }

              </>

            )

          }

          {

            tab === 'history' && (

              <div className="history">

                <h2>
                  История
                </h2>

                {

                  files.length === 0

                  ?

                  <p>
                    История пуста
                  </p>

                  :

                  files.map((file,index)=>(

  <div
    className="historyItem"
    key={index}
  >

    <div className="historyLeft">

      <span>
        📄 {file.name}
      </span>

      <b>
        {file.size} MB
      </b>

    </div>

    <a
      className="downloadBtn"
      href={file.url}
      download={file.name}
      target="_blank"
    >
      ⬇ Скачать
    </a>

  </div>

))

                }

              </div>

            )

          }

          {


  tab === 'about' && (

    <div className="about">

      <h2>
        ⚡ TRANSFER X
      </h2>

      <p className="subtitle">
        Современная система
        передачи файлов между
        телефоном и ПК
      </p>

      <div className="stats">

        <div className="stat">

          <h2>
            v2.0
          </h2>

          <p>
            Версия
          </p>

        </div>

        <div className="stat">

          <h2>
            ONLINE
          </h2>

          <p>
            Статус
          </p>

        </div>

      </div>

      <div
        style={{
          marginTop:'25px',
          display:'flex',
          flexDirection:'column',
          gap:'15px',
          textAlign:'left'
        }}
      >

        <div className="file">

          <div className="left">

            <div className="icon">
              👨‍💻
            </div>

            <div>

              <h3>
                Разработчик
              </h3>

              <p>
                Санжар М Р
              </p>

            </div>

          </div>

        </div>

        <div className="file">

          <div className="left">

            <div className="icon">
              🏢
            </div>

            <div>

              <h3>
                Компания
              </h3>

              <p>
                TRANSFER X LABS
              </p>

            </div>

          </div>

        </div>

        <div className="file">

          <div className="left">

            <div className="icon">
              📜
            </div>

            <div>

              <h3>
                Лицензия
              </h3>

              <p>
                MIT License
              </p>

            </div>

          </div>

        </div>

        <div className="file">

          <div className="left">

            <div className="icon">
              ©️
            </div>

            <div>

              <h3>
                Права
              </h3>

              <p>
                © 2026 Все права защищены
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>

  )

}

        </div>

      </div>

    </>

  )

}

export default App