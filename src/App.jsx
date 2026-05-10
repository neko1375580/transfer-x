import { io } from 'socket.io-client'
import './index.css'
import { QRCodeCanvas } from 'qrcode.react'
import { useState, useEffect } from 'react'
const socket = io(
  'https://transfer-x.onrender.com'
)
function App(){

  socket.on('connect',()=>{

    socket.on('devices',(data)=>{

  setDevices(data)

})

  console.log('CONNECTED')

})

  const [files,setFiles] = useState([])
  const [drag,setDrag] = useState(false)
  const [notification,setNotification] = useState('')
  const [dark,setDark] = useState(true)
  const [devices,setDevices] = useState([])
  const [tab,setTab] = useState('transfer')

  const [sounds,setSounds] = useState(true)
  const [autoSync,setAutoSync] = useState(false)

  const [loading,setLoading] = useState(true)

  useEffect(()=>{

    const loader = setTimeout(()=>{
      setLoading(false)
    },2500)

    return ()=>clearTimeout(loader)

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

    size:(
      file.size / 1024 / 1024
    ).toFixed(2),

    progress:100

  }))

  setFiles(prev=>[
    ...prev,
    ...newFiles
  ])

  if(newFiles.length > 0){

    if(sounds){

      const audio = new Audio('/notify.mp3')

      audio.volume = 0.5

      audio.play()

    }

    setNotification(
      `${newFiles[0].name} успешно отправлен`
    )

    setTimeout(()=>{

      setNotification('')

    },3000)

  }

}

  function drop(e){
    e.preventDefault()
    setDrag(false)

    handleFiles(e.dataTransfer.files)
  }

  if(loading){

    return(

      <div className="loaderScreen">

        <div className="loaderLogo">
          ⚡
        </div>

        <h1>TRANSFER X</h1>

        <div className="loaderBar">

          <div className="loaderFill"></div>

        </div>

        <p>Запуск системы...</p>

      </div>

    )

  }

  return(

    <div className={`app ${dark ? 'dark' : 'light'}`}>

      <div className="bg"></div>

      {
        notification &&

        <div className="notification">
          ✅ {notification}
        </div>
      }

      <div className="topPanel">

        <div className="logo">
          ⚡ TRANSFER X
        </div>

        <div className="status">

          <div className="online"></div>

          <span>Подключено</span>

        </div>

        <div className="time">
          {new Date().toLocaleTimeString()}
        </div>

      </div>

      <div className="sidebar">

        <button
          className={tab === 'transfer' ? 'active' : ''}
          onClick={()=>setTab('transfer')}
        >
          📤 Передача
        </button>

        <button
          className={tab === 'history' ? 'active' : ''}
          onClick={()=>setTab('history')}
        >
          🕘 История
        </button>

        <button
          className={tab === 'settings' ? 'active' : ''}
          onClick={()=>setTab('settings')}
        >
          ⚙ Настройки
        </button>

        <button
          className={tab === 'about' ? 'active' : ''}
          onClick={()=>setTab('about')}
        >
          💻 О приложении
        </button>

        <button
          onClick={()=>setDark(!dark)}
        >
          🌙 Тема
        </button>

      </div>

      <div className="devices">

  <h2>Устройства</h2>

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

          <h3>{device.name}</h3>

          <p>{device.status}</p>

        </div>

      </div>

    ))

  }

