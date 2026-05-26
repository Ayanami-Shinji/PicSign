import { app, BrowserWindow, globalShortcut } from 'electron'
import path from 'path'
import { setupIPC } from './ipc'
import { installBundledFonts } from './font-installer'
import { initStore } from './store'

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 750,
    minWidth: 800,
    minHeight: 600,
    title: 'PicSign - 照片签名工具',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../index.html'))
  }

  mainWindow.webContents.on('before-input-event', (_event, input) => {
    const modifier = process.platform === 'darwin' ? input.meta : input.control
    if (modifier && input.shift && (input.key === 'I' || input.key === 'i')) {
      mainWindow?.webContents.toggleDevTools()
    }
    if (modifier && input.shift && (input.key === 'R' || input.key === 'r')) {
      mainWindow?.webContents.reload()
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(async () => {
  await initStore()
  installBundledFonts()
  createWindow()
  setupIPC()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
