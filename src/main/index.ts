import { app, shell, BrowserWindow, ipcMain, Tray, Menu, nativeImage } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import getActiveWindow from './script.js'
import axios from 'axios'
import path from 'path'

let mainWindow

function createWindow(): void {
  // Create the browser window.

  const { session } = require('electron')

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ['*']
      }
    })
  })

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 700,
    minWidth: 1200,
    minHeight: 700,
    maxWidth: 1200,
    maxHeight: 700,
    // show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      backgroundThrottling: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on("close", (event) => {
    event.preventDefault()
    mainWindow.hide()
  })
}

let tray: Tray | null = null

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  const image = nativeImage.createFromPath(
    path.join(__dirname, "../../resources/Wellify_2.png")
  );

  tray = new Tray(image.resize({ width: 16, height: 16}))
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show App", click: function () {
        mainWindow.show()
      }
    },
    {
      label: "Quit", click: function () {
        if (process.platform !== 'darwin') {
          mainWindow.destroy()
          app.quit()
        }
      }
    }
  ]);
  tray.setToolTip("Wellify")
  tray.setContextMenu(contextMenu)


  // IPC test
  ipcMain.on('ping', () => console.log('pong'))
  ipcMain.handle('internal:check', async () => {
    return "ok"
  })
  ipcMain.handle('internal:apiCheck', async (e, name) => {
    return (await axios.get(`https://api.nationalize.io/?name=${name}`)).data
  })
  ipcMain.handle('get-window', () => {
    return getActiveWindow()
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  // if (process.platform !== 'darwin') {
  //   app.quit()
  // }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