</div>

      <div
        className={`card ${drag ? 'dragging' : ''} fade`}

        onDragOver={(e)=>{
          e.preventDefault()
          setDrag(true)
        }}

        onDragLeave={()=>{
          setDrag(false)
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
          Быстрая передача файлов между телефоном и ПК
        </p>

        {
          tab === 'history' && (

            <div className="history">

              <h2>История передач</h2>

              {
                files.length === 0

                ?

                <p className="empty">
                  История пуста
                </p>

                :

                files.map((file,index)=>(

                  <div
                    className="historyItem"
                    key={index}
                  >

                    <span>
                      📄 {file.name}
                    </span>

                    <b>
                      {file.size} MB
                    </b>

                  </div>

                ))
              }

            </div>

          )
        }

        {
          tab === 'settings' && (

            <div className="settings">

              <h2>Настройки</h2>

              <div className="setting">

                <div>

                  <h3>Звуки</h3>

                  <p>
                    Уведомления приложения
                  </p>

                </div>

                <button
                  className={
                    sounds
                    ? 'toggle activeToggle'
                    : 'toggle'
                  }

                  onClick={()=>{
                    setSounds(!sounds)
                  }}
                >
                  {sounds ? 'ON' : 'OFF'}
                </button>

              </div>

              <div className="setting">

                <div>

                  <h3>Cloud Sync</h3>

                  <p>
                    Синхронизация файлов
                  </p>

                </div>

                <button
                  className={
                    autoSync
                    ? 'toggle activeToggle'
                    : 'toggle'
                  }

                  onClick={()=>{
                    setAutoSync(!autoSync)
                  }}
                >
                  {autoSync ? 'ON' : 'OFF'}
                </button>

              </div>

            </div>

          )
        }

        {
  tab === 'about' && (

    <div className="about">

      <div className="aboutLogo">
        ⚡
      </div>

      <h2>TRANSFER X</h2>

      <p className="aboutText">
        Современное desktop приложение
        для быстрой передачи файлов
        между телефоном и ПК.
      </p>

      <div className="aboutGrid">

        <div className="aboutCard">

          <span>Версия</span>

          <h3>v2.0</h3>

        </div>

        <div className="aboutCard">

          <span>Статус</span>

          <h3>ONLINE</h3>

        </div>

      </div>

      <div className="aboutInfo">

        <div className="infoRow">

          <span>Разработчик</span>

          <b>Санжар М Р</b>

        </div>

        <div className="infoRow">

          <span>Компания</span>

          <b>TRANSFER X LABS</b>

        </div>

        <div className="infoRow">

          <span>Лицензия</span>

          <b>MIT License</b>

        </div>

        <div className="infoRow">

          <span>Права</span>

          <b>© 2026 Все права защищены</b>

        </div>

        <div className="infoRow">

          <span>Поддержка</span>

          <b>Windows / Android</b>

        </div>

      </div>

    </div>

  )
}

{
  tab === 'transfer' && (

    <>

              <div className="qrWrapper">

                <div className="qrGlow"></div>

                <div className="qrBox">

                  <QRCodeCanvas
                    value="https://transfer-x-lyart.vercel.app"
                    size={230}
                    bgColor="#0f172a"
                    fgColor="#ffffff"
                    level="H"
                    includeMargin={true}
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
                  onChange={(e)=>handleFiles(e.target.files)}
                />

                📁 Выбрать файлы

              </label>

              <div className="dropText">
                Перетащите файлы сюда
              </div>

              <div className="stats">

                <div className="stat">
                  <h2>{files.length}</h2>
                  <p>Файлов</p>
                </div>

                <div className="stat">
                  <h2>{totalSize} MB</h2>
                  <p>Общий размер</p>
                </div>

              </div>

              <div className="files">

                {files.map((file,index)=>(

                  <div className="file" key={index}>

                    <div className="left">

                      <div className="icon">

                        {
                          file.name.includes('.png') ||
                          file.name.includes('.jpg')
                          ? '🖼️'

                          : file.name.includes('.mp4')
                          ? '🎬'

                          : file.name.includes('.mp3')
                          ? '🎵'

                          : '📄'
                        }

                      </div>

                      <div>

                        <h3>{file.name}</h3>

                        <p>{file.size} MB</p>

                      </div>

                    </div>

                    <div className="right">

                      <span>
                        {file.progress}%
                      </span>

                      <div className="speed">
                        24 MB/s
                      </div>

                      <div className="progress">

                        <div
                          className="bar"
                          style={{
                            width:`${file.progress}%`
                          }}
                        ></div>

                      </div>

                    </div>

                  </div>

                ))}

              </div>

              <button
                className="clearBtn"
                onClick={()=>setFiles([])}
              >
                Очистить список
              </button>

            </>
          )
}

      </div>

    </div>

  )
}

export default App